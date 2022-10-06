import { Effect } from 'postprocessing'
import { Ref, useContext } from 'solid-js'
import { EffectComposerContext } from './EffectsComposer'

export function EffectPrimitive(props: { object: Effect; ref?: Ref<Effect> }) {
  const parent = useContext(EffectComposerContext)

  // createRenderEffect(() => {
  //   if (typeof props.ref === 'function') {
  //     props.ref(props.object)
  //   }
  // })

  createRenderEffect(() => {
    if (props.object && parent.setEffects) {
      let obj = props.object
      parent.setEffects((el) => [...el, obj])
      onCleanup(() => {
        parent.setEffects((el) => el.filter((el) => el != obj))
      })
    }
  })

  return null
}
