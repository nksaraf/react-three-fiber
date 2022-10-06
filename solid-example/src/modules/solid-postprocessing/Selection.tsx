import { children, ComponentProps, ParentProps, Setter } from 'solid-js'
import * as THREE from 'three'
import { T, Instance } from 'solid-three'

export type Api = {
  selected: THREE.Object3D[]
  select: Setter<THREE.Object3D<THREE.Event>[]>
  enabled: boolean
}
export type SelectApi = ComponentProps<typeof T.Group> & {
  enabled?: boolean
}

export const selectionContext = createContext<Api | null>(null)

export function Selection(
  props: ParentProps<{
    enabled?: boolean
  }>,
) {
  props = mergeProps({ enabled: true }, props)
  const [selected, select] = createSignal<THREE.Object3D[]>([])
  return (
    <selectionContext.Provider
      value={{
        get selected() {
          return selected()
        },
        select,
        get enabled() {
          return props.enabled
        },
      }}>
      {props.children}
    </selectionContext.Provider>
  )
}

export function Select(props: SelectApi) {
  props = mergeProps(
    {
      enabled: false,
    },
    props,
  )
  let group: Instance
  const api = useContext(selectionContext)
  // let child = children(() => props.children)
  createEffect(() => {
    if (api && props.enabled) {
      let changed = false
      const current = []
      group.traverse((o) => {
        o.type === 'Mesh' && current.push(o)
        if (untrack(() => api.selected).indexOf(o) === -1) changed = true
      })
      if (changed) {
        api.select((state) => [...state, ...current])
        onCleanup(() => {
          api.select((state) => state.filter((selected) => !current.includes(selected)))
        })
      }
    }
  })
  return (
    <T.Group ref={group} {...props}>
      {props.children}
      {/* {child()} */}
    </T.Group>
  )
}
