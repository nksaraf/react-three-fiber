import { createControls } from 'solid-leva'
import { useNavigate } from 'solid-start'
import { TextGeometry } from 'three-stdlib'
import { Board } from '~/components/Board'
import { PerspectiveCamera } from '~/components/PerspectiveCamera'
import { Tree } from '~/components/Tree'
import { makeThreeComponent } from '~/trinity'
import { Text3D } from './Text3D'

function Plane() {
  return (
    <T.Mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position-y={-5}>
      <T.PlaneBufferGeometry args={[100, 100]} />
      <T.MeshStandardMaterial color={'indianred'} />
    </T.Mesh>
  )
}
export default function Hello() {
  const navigate = useNavigate()
  const boardControls = createControls('game', {
    rotation: [0, 1, 0],
    position: [-10, 0, 10],
  })

  const lightControls = createControls('light', {
    rotation: [0, 1, 0],
    position: [10, 20, 10],
    color: '#020910',
    camera: [2, 25, 31],
  })

  return (
    <>
      <PerspectiveCamera position={lightControls.camera} />
      <T.Group rotation={boardControls.rotation} position={boardControls.position}>
        <Board />
      </T.Group>
      <Plane />
      <Tree />
      <T.AmbientLight intensity={0.5} />
      <T.SpotLight
        penumbra={1.5}
        position={lightControls.position}
        rotation={lightControls.rotation}
        angle={1.3}
        intensity={1}
        castShadow
      />
      <Text3D
        onPointerDown={() => navigate('/game/abc')}
        lineHeight={0.5}
        letterSpacing={-0.025}
        position={[-25, 0, -25]}
        size={9}
        height={5}
        color={lightControls.color}
        rotation={[-0.2, -Math.PI / 10, 0]}>{`Chessbase`}</Text3D>
    </>
  )
}
