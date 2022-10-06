import { World } from 'miniplex'
import { Component, onCleanup, onMount, splitProps } from 'solid-js'
import {
  createRef,
  makeThreeComponent,
  makeThreeComponentProxy,
  ThreeComponent,
  ThreeComponentProps,
  useFrame,
} from 'solid-three'
import { Color } from 'three'
import { Group, InstancedMesh, Mesh, Object3D } from 'three'
import { Position } from './Position'

/* Create a local reactor with the Three.js classes we need */
const T = makeThreeComponentProxy({ Group, InstancedMesh, Object3D })

type InstanceEntity = {
  instance: {
    /** The Three.js scene object defining this instance's transform. */
    sceneObject: Object3D
  }
}

const TPosition = makeThreeComponent(Position)

export const makeInstanceComponents = () => {
  /* We're using Miniplex as a state container. */
  const ecs = new World<InstanceEntity>()

  let instancedMesh = createRef<InstancedMesh>()

  /* This component renders the InstancedMesh itself and continuously updates it
     from the data in the ECS. */
  const Root: Component<
    ThreeComponentProps<typeof InstancedMesh> & {
      countStep?: number
    }
  > = (props) => {
    const [local, instancedMeshProps] = splitProps(props, ['children', 'countStep'])

    /* The following hook will make sure this entire component gets re-rendered when
       the number of instance entities changes. We're using this to dynamically grow
       or shrink the instance buffer. */
    const { entities } = ecs.archetype('instance')

    const instanceLimit = 10000

    // const instanceLimit =
    //   Math.floor(entities.length / localProps.countStep + 1) * localProps.countStep

    const color = new Color()
    function updateInstances() {
      const l = entities.length
      let count = 0
      for (let i = 0; i < l; i++) {
        const { instance } = entities[i]

        if (instance.sceneObject.visible) {
          instancedMesh.current.setMatrixAt(i, instance.sceneObject.matrixWorld)
          color.set(instance.sceneObject.color)
          instancedMesh.current.setColorAt(i, color)
          count++
        }
      }

      instancedMesh.current.instanceMatrix.needsUpdate = true
      instancedMesh.current.instanceColor && (instancedMesh.current.instanceColor.needsUpdate = true)
      instancedMesh.current.count = count
    }

    useFrame(updateInstances)

    return (
      <T.InstancedMesh ref={instancedMesh} {...instancedMeshProps} args={[null!, null!, instanceLimit]}>
        {local.children}
      </T.InstancedMesh>
    )
  }

  /* The Instance component will create a new ECS entity storing a reference
     to a three.js scene object. */
  const Instance: ThreeComponent<typeof Group> = (props) => {
    let group!: Group

    const [local, groupProps] = splitProps(props, ['children'])

    let id = createRef()
    onMount(() => {
      const entity = ecs.createEntity({
        instance: {
          sceneObject: group,
        },
      })
      id(entity.__miniplex.id)

      onCleanup(() => ecs.destroyEntity(entity))
      return entity
    })

    return (
      <TPosition ref={group} {...groupProps} instance={instancedMesh} instanceKey={id}>
        {local.children}
      </TPosition>
    )
  }

  return { Root, Instance }
}

export function makeMeshInstance(mesh: Mesh) {
  const root = makeInstanceComponents()
  return {
    Root: (props) => {
      return <root.Root material={mesh.material} geometry={mesh.geometry} {...props} />
    },
    Instance: root.Instance,
  }
}
