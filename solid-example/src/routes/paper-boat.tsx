import { Ships } from '../components/ShipPiece'
import { Model } from '../components/Ship'
import { T, useFrame } from 'solid-three'
import { algebraic, file, KING, rank } from '../lib/chess'
import { Board, makeChessMove } from '../components/Board'
import { Square } from '../components/Square'
import { ModernPiece } from '../components/ModernPiece'
import { PerspectiveCamera } from '../components/PerspectiveCamera'
import * as THREE from 'three'

let conteext = createContext()

export default function ShipPage() {
  const geom = createMemo(() => {
    let g = new THREE.PlaneGeometry(100, 100, 50, 50)
    g.rotateX(-Math.PI * 0.5)
    let vertData = []
    let v3 = new THREE.Vector3() // for re-use
    for (let i = 0; i < g.attributes.position.count; i++) {
      v3.fromBufferAttribute(g.attributes.position, i)
      vertData.push({
        initH: v3.y,
        amplitude: THREE.MathUtils.randFloatSpread(2),
        phase: THREE.MathUtils.randFloat(0, Math.PI),
      })
    }

    useFrame((s) => {
      vertData.forEach((vd, idx) => {
        let y = vd.initH + Math.sin(s.clock.getElapsedTime() + vd.phase) * vd.amplitude
        g.attributes.position.setY(idx, y)
      })
      g.attributes.position.needsUpdate = true
      g.computeVertexNormals()
    })
    onCleanup(() => {
      g.dispose()
    })
    return g
  })

  let animating = []
  let refs = {}
  useFrame(() => {
    animating.forEach((a) => a())
  })
  return (
    <conteext.Provider
      value={{
        setPiece(square, mesh) {
          refs[square] = mesh
        },
      }}>
      <T.Group position={[-20, 0, -20]}>
        <Board
          pieceComponent={P}
          squareComponent={WaterSquare}
          squareSize={5}
          onMove={(move, refs, oldState) => {
            makeChessMove(move)

            const squareFrom = algebraic(move.from)
            const squareTo = algebraic(move.to)
            const x = file(move.to)
            const z = rank(move.to)
            let el = refs[squareFrom]
            let piece = refs[squareTo]

            refs[squareTo] = el
            refs[squareFrom] = null
            function animate() {
              el.rotation.y = THREE.MathUtils.lerp(el.rotation.y, Math.PI, 0.1)

              el.position.x = THREE.MathUtils.lerp(el.position.x, x * 5, 0.1)
              el.position.z = THREE.MathUtils.lerp(el.position.z, z * 5, 0.1)

              if (Math.abs(el.position.x - x * 5) < 0.1 && Math.abs(el.position.z - z * 5) < 0.1) {
                el.position.x = x * 5
                el.position.z = z * 5
                console.log('done animation')
                animating.splice(animating.indexOf(animate), 1)
              }
            }

            function an2() {
              if (piece) {
                piece.position.y = THREE.MathUtils.lerp(piece.position.y, -5, 0.1)
                if (piece.position.y < -4.9) {
                  piece.position.x = 50 + Math.random() * 20 - 10
                  piece.position.z = 20 + Math.random() * 20 - 10
                  piece.position.y = 1
                  piece.rotation.x = Math.random() * Math.PI
                  piece.rotation.y = Math.random() * Math.PI
                  piece.rotation.z = Math.random() * Math.PI
                  animating.splice(animating.indexOf(an2), 1)
                }
              }
            }

            animating.push(animate)
            animating.push(an2)
          }}
        />
      </T.Group>
      {/* <T.Mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.75, 0]}>
        <T.BoxBufferGeometry args={[100, 100]} />
        <T.MeshStandardMaterial color="aqua" transparent opacity={0.5} />
      </T.Mesh> */}
      <T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <T.PlaneBufferGeometry args={[100, 100]} />
        <T.MeshLambertMaterial color="darkblue" />
      </T.Mesh>
      <T.Mesh position={[0, 1, 0]} geometry={geom()}>
        <T.MeshStandardMaterial color="aqua" transparent opacity={0.4} />
      </T.Mesh>
      <PerspectiveCamera position={[0, 33, 2]} zoom={0.8} />
    </conteext.Provider>
  )
}

function P(props) {
  let ref, otherRef
  // let { setPiece, getPiece } = useContext(conteext)

  // createEffect(() => {
  //   setPiece(props.square, ref)
  // })
  // onCleanup(() => {
  //   setPiece(props.square, null)
  // })
  const [op, setOp] = createSignal(0.1)

  useFrame(() => {
    otherRef.position.copy(ref.position)
    if (otherRef.position.y < -4.5) {
      setOp(THREE.MathUtils.lerp(op(), 0, 0.1))
    }
  })
  return (
    <T.Group>
      <Ships {...props} rotation={[0, Math.PI / 2, 0]} ref={(el) => ((ref = el), props.ref?.(el))} scale={1.5} />
      <ModernPiece {...splitProps(props, ['ref'])[1]} ref={otherRef} scale={1.5} opacity={op()} />
    </T.Group>
  )
}
function WaterSquare(props) {
  return <Square light="aqua" dark="darkblue" {...props} />
}
