import { createSignal } from 'solid-js'
import { Mesh } from 'three'
import { useFrame } from 'solid-three'
import { T } from 'solid-three'

export function RotatingCube(props) {
  const [rotation, setRotation] = createSignal(0)

  let mesh!: Mesh

  useFrame(() => {
    setRotation((rotation) => rotation + 0.01)
  })

  const [color, setColor] = createSignal('red')

  return (
    <T.Mesh
      rotation-x={rotation()}
      ref={mesh}
      {...props}
      onPointerEnter={() => setColor('blue')}
      onPointerLeave={() => setColor('red')}>
      <T.BoxGeometry />
      <T.MeshStandardMaterial color={color()} />
    </T.Mesh>
  )
}
