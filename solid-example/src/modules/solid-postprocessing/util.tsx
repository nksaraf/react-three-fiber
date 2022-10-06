import { BlendFunction, Effect } from 'postprocessing'
import { Vector2 } from 'three'
import { useThree } from 'solid-three'
import { EffectPrimitive } from './EffectPrimitive'
import { Accessor, ParentProps } from 'solid-js'

type DefaultProps = Partial<{ blendFunction: BlendFunction; opacity: number }>

export const wrapEffect = <T extends new (...args: any[]) => Effect>(
  effectImpl: T,
  defaultBlendMode: BlendFunction = BlendFunction.NORMAL,
) =>
  function Wrap(props: ParentProps<DefaultProps & ConstructorParameters<T>[0]>) {
    const invalidate = useThree((state) => state.invalidate)
    const getEffect: Accessor<Effect> = createMemo(() => new effectImpl(props))

    createEffect(() => {
      let effect = getEffect()
      effect.blendMode.blendFunction =
        !props.blendFunction && props.blendFunction !== 0 ? defaultBlendMode : props.blendFunction
      if (props.opacity !== undefined) effect.blendMode.opacity.value = props.opacity
      invalidate()
    })

    return <EffectPrimitive ref={props.ref} object={getEffect()} />
  }

export const useVector2 = (props: any, key: string): Accessor<Vector2> => {
  return createMemo(() => {
    let vec = props[key]
    if (vec instanceof Vector2) {
      return new Vector2().set(vec.x, vec.y)
    } else if (Array.isArray(vec)) {
      const [x, y] = vec
      return new Vector2().set(x, y)
    }
  })
}
