import * as THREE from 'three'
import type { StateSelector, EqualityChecker } from 'zustand'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { RootState, RenderCallback, StageTypes } from '../core/store'
import { buildGraph, ObjectMap, is } from '../core/utils'
import { LoadingManager } from 'three'
import { context } from './context'
import {
  useContext,
  untrack,
  onCleanup,
  createMemo,
  createRenderEffect,
  createEffect,
  createResource,
  Resource,
  Accessor,
} from 'solid-js'
import { Stages, UpdateCallback } from '../core'
export interface Loader<T> extends THREE.Loader {
  load(
    url: string,
    onLoad?: (result: T) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): unknown
}

export type Extensions = (loader: THREE.Loader) => void
export type LoaderResult<T> = T extends any[] ? Loader<T[number]> : Loader<T>
export type ConditionalType<Child, Parent, Truthy, Falsy> = Child extends Parent ? Truthy : Falsy
export type BranchingReturn<T, Parent, Coerced> = ConditionalType<T, Parent, Coerced, T>

export function useStore() {
  const store = useContext(context)
  if (!store) throw new Error('R3F: Hooks can only be used within the Canvas component!')
  return store
}

/**
 * Accesses R3F's internal state, containing renderer, canvas, scene, etc.
 * @see https://docs.pmnd.rs/react-three-fiber/api/hooks#usethree
 */
export function useThree<T = RootState>(
  selector: StateSelector<RootState, T> = (state) => state as unknown as T,
  equalityFn?: EqualityChecker<T>,
): Accessor<T> {
  return useStore()(selector, equalityFn) as any
}

/**
 * Executes a callback before render in a shared frame loop.
 * Can order effects with render priority or manually render with a positive priority.
 * @see https://docs.pmnd.rs/react-three-fiber/api/hooks#useframe
 */
// export function useFrame(callback: RenderCallback, renderPriority: number = 0): null {
//   const store = useStore()
//   const subscribe = store.getState().internal.subscribe
//   // Memoize ref
//   const ref = useMutableCallback(callback)
//   // Subscribe on mount, unsubscribe on unmount
//   useIsomorphicLayoutEffect(() => subscribe(ref, renderPriority, store), [renderPriority, subscribe, store])
//   return null
// }

export function useFrame(callback: RenderCallback, renderPriority: number = 0): void {
  let store = useStore()
  const subscribe = store.getState().internal.subscribe
  let cleanup = subscribe(
    { current: (state: RootState, delta: number, frame?: XRFrame) => untrack(() => callback(state, delta, frame)) },
    renderPriority,
    store,
  )

  onCleanup(cleanup)
}

/**
 * Executes a callback in a given update stage.
 * Uses the stage instance to indetify which stage to target in the lifecycle.
 */
export function useUpdate(callback: UpdateCallback, stage: StageTypes = Stages.Update) {
  let store = useStore()
  const stages = store.getState().internal.stages
  if (!stages.includes(stage)) throw new Error(`An invoked stage does not exist in the lifecycle.`)
  const subscribe = useStore().getState().internal.subscribe
  let cleanup = stage.add(
    { current: (state: RootState, delta: number, frame?: XRFrame) => untrack(() => callback(state, delta, frame)) },
    store,
  )

  onCleanup(cleanup)
}

/**
 * Returns a node graph of an object with named nodes & materials.
 * @see https://docs.pmnd.rs/react-three-fiber/api/hooks#usegraph
 */
export function useGraph(object: THREE.Object3D) {
  return createMemo(() => buildGraph(object))
}

function loadingFn<T>(extensions?: Extensions, onProgress?: (event: ProgressEvent<EventTarget>) => void) {
  return function (Proto: new () => LoaderResult<T>, ...input: string[]) {
    // Construct new loader and run extensions
    const loader = new Proto()
    if (extensions) extensions(loader)
    // Go through the urls and load them
    return Promise.all(
      input.map(
        (input) =>
          new Promise((res, reject) =>
            loader.load(
              input,
              (data: any) => {
                if (data.scene) Object.assign(data, buildGraph(data.scene))
                res(data)
              },
              onProgress,
              (error) => reject(new Error(`Could not load ${input}: ${error.message})`)),
            ),
          ),
      ),
    )
  }
}

let cache = new Map()

/**
 * Synchronously loads and caches assets with a three loader.
 *
 * Note: this hook's caller must be wrapped with `React.Suspense`
 * @see https://docs.pmnd.rs/react-three-fiber/api/hooks#useloader
 */
export function useLoader<T, U extends string | string[]>(
  Proto: new (manager?: LoadingManager) => LoaderResult<T>,
  input: U,
  extensions?: Extensions,
  onProgress?: (event: ProgressEvent<EventTarget>) => void,
): U extends any[]
  ? Resource<BranchingReturn<T, GLTF, GLTF & ObjectMap>[]>
  : Resource<BranchingReturn<T, GLTF, GLTF & ObjectMap>> {
  // Use suspense to load async assets
  const keys = (Array.isArray(input) ? input : [input]) as string[]
  // const results = suspend(loadingFn<T>(extensions, onProgress), [Proto, ...keys], { equal: is.equ })
  // // Return the object/s
  // return (Array.isArray(input) ? results : results[0]) as U extends any[]
  //   ? BranchingReturn<T, GLTF, GLTF & ObjectMap>[]
  //   : BranchingReturn<T, GLTF, GLTF & ObjectMap>

  return createResource(
    () => [Proto, ...keys] as const,
    ([Proto, ...keys]) => {
      if (cache.has([Proto.name, ...keys].join('-'))) {
        console.log('getting from cache', [Proto.name, ...keys].join('-'))
        return cache.get([Proto.name, ...keys].join('-'))
      } else {
      }
      const prom = (async () => {
        let data = await loadingFn(extensions, () => {})(Proto as any, ...(keys as any))
        cache.set([Proto.name, ...keys].join('-'), Array.isArray(input) ? data : data[0])
        if (Array.isArray(input)) {
          return data
        } else {
          return data[0]
        }
      })()
      cache.set([Proto.name, ...keys].join('-'), prom)
      return prom
    },
  )[0]
}

// /**
//  * Preloads an asset into cache as a side-effect.
//  */
// useLoader.preload = function <T, U extends string | string[]>(
//   Proto: new () => LoaderResult<T>,
//   input: U,
//   extensions?: Extensions,
// ) {
//   const keys = (Array.isArray(input) ? input : [input]) as string[]
//   return preload(loadingFn<T>(extensions), [Proto, ...keys])
// }

/**
 * Removes a loaded asset from cache.
 */
useLoader.clear = function <T, U extends string | string[]>(Proto: new () => LoaderResult<T>, input: U) {
  const keys = (Array.isArray(input) ? input : [input]) as string[]
  return cache.delete([Proto.name, ...keys].join('-'))
}

/**
 * An SSR-friendly useLayoutEffect.
 *
 * React currently throws a warning when using useLayoutEffect on the server.
 * To get around it, we can conditionally useEffect on the server (no-op) and
 * useLayoutEffect elsewhere.
 *
 * @see https://github.com/facebook/react/issues/14927
 */

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' && (window.document?.createElement || window.navigator?.product === 'ReactNative')
    ? createRenderEffect
    : createEffect
