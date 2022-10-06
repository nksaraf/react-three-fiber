import { createControls } from 'solid-leva'
import { Style } from 'solid-start'
import { Vector3 } from 'three'
import { PerspectiveCamera } from '~/components/PerspectiveCamera'
import { Tree } from '~/components/Tree'
import { useGLTF } from '~/lib/useGLTF'
import { Select } from '@/solid-postprocessing/Selection'
import { useFrame } from 'solid-three'

export default function Hello() {
  const lightControls = createControls('light', {
    rotation: [0, 1, 0],
    position: [10, 20, 10],
    color: '#020910',
    camera: [2, 8, 25],
  })

  let group
  let acceleration = new Vector3(0, -0.4, 0)
  let velocity = new Vector3(0, 0, 0)
  useFrame((state, delta) => {
    velocity.y = velocity.y + acceleration.y * delta
    group.position.y = group.position.y + velocity.y

    if (group.position.y < 0) {
      velocity.y = -velocity.y * 0.9
      group.position.y = 0
    }
  })

  return (
    <>
      <Style>{`#leva__root { display: none }`}</Style>
      <PerspectiveCamera position={lightControls.camera} />
      <Tree position={[-15, 0, 0]} rotation-y={Math.random()} />
      <Tree position={[15, 0, 0]} rotation-y={Math.random()} />
      <Tree position={[-12, 0, 10]} rotation-y={Math.random()} />
      <Tree position={[17, 0, -8]} rotation-y={Math.random()} />
      <Select enabled>
        <Basketball
          onPointerDown={() => {
            velocity.y = 0.2
          }}
          name="PolySphere001"
          ref={group}
          position={[0, 10, 0]}
        />
      </Select>
      <Plane />
      <T.AmbientLight intensity={0.5} />
      <T.SpotLight
        penumbra={1.5}
        position={lightControls.position}
        rotation={lightControls.rotation}
        angle={1.3}
        intensity={1}
        castShadow
      />
    </>
  )
}

function Basketball(props) {
  const [gltf] = useGLTF('/bouncing_basketball.glb')
  return (
    <T.Group {...props}>
      <Show when={gltf()}>
        <T.Mesh
          castShadow
          receiveShadow
          material={gltf().materials.basketball}
          geometry={gltf().nodes.PolySphere001_basketball_0.geometry}
        />
      </Show>
    </T.Group>
  )
}

function Plane() {
  return (
    <T.Mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <T.PlaneBufferGeometry args={[100, 100]} />
      <T.MeshStandardMaterial color={'indianred'} />
    </T.Mesh>
  )
}
