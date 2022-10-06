import { GlitchEffect, GlitchMode, SepiaEffect } from 'postprocessing'
import { createControls } from 'solid-leva'
import { Outlet } from 'solid-start'
import { OrbitControls } from '~/lib/OrbitControls'
import { EffectComposer, Pixelation } from '@/solid-postprocessing/EffectsComposer'
import { EffectPrimitive } from '@/solid-postprocessing/EffectPrimitive'
import { Outline } from '@/solid-postprocessing/Outline'
import { Selection } from '@/solid-postprocessing/Selection'
import { useVector2, wrapEffect } from '@/solid-postprocessing/util'
import { useThree, Vector2 } from 'solid-three'
import { Canvas } from 'solid-three/web/Canvas'

export const Sepia = wrapEffect(SepiaEffect)

export type GlitchProps = ConstructorParameters<typeof GlitchEffect>[0] &
  Partial<{
    mode: typeof GlitchMode[keyof typeof GlitchMode]
    active: boolean
    delay: Vector2
    duration: Vector2
    chromaticAberrationOffset: Vector2
    strength: Vector2
  }>

export function Glitch(props: GlitchProps) {
  const invalidate = useThree((state) => state.invalidate)
  const delay = useVector2(props, 'delay')
  const duration = useVector2(props, 'duration')
  const strength = useVector2(props, 'strength')
  const effect = createMemo(
    () => new GlitchEffect({ ...props, delay: delay(), duration: duration(), strength: strength() }),
  )
  createRenderEffect(() => {
    effect().mode = props.active ? props.mode || GlitchMode.CONSTANT_WILD : GlitchMode.DISABLED
    invalidate()
  })
  return <EffectPrimitive object={effect()} />
}

export default function App() {
  const controls = createControls('effects', {
    pixelation: { value: 30, step: 1 },
    sepia: false,
  })
  return (
    <div style="width: 100vw;height:100vh">
      <Canvas>
        <OrbitControls makeDefault />
        <Suspense
          fallback={
            <EffectComposer>
              <Pixelation granularity={controls.pixelation} />
            </EffectComposer>
          }>
          <Selection>
            <Outlet />
            <EffectComposer autoClear={false}>
              {/* <DepthOfField focusDistance={0} focalLength={0.05} bokehScale={2} height={480} /> */}
              <Outline edgeStrength={10} />
            </EffectComposer>
          </Selection>
        </Suspense>
      </Canvas>
    </div>
  )
}
