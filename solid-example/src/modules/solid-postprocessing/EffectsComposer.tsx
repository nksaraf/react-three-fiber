import {
  DepthDownsamplingPass,
  Effect,
  EffectComposer as EffectComposerImpl,
  EffectPass,
  NormalPass,
  RenderPass,
} from 'postprocessing'
import { Accessor, JSX, createContext } from 'solid-js'
import { HalfFloatType, TextureDataType } from 'three'
import { isWebGL2Available } from 'three-stdlib'
import { Instance, T, useFrame, useThree } from 'solid-three'

export const EffectComposerContext = createContext<{
  composer: Accessor<{
    downSamplingPass: DepthDownsamplingPass
    normalPass: NormalPass
    effectComposer: EffectComposerImpl
  }>
  camera: Accessor<THREE.Camera>
  scene: Accessor<THREE.Scene>
  resolutionScale?: Accessor<number>
  setEffects?: (setter: (effs: Effect[]) => Effect[]) => void
}>(null)

export type EffectComposerProps = {
  enabled?: boolean
  children: JSX.Element | JSX.Element[]
  depthBuffer?: boolean
  disableNormalPass?: boolean
  stencilBuffer?: boolean
  autoClear?: boolean
  resolutionScale?: number
  multisampling?: number
  frameBufferType?: TextureDataType
  renderPriority?: number
  camera?: THREE.Camera
  scene?: THREE.Scene
}

export function EffectComposer(props: EffectComposerProps) {
  props = mergeProps(
    {
      enabled: true,
      renderPriority: 1,
      autoClear: true,
      multisampling: 8,
      frameBufferType: HalfFloatType,
    },
    props,
  )

  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  const composer = createMemo(() => {
    const webGL2Available = isWebGL2Available()
    // Initialize composer
    const effectComposer = new EffectComposerImpl(gl(), {
      depthBuffer: props.depthBuffer,
      stencilBuffer: props.stencilBuffer,
      multisampling: props.multisampling > 0 && webGL2Available ? props.multisampling : 0,
      frameBufferType: props.frameBufferType,
    })

    // Add render pass
    effectComposer.addPass(new RenderPass(scene(), camera()))

    // Create normal pass
    let downSamplingPass = null
    let normalPass: NormalPass = null
    if (!props.disableNormalPass) {
      normalPass = new NormalPass(scene(), camera())
      normalPass.enabled = false
      effectComposer.addPass(normalPass)
      if (props.resolutionScale !== undefined && webGL2Available) {
        downSamplingPass = new DepthDownsamplingPass({
          normalBuffer: normalPass.texture,
          resolutionScale: props.resolutionScale,
        })
        downSamplingPass.enabled = false
        effectComposer.addPass(downSamplingPass)
      }
    }

    return { effectComposer, normalPass, downSamplingPass }
  })

  createEffect(() => composer().effectComposer.setSize(size().width, size().height))
  useFrame(
    (_, delta) => {
      if (props.enabled) {
        gl().autoClear = props.autoClear
        composer().effectComposer.render(delta)
      }
    },
    props.enabled ? props.renderPriority : 0,
  )

  let group: Instance
  const [effects, setEffects] = createSignal([])
  createEffect(() => {
    let effectPass
    if (group && group.__r3f && composer().effectComposer) {
      let effs = effects()
      console.log(effs)
      effectPass = new EffectPass(camera(), ...effs)
      effectPass.renderToScreen = true
      composer().effectComposer.addPass(effectPass)
      if (composer().normalPass) composer().normalPass.enabled = true
      if (composer().downSamplingPass) composer().downSamplingPass.enabled = true
    }
    onCleanup(() => {
      console.log('cleaning up')
      if (effectPass) composer().effectComposer?.removePass(effectPass)
      if (composer().normalPass) composer().normalPass.enabled = false
      if (composer().downSamplingPass) composer().downSamplingPass.enabled = false
    })
  })

  return (
    <EffectComposerContext.Provider
      value={{
        composer,
        resolutionScale() {
          return props.resolutionScale
        },
        camera,
        scene,
        setEffects,
      }}>
      <T.Group ref={group}>{props.children}</T.Group>
    </EffectComposerContext.Provider>
  )
}

import { PixelationEffect } from 'postprocessing'

export type PixelationProps = {
  granularity?: number
}

export function Pixelation(props: PixelationProps) {
  console.log(useContext(EffectComposerContext))
  /** Because GlitchEffect granularity is not an object but a number, we have to define a custom prop "granularity" */
  const effect = createMemo(() => new PixelationEffect(untrack(() => props.granularity)))

  createEffect(() => {
    effect().setGranularity(props.granularity)
  })

  return <EffectPrimitive object={effect()} />
}

import { DepthOfFieldEffect } from 'postprocessing'
import { Texture, Vector3 } from 'three'
import { EffectPrimitive } from './EffectPrimitive'

type DOFProps = ConstructorParameters<typeof DepthOfFieldEffect>[1] &
  Partial<{
    target: Vector3
    depthTexture: {
      texture: Texture
      packing: number
    }
    blur: number
  }>

export function DepthOfField(props: DOFProps) {
  const invalidate = useThree((state) => state.invalidate)
  const { camera } = useContext(EffectComposerContext)
  const effect = createMemo(() => new DepthOfFieldEffect(camera(), props))
  createRenderEffect(() => {
    if (props.target) {
      let target = props.target
      const vec: Vector3 =
        target instanceof Vector3
          ? new Vector3().set(target.x, target.y, target.z)
          : new Vector3().set(target[0], target[1], target[2])
      effect().target = vec
    }
    // if (props.depthTexture) effect().setDepthTexture(depthTexture.texture, depthTexture.packing)
    invalidate()
  })
  return <EffectPrimitive object={effect()} />
}
