import { makeThreeComponent, T, useLoader } from 'solid-three'
import { Font, FontLoader, TextGeometry } from 'three-stdlib'
import { Show } from 'solid-js'

export const TextGeometryComponent = makeThreeComponent(TextGeometry)

export function Text3D(props) {
  const font = useLoader(FontLoader, '/comic_mono.json')

  createResource<Font>(async () => await new FontLoader().loadAsync('/comic_mono.json'))
  let c = children(() => props.children)
  return (
    <T.Mesh castShadow receiveShadow {...props}>
      <Show when={font()}>
        {/* {(font) => <TextGeometryComponent args={[c() as string, { font, size: props.size, height: props.height }]} />} */}
      </Show>
      <T.MeshToonMaterial color={props.color} />
    </T.Mesh>
  )
}
