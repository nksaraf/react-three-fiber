import * as React from 'react'
import * as THREE from 'three'
import { View, ViewProps, ViewStyle, LayoutChangeEvent, StyleSheet, PixelRatio } from 'react-native'
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import { UseStore } from 'zustand'
import pick from 'lodash-es/pick'
import omit from 'lodash-es/omit'
import { extend, render, unmountComponentAtNode, RenderProps } from './index'
import { createTouchEvents } from './events'
import { RootState } from '../core/store'
import { EventManager } from '../core/events'

export interface Props extends Omit<RenderProps<View>, 'size' | 'events'>, ViewProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  style?: ViewStyle
  events?: (store: UseStore<RootState>) => EventManager<any>
}

type SetBlock = false | Promise<null> | null
type UnblockProps = {
  set: React.Dispatch<React.SetStateAction<SetBlock>>
  children: React.ReactNode
}

const CANVAS_PROPS = [
  'gl',
  'events',
  'size',
  'shadows',
  'linear',
  'flat',
  'orthographic',
  'frameloop',
  'performance',
  'clock',
  'raycaster',
  'camera',
  'onPointerMissed',
  'onCreated',
]

function Block({ set }: Omit<UnblockProps, 'children'>) {
  React.useLayoutEffect(() => {
    set(new Promise(() => null))
    return () => set(false)
  }, [])
  return null
}

class ErrorBoundary extends React.Component<{ set: React.Dispatch<any> }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError = () => ({ error: true })
  componentDidCatch(error: any) {
    this.props.set(error)
  }
  render() {
    return this.state.error ? null : this.props.children
  }
}

export const Canvas = /*#__PURE__*/ React.forwardRef<View, Props>(
  ({ children, fallback, style, events, ...props }, forwardedRef) => {
    // Create a known catalogue of Threejs-native elements
    // This will include the entire THREE namespace by default, users can extend
    // their own elements by using the createRoot API instead
    React.useMemo(() => extend(THREE), [])

    const [{ width, height }, setSize] = React.useState({ width: 0, height: 0 })
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null)
    const [bind, setBind] = React.useState()

    const canvasProps = pick(props, CANVAS_PROPS)
    const viewProps = omit(props, CANVAS_PROPS)
    const [block, setBlock] = React.useState<SetBlock>(false)
    const [error, setError] = React.useState<any>(false)

    // Suspend this component if block is a promise (2nd run)
    if (block) throw block
    // Throw exception outwards if anything within canvas throws
    if (error) throw error

    const onLayout = React.useCallback((e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout
      setSize({ width, height })
    }, [])

    const onContextCreate = React.useCallback((context: ExpoWebGLRenderingContext) => {
      const canvasShim = {
        width: context.drawingBufferWidth,
        height: context.drawingBufferHeight,
        style: {},
        addEventListener: (() => {}) as any,
        removeEventListener: (() => {}) as any,
        clientHeight: context.drawingBufferHeight,
        getContext: (() => context) as any,
      } as HTMLCanvasElement

      setCanvas(canvasShim)
    }, [])

    // Execute JSX in the reconciler as a layout-effect
    React.useLayoutEffect(() => {
      if (width > 0 && height > 0 && canvas) {
        // Overwrite onCreated to apply RN bindings
        const onCreated = (state: RootState) => {
          // Bind events after creation
          setBind(state.events.connected.getEventHandlers())

          // Bind render to RN bridge
          const context = state.gl.getContext() as ExpoWebGLRenderingContext
          const renderFrame = state.gl.render.bind(state.gl)
          state.gl.render = (scene: THREE.Scene, camera: THREE.Camera) => {
            renderFrame(scene, camera)
            context.endFrameEXP()
          }

          return canvasProps?.onCreated?.(state)
        }

        render(
          <ErrorBoundary set={setError}>
            <React.Suspense fallback={<Block set={setBlock} />}>{children}</React.Suspense>
          </ErrorBoundary>,
          canvas,
          {
            ...canvasProps,
            // expo-gl can only render at native dpr/resolution
            // https://github.com/expo/expo-three/issues/39
            dpr: PixelRatio.get(),
            size: { width, height },
            events: events || createTouchEvents,
            onCreated,
          },
        )
      }
    }, [width, height, children, canvas, canvasProps, events])

    React.useEffect(() => {
      return () => unmountComponentAtNode(canvas!)
    }, [canvas])

    return (
      <View {...viewProps} ref={forwardedRef} onLayout={onLayout} style={{ flex: 1, ...style }} {...bind}>
        {width > 0 && <GLView onContextCreate={onContextCreate} style={StyleSheet.absoluteFill} />}
      </View>
    )
  },
)
