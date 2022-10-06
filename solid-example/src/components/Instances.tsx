import * as THREE from 'three'
import { createRef, makeThreeComponent, T, useFrame } from 'solid-three'
import { Position } from './Position'
import { ComponentProps, createContext, useContext } from 'solid-js'

type Api = {
  getParent: () => React.MutableRefObject<InstancedMesh>
  subscribe: (ref) => void
}

type InstancesProps = JSX.IntrinsicElements['instancedMesh'] & {
  range?: number
  limit?: number
  frames?: number
}

type InstanceProps = ComponentProps<typeof TPosition> & {
  context?: React.Context<Api>
}

type InstancedMesh = Omit<THREE.InstancedMesh, 'instanceMatrix' | 'instanceColor'> & {
  instanceMatrix: THREE.InstancedBufferAttribute
  instanceColor: THREE.InstancedBufferAttribute
}

let i, instanceRef
const globalContext = createContext<Api>(null!)
const parentMatrix = new THREE.Matrix4()
const instanceMatrix = new THREE.Matrix4()
const tempMatrix = new THREE.Matrix4()
const color = new THREE.Color()
const translation = new THREE.Vector3()
const rotation = new THREE.Quaternion()
const scale = new THREE.Vector3()

const TPosition = makeThreeComponent(Position)

const Instance = ({ context, children, ...props }: InstanceProps) => {
  const group = createRef()
  const { subscribe, getParent } = useContext(context)
  createEffect(() => subscribe(group))
  return (
    <TPosition instance={getParent()} instanceKey={group} ref={group} {...props}>
      {children}
    </TPosition>
  )
}

const Instances = ({ children, range, limit = 1000, frames = Infinity, ...props }) => {
  const context = createContext<Api>(null!)
  const instance = (props: InstanceProps, ref) => (
    <Instance context={context} {...splitProps(props, ['children', 'range', 'limit', 'frames'])[1]} ref={ref} />
  )

  const parentRef = createRef<InstancedMesh>()
  const [instances, setInstances] = createSignal<React.MutableRefObject<Position>[]>([])

  const mArray = new Float32Array(limit * 16)
  for (i = 0; i < limit; i++) tempMatrix.identity().toArray(mArray, i * 16)
  const [matrices, colors] = [mArray, new Float32Array([...new Array(limit * 3)].map(() => 1))]

  createEffect(() => {
    // We might be a frame too late? 🤷‍♂️
    parentRef.current.instanceMatrix.needsUpdate = true
  })

  let count = 0
  let updateRange = 0
  useFrame(() => {
    if (frames === Infinity || count < frames) {
      parentRef.current.updateMatrix()
      parentRef.current.updateMatrixWorld()
      parentMatrix.copy(parentRef.current.matrixWorld).invert()

      updateRange = Math.min(limit, range !== undefined ? range : limit, instances.length)
      parentRef.current.count = updateRange
      parentRef.current.instanceMatrix.updateRange.count = updateRange * 16
      parentRef.current.instanceColor.updateRange.count = updateRange * 3

      for (i = 0; i < instances.length; i++) {
        instanceRef = instances[i].current
        // Multiply the inverse of the InstancedMesh world matrix or else
        // Instances will be double-transformed if <Instances> isn't at identity
        instanceRef.matrixWorld.decompose(translation, rotation, scale)
        instanceMatrix.compose(translation, rotation, scale).premultiply(parentMatrix)
        instanceMatrix.toArray(matrices, i * 16)
        parentRef.current.instanceMatrix.needsUpdate = true
        instanceRef.color.toArray(colors, i * 3)
        parentRef.current.instanceColor.needsUpdate = true
      }
      count++
    }
  })

  const getParent = () => parentRef
  const subscribe = (ref) => {
    setInstances((instances) => [...instances, ref])
    console.log('subscribe', instances().length)
    return () => setInstances((instances) => instances.filter((item) => item.current !== ref.current))
  }

  return (
    <T.InstancedMesh
      userData={{ instances: instances() }}
      matrixAutoUpdate={false}
      ref={parentRef}
      args={[null as any, null as any, 0]}
      raycast={() => null}
      {...props}>
      <T.InstancedBufferAttribute
        attach="instanceMatrix"
        count={matrices.length / 16}
        array={matrices}
        itemSize={16}
        usage={THREE.DynamicDrawUsage}
      />
      <T.InstancedBufferAttribute
        attach="instanceColor"
        count={colors.length / 3}
        array={colors}
        itemSize={3}
        usage={THREE.DynamicDrawUsage}
      />
      {typeof props.children === 'function' ? (
        <context.Provider
          value={{
            subscribe,
            getParent,
          }}>
          {props.children(instance)}
        </context.Provider>
      ) : null}
    </T.InstancedMesh>
  )
}
function Composer(props) {
  return createMemo(() => renderRecursive(props.children, props.components))
}

/**
 * Recursively build up elements from props.components and accumulate `results` along the way.
 * @param {function} render
 * @param {Array.<ReactElement|Function>} remaining
 * @param {Array} [results]
 * @returns {ReactElement}
 */
function renderRecursive(render, remaining, results) {
  results = results || []
  console.log(render, remaining, results)

  // Once components is exhausted, we can render out the results array.
  if (!remaining[0]) {
    return render(results)
  }

  // Continue recursion for remaining items.
  // results.concat([value]) ensures [...results, value] instead of [...results, ...value]
  function nextRender(value) {
    console.log(remaining)
    return renderRecursive(render, remaining.slice(1), results.concat([value]))
  }

  console.log(remaining[0]())

  // Each props.components entry is either an element or function [element factory]
  return remaining[0]({ results, render: nextRender })
  // : // When it is an element, enhance the element's props with the render prop.
  // cloneElement(remaining[0], { children: nextRender });
}
function Merged(props) {
  createEffect(() => console.log(props.meshes))
  // Filter out meshes from collections, which may contain non-meshes
  // if (!isArray) for (const key of Object.keys(meshes)) if (!meshes[key].isMesh) delete meshes[key]
  return (
    <Composer
      components={Object.values(props.meshes ?? {})
        .filter((i) => i.isMesh)
        .map(({ geometry, material }) => (
          <Instances geometry={geometry} material={material} {...props} />
        ))}>
      {(args) =>
        Object.keys(props.meshes ?? {})
          .filter((key) => props.meshes[key].isMesh)
          .reduce((acc, key, i) => ({ ...acc, [key]: args[i] }), {})
      }
    </Composer>
  )
}

export { Instances, Instance, Merged }
