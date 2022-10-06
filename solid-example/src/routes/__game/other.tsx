import { createSignal } from 'solid-js'
import { Mesh } from 'three'
import T, { onAnimationFrame } from '~/trinity'

export function RotatingCube(props) {
  const [rotation, setRotation] = createSignal(0)

  let mesh!: Mesh

  onAnimationFrame(() => {
    setRotation((rotation) => rotation + 0.01)
  })

  return (
    <T.Mesh rotation-x={[rotation()]} ref={mesh}>
      <T.BoxGeometry />
      <T.MeshStandardMaterial color={props.color} />
    </T.Mesh>
  )
}

export default function App() {
  return <RotatingCube color="green" />
}
