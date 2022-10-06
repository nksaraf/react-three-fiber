import { ComponentProps, ParentProps } from 'solid-js'
import { T, useThree } from 'solid-three'

export const PerspectiveCamera = (props: ParentProps<ComponentProps<typeof T.PerspectiveCamera>>) => {
  const set = useThree(({ set }) => set)
  const camera = useThree(({ camera }) => camera)
  const size = useThree(({ size }) => size)

  let cam: THREE.PerspectiveCamera

  createEffect(() => {
    cam.aspect = size().width / size().height
    cam.updateProjectionMatrix()
  })

  createEffect(() => {
    const oldCam = untrack(() => camera())
    set()({ camera: cam })
    onCleanup(() => set()({ camera: oldCam }))
  })

  return <T.PerspectiveCamera ref={cam} far={1000} near={0.1} fov={75} position={props.position as any} {...props} />
}
