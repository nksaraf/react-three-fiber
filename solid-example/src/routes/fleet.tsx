import { Ships } from '../components/ShipPiece'
import { Model } from '../components/Ship'
import { T, useFrame, createRef } from 'solid-three'
import { algebraic, BLACK, file, KING, KNIGHT, rank, ROOK, SQUARES, WHITE } from '../lib/chess'
import { Board, makeChessMove } from '../components/Board'
import { Square, Squareinstances } from '../components/Square'
import { ModernPiece } from '../components/ModernPiece'
import { PerspectiveCamera } from '../components/PerspectiveCamera'
import * as THREE from 'three'
import { createComputed, createEffect } from 'solid-js'
import { Submarine } from '~/components/Submarine'
import { transformControls, TransformControls } from '~/components/TransformControls'
import { Stats } from '~/components/Stats'
let conteext = createContext()

import { makeInstanceComponents } from '../components/instancing'
const Boids = makeInstanceComponents()

function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref) {
        ref.current = value
      }
    })
  }
}

const Swarm = () => {
  const positions = new Array<Signal<Vector3>>()

  for (let i = 0; i < 5000; i++) {
    positions.push(
      createSignal<Vector3>(new Vector3(Math.random() * 50 - 25, Math.random() * 50 - 25, Math.random() * 50 - 25), {
        equals: false,
      }),
    )
  }

  const animatePositions = () => {
    for (const [_, setPos] of positions) {
      setPos((pos) => {
        pos.x += 0.05
        return pos
      })
    }
  }

  useFrame(() => batch(animatePositions))

  return (
    <>
      <Boids.Root>
        <T.MeshStandardMaterial color="green" />
        <T.BoxGeometry />
      </Boids.Root>

      <For each={positions}>{([pos]) => <Boids.Instance position={pos()} />}</For>
    </>
  )
}

import { animate } from 'popmotion'
import { getPiece } from '~/lib/chess/state'
import { getGame } from '~/lib/game'
import { useTheatreControls } from '~/components/theatre'
import { Cruise } from '~/components/Cruise'
import { Carrier } from '~/components/Carrier'
import { CarrierInstance, Instances } from '~/components/CarrierInstances'
import { Group, Mesh, Vector3 } from 'three'
import { Signal } from 'solid-js'
import { MathUtils } from 'three'

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

  let theatreControls = useTheatreControls('sub', {
    x: 0,
    y: 25,
    z: 10,
  })

  let ref = createRef()
  const [selected, setSelected] = createSignal(true)

  // useFrame((stte) => {
  //   console.log(stte.gl.info)
  // })

  return (
    <conteext.Provider
      value={{
        setPiece(square, mesh) {
          refs[square] = mesh
        },
      }}>
      <Suspense>
        <Instances>
          <Squareinstances.Root receiveShadow>
            <T.MeshToonMaterial color="aqua" transparent opacity={0.6} />
            <T.BoxBufferGeometry args={[10, 2, 10]} />
          </Squareinstances.Root>
          <T.Group position={[-35, 0, -35]}>
            {/* <Submarine
          position={[theatreControls.x, theatreControls.y, theatreControls.z]}
          rotation={[0, Math.atan((20 - 10) / (50 - 70)), 0]}
        /> */}
            <Board
              pieceComponent={PieceMap}
              squareComponent={WaterSquare}
              squareSize={10}
              onMove={(move, refs, oldState) => {
                const squareFrom = algebraic(move.from)
                const squareTo = algebraic(move.to)
                const x = file(move.to)
                const z = rank(move.to)
                const oldx = file(move.from)
                const oldz = rank(move.from)
                let el = refs[squareFrom]
                let capturedPiece = refs[squareTo]

                console.log(el)
                makeChessMove(move)

                if (el && el.userData.onMove) {
                  el.userData.onMove(move, {
                    position: [x * 10, z * 10],
                    prevPosition: [oldx * 10, oldz * 10],
                    capturedPiece,
                    el,
                  })
                }
                if (capturedPiece && capturedPiece.userData.onCapture) {
                  capturedPiece.userData.onCapture(move, {
                    position: [x * 10, z * 10],
                    prevPosition: [oldx * 10, oldz * 10],
                    capturingPiece: el,
                  })
                }

                refs[squareTo] = el
                refs[squareFrom] = null
              }}
            />
          </T.Group>
        </Instances>
      </Suspense>
      <div style="position:absolute; top:0">
        Hell world<button onClick={() => setSelected((s) => !s)}>Click</button>
      </div>
      {/* <Show when={selected()}>
        <Submarine
          position={[0, -9.428874413842612, 0]}
          ref={(el) =>
            transformControls(el, {
              onChange: (event) => {
                console.log(event.target)
                navigator.clipboard.writeText(`position={[${event.target.object.position.toArray()}]}`)
              },
            })
          }
        />
      </Show> */}
      {/* <T.Mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.75, 0]}>
        <T.BoxBufferGeometry args={[100, 100]} />
        <T.MeshStandardMaterial color="aqua" transparent opacity={0.5} />
      </T.Mesh>
      {/* <T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <T.PlaneBufferGeometry args={[100, 100]} />
        <T.MeshLambertMaterial color="darkblue" />
      </T.Mesh> */}
      <T.Mesh position={[0, 1, 0]} geometry={geom()}>
        <T.MeshStandardMaterial color="aqua" transparent opacity={0.2} />
      </T.Mesh>
      <PerspectiveCamera position={[0, 33, 1.5]} zoom={0.5} />
      {/* <Swarm /> */}
      <Stats />
    </conteext.Provider>
  )
}

const SubmarineKnights = (props) => {
  const [local, instanceProps] = splitProps(props, ['ref'])
  let leader = createRef<Group>(),
    follower1,
    follower2

  useFrame(() => {
    if (!leader.current) return
    if (follower1) {
      follower1.position.x = leader.current.position.x + (props.piece === WHITE ? 2 : -2)
      follower1.position.z = leader.current.position.z + (props.piece === WHITE ? 2 : -2)
      follower1.position.y = leader.current.position.y
      follower1.rotation.y = leader.current.rotation.y
    }
    if (follower2) {
      follower2.position.x = leader.current.position.x - (props.piece === WHITE ? 2 : -2)
      follower2.position.z = leader.current.position.z + (props.piece === WHITE ? 2 : -2)
      follower2.position.y = leader.current.position.y
      follower2.rotation.y = leader.current.rotation.y
    }
  })

  let [square, setSquare] = createSignal(props.square)

  useFrame(() => {
    if (
      getGame().hoveredSquare != 'none' &&
      getGame().hoveredSquare != square() &&
      getGame().selectedSquare == square()
    ) {
      const x = file(SQUARES[getGame().hoveredSquare])
      const z = rank(SQUARES[getGame().hoveredSquare])
      const oldx = file(SQUARES[square()])
      const oldz = rank(SQUARES[square()])
      let rotation = Math.atan((x * 10 - oldx * 10) / (z * 10 - oldz * 10)) + (props.color === BLACK ? Math.PI : 0)
      leader.current.rotation.y = MathUtils.lerp(leader.current.rotation.y, rotation, 0.2)
    }
  })

  createEffect(() => {
    if (getGame().selectedSquare === square()) {
      onCleanup(() => {
        dance(async () => {
          await step({
            from: leader.current.rotation.y,
            to: props.color === BLACK ? Math.PI : 0,
            duration: 1000,
            onUpdate: (v) => {
              leader.current.rotation.y = v
            },
          })
        })
      })
    }
  })
  return (
    <>
      <Submarine
        {...props}
        ref={follower1}
        rotation={[0, props.color === BLACK ? Math.PI : 0, 0]}
        scale={0.7}
        position={[props.position[0] + 2, props.position[1], props.position[2]]}
      />
      <Submarine
        {...props}
        rotation={[0, props.color === BLACK ? Math.PI : 0, 0]}
        scale={0.7}
        ref={follower2}
        position={[props.position[0] - 2, props.position[1], props.position[2]]}
      />
      <Submarine
        {...props}
        ref={mergeRefs(local.ref, leader)}
        rotation={[0, props.color === BLACK ? Math.PI : 0, 0]}
        userData={{
          onMove(move, { el, position: [x, z], prevPosition: [oldx, oldz] }) {
            props.onMove?.(move, { el, position: [x, z], prevPosition: [oldx, oldz] })
            let rotation =
              Math.atan((x * 10 - oldx * 10) / (z * 10 - oldz * 10)) + (props.color === BLACK ? Math.PI : 0)
            dance(async () => {
              await step({
                from: el.position.y,
                to: el.position.y - 2,
                duration: 1000,
                onUpdate: (v) => {
                  el.position.y = v
                },
              })
              await step({
                from: el.rotation.y,
                to: rotation,
                duration: 1000,
                onUpdate: (v) => {
                  el.rotation.y = v
                },
              })

              await Promise.all([
                step({
                  from: el.position.x,
                  to: x,
                  duration: 1000,
                  onUpdate: (v) => {
                    el.position.x = v
                  },
                }),
                step({
                  from: el.position.z,
                  to: z,
                  duration: 1000,
                  onUpdate: (v) => {
                    el.position.z = v
                  },
                }),
              ])

              await step({
                from: el.rotation.y,
                to: props.color === BLACK ? Math.PI : 0,
                duration: 1000,
                onUpdate: (v) => {
                  el.rotation.y = v
                },
              })

              await step({
                from: el.position.y,
                to: el.position.y + 2,
                duration: 1000,
                onUpdate: (v) => {
                  el.position.y = v
                },
              })
            })
          },
        }}
        position={[props.position[0], props.position[1], props.position[2]]}
      />
    </>
  )
}

let pieceMap = {
  [KNIGHT]: {
    [WHITE]: SubmarineKnights,
    [BLACK]: SubmarineKnights,
  },
  [KING]: {
    [WHITE]: () => null,
  },
  [ROOK]: {
    [WHITE]: (props) => {
      let leader = createRef<Group>(),
        follower1,
        follower2
      let [square, setSquare] = createSignal(props.square)

      useFrame(() => {
        if (
          getGame().hoveredSquare != 'none' &&
          getGame().hoveredSquare != square() &&
          getGame().selectedSquare == square()
        ) {
          const x = file(SQUARES[getGame().hoveredSquare])
          const z = rank(SQUARES[getGame().hoveredSquare])
          const oldx = file(SQUARES[square()])
          const oldz = rank(SQUARES[square()])
          let rotation = Math.atan((x * 10 - oldx * 10) / (z * 10 - oldz * 10)) + (props.color === WHITE ? Math.PI : 0)
          leader.current.rotation.y = MathUtils.lerp(leader.current.rotation.y, rotation, 0.2)
        }
      })

      createEffect(() => {
        if (getGame().selectedSquare === square()) {
          onCleanup(() => {
            dance(async () => {
              await step({
                from: leader.current.rotation.y,
                to: props.color === WHITE ? Math.PI : 0,
                duration: 1000,
                onUpdate: (v) => {
                  leader.current.rotation.y = v
                },
              })
            })
          })
        }
      })

      return (
        <>
          <CarrierInstance
            {...props}
            ref={leader}
            rotation={[0, Math.PI, 0]}
            position={[props.position[0] + 3, props.position[1], props.position[2]]}
          />
          <CarrierInstance
            {...props}
            rotation={[0, Math.PI, 0]}
            position={[props.position[0] - 3, props.position[1], props.position[2]]}
          />
        </>
      )
    },
    [BLACK]: (props) => {
      return (
        <>
          <CarrierInstance {...props} position={[props.position[0] + 3, props.position[1], props.position[2]]} />
          <CarrierInstance {...props} position={[props.position[0] - 3, props.position[1], props.position[2]]} />
        </>
      )
    },
  },
}

async function dance(run: () => Promise<void>) {
  run()
}
async function step(props: Parameters<typeof animate>[0]) {
  return new Promise((res, rej) =>
    animate({
      ...props,
      onComplete() {
        props.onComplete?.()
        res(null)
      },
    }),
  )
}
function PieceMap(props) {
  const [local, instanceProps] = splitProps(props, ['ref'])
  const [op, setOp] = createSignal(0.1)
  let otherRef

  return (
    <>
      <ModernPiece {...instanceProps} scale={2.25} ref={otherRef} opacity={op()} />
      <Dynamic
        component={pieceMap[props.piece]?.[props.color] ?? T.Group}
        {...instanceProps}
        onMove={(move, { position: [x, z] }) => {
          otherRef.position.x = x
          otherRef.position.z = z
        }}
        onCapture={(move, { position: [x, z] }) => {}}
        ref={local.ref}
      />
    </>
  )
}

function WaterSquare(props) {
  return <Square light="aqua" dark="darkblue" {...props} />
}
