import { JSXElement } from 'solid-js'
import { ThreeTypes, useThree, Instance, ParentContext, prepare, useInstance, useStore } from 'solid-three'
import * as THREE from 'three'
import { TransformControls as TransformControlsImpl } from 'three-stdlib'

function usePrimitive(object, props) {
  const store = useStore()

  /* Prepare instance */
  const instance = createMemo(() => {
    let obj = prepare(object())
    obj.__r3f.root = store
    console.log({ obj })
    return obj
  })

  useInstance(instance, props)
  return instance
}

export function Primitive<T>(props: { object: T; children?: JSXElement }) {
  let instance = usePrimitive(() => props.object, props)

  return <ParentContext.Provider value={instance}>{props.children}</ParentContext.Provider>
}

export type TransformControlsProps = ThreeTypes.Object3DNode<TransformControlsImpl, typeof TransformControlsImpl> &
  JSX.IntrinsicElements['group'] & {
    object?: THREE.Object3D | React.MutableRefObject<THREE.Object3D>
    enabled?: boolean
    axis?: string | null
    domElement?: HTMLElement
    mode?: string
    translationSnap?: number | null
    rotationSnap?: number | null
    scaleSnap?: number | null
    space?: string
    size?: number
    showX?: boolean
    showY?: boolean
    showZ?: boolean
    children?: React.ReactElement<THREE.Object3D>
    camera?: THREE.Camera
    onChange?: (e?: THREE.Event) => void
    onMouseDown?: (e?: THREE.Event) => void
    onMouseUp?: (e?: THREE.Event) => void
    onObjectChange?: (e?: THREE.Event) => void
  }

export function transformControls(el, props) {
  const defaultControls = useThree((state) => state.controls)
  const gl = useThree((state) => state.gl)
  const events = useThree((state) => state.events)
  const defaultCamera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  // const explCamera = camera || defaultCamera
  const controls = createMemo(() => new TransformControlsImpl(defaultCamera(), events().connected || gl().domElement))
  // const group = React.useRef<THREE.Group>()

  const transformOnlyPropNames = [
    'enabled',
    'axis',
    'mode',
    'translationSnap',
    'rotationSnap',
    'scaleSnap',
    'space',
    'size',
    'showX',
    'showY',
    'showZ',
  ]

  const [transformProps, objectProps] = splitProps(props, transformOnlyPropNames)

  createEffect(() => {
    if (el) {
      controls().attach(el instanceof THREE.Object3D ? el : el.current)
      console.log(controls())
    }
    // else if (group.current instanceof THREE.Object3D) {
    // controls.attach(group.current)
    // }

    onCleanup(() => void controls().detach())
  })

  createEffect(() => {
    const callback = (e: THREE.Event) => {
      props.onChange?.(e)
    }

    controls().addEventListener?.('change', callback)
    if (props.onMouseDown) controls().addEventListener?.('mouseDown', props.onMouseDown)
    if (props.onMouseUp) controls().addEventListener?.('mouseUp', props.onMouseUp)
    if (props.onObjectChange) controls().addEventListener?.('objectChange', props.onObjectChange)

    onCleanup(() => {
      controls().removeEventListener?.('change', callback)
      if (props.onMouseDown) controls().removeEventListener?.('mouseDown', props.onMouseDown)
      if (props.onMouseUp) controls().removeEventListener?.('mouseUp', props.onMouseUp)
      if (props.onObjectChange) controls().removeEventListener?.('objectChange', props.onObjectChange)
    })
  })

  createEffect(() => {
    if (defaultControls()) {
      const callback = (event) => (defaultControls().enabled = !event.value)
      controls().addEventListener('dragging-changed', callback)
      onCleanup(() => controls().removeEventListener('dragging-changed', callback))
    }
  })

  onCleanup(() => controls().dispose())

  usePrimitive(() => controls(), transformProps)
}

export const TransformControls = (
  // { children, domElement, onChange, onMouseDown, onMouseUp, onObjectChange, object, ...props },
  props,
) => {
  const transformOnlyPropNames = [
    'enabled',
    'axis',
    'mode',
    'translationSnap',
    'rotationSnap',
    'scaleSnap',
    'space',
    'size',
    'showX',
    'showY',
    'showZ',
  ]

  const [transformProps, objectProps] = splitProps(props, transformOnlyPropNames)
  const defaultControls = useThree((state) => state.controls)
  const gl = useThree((state) => state.gl)
  const events = useThree((state) => state.events)
  const defaultCamera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const controls = createMemo(() => new TransformControlsImpl(defaultCamera(), events().connected || gl().domElement))

  createEffect(() => {
    if (props.object) {
      controls().attach(props.object instanceof THREE.Object3D ? props.object : props.object.current)
      console.log(controls())
    }
    // else if (group.current instanceof THREE.Object3D) {
    // controls.attach(group.current)
    // }

    onCleanup(() => void controls().detach())
  })

  createEffect(() => {
    if (defaultControls()) {
      const callback = (event) => (defaultControls().enabled = !event.value)
      controls().addEventListener('dragging-changed', callback)
      onCleanup(() => controls().removeEventListener('dragging-changed', callback))
    }
  })

  createEffect(() => {
    const callback = (e: THREE.Event) => {
      invalidate()
      props.onChange?.(e)
    }

    controls().addEventListener?.('change', callback)
    if (props.onMouseDown) controls().addEventListener?.('mouseDown', props.onMouseDown)
    if (props.onMouseUp) controls().addEventListener?.('mouseUp', props.onMouseUp)
    if (props.onObjectChange) controls().addEventListener?.('objectChange', props.onObjectChange)

    onCleanup(() => {
      controls().removeEventListener?.('change', callback)
      if (props.onMouseDown) controls().removeEventListener?.('mouseDown', props.onMouseDown)
      if (props.onMouseUp) controls().removeEventListener?.('mouseUp', props.onMouseUp)
      if (props.onObjectChange) controls().removeEventListener?.('objectChange', props.onObjectChange)
    })
  })

  return <Primitive object={controls()} {...transformProps} />
}
