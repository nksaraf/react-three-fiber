import { OutlineEffect } from 'postprocessing'
import { Object3D } from 'three'
import { useThree } from 'solid-three'
import { EffectComposerContext } from './EffectsComposer'
import { EffectPrimitive } from './EffectPrimitive'
import { selectionContext } from './Selection'
import { useContext } from 'solid-js'

export type OutlineProps = ConstructorParameters<typeof OutlineEffect>[2] &
  Partial<{
    selection: Object3D | Object3D[]
    selectionLayer: number
  }>

export function Outline(props: OutlineProps) {
  props = mergeProps({ selection: [], selectionLayer: 10 }, props)
  const invalidate = useThree((state) => state.invalidate)
  const { scene, camera } = useContext(EffectComposerContext)

  const effect = createMemo(() => new OutlineEffect(scene(), camera(), props))

  const api = useContext(selectionContext)

  createEffect(() => {
    // Do not allow array selection if declarative selection is active
    // TODO: array selection should probably be deprecated altogether
    if (!api && props.selection) {
      effect().selection.set(Array.isArray(props.selection) ? props.selection : [props.selection])
      invalidate()
      onCleanup(() => {
        effect().selection.clear()
        invalidate()
      })
    }
  })

  createEffect(() => {
    effect().selectionLayer = props.selectionLayer
    invalidate()
  })

  createEffect(() => {
    let eff = effect()
    if (api && api.enabled) {
      if (api.selected?.length) {
        effect().selection.set(api.selected)
        invalidate()
        onCleanup(() => {
          effect().selection.clear()
          invalidate()
        })
      }
    }
  })

  return <EffectPrimitive object={effect()} />
}
