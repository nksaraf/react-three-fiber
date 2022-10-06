import * as THREE from 'three'
import { GLTF } from 'three-stdlib'
import { T, useFrame } from 'solid-three'
import { useGLTF } from '~/lib/useGLTF'
import { Merged } from './Instances'
import { ComponentProps, Resource } from 'solid-js'
import { makeMeshInstance } from './instancing'

type GLTFResult = GLTF & {
  nodes: {
    NURBS_Forr: THREE.Mesh
    Tapa_143: THREE.Mesh
    Tapa_52: THREE.Mesh
    Cilin97: THREE.Mesh
    Cubo1: THREE.Mesh
    _1: THREE.Mesh
    _2: THREE.Mesh
    NURBS: THREE.Mesh
    NURBS_Extr: THREE.Mesh
    cabina_0: THREE.Mesh
    ['646001']: THREE.Mesh
    ['895001']: THREE.Mesh
    Tapa_160: THREE.Mesh
    cabina_1: THREE.Mesh
    Tapa_156: THREE.Mesh
    Tapa_36: THREE.Mesh
    cabina_2: THREE.Mesh
    Tapa_154: THREE.Mesh
    Tapa_38: THREE.Mesh
    Cubo24: THREE.Mesh
    Esfer10: THREE.Mesh
    Pir_mide: THREE.Mesh
    Cubo4: THREE.Mesh
    pista: THREE.Mesh
    Tapa_152: THREE.Mesh
    Tapa_40: THREE.Mesh
  }
  materials: {
    ['Metal - High Ca']: THREE.MeshStandardMaterial
    ['Metal - Alumini']: THREE.MeshStandardMaterial
    ['Mat.6']: THREE.MeshStandardMaterial
    ['Mat.4']: THREE.MeshStandardMaterial
    ['Mat.5']: THREE.MeshStandardMaterial
    Mat12: THREE.MeshStandardMaterial
    ['Asphalt-03']: THREE.MeshStandardMaterial
  }
}

const context = createContext(() => null)
export function Instances(props) {
  const data = useGLTF('/carrier.glb') as Resource<GLTFResult>
  const instances = createMemo(() => {
    const { nodes } = data() ?? {}

    if (!data()) {
      return null
    }
    return {
      NURBSForr: nodes.NURBS_Forr,
      Tapa: nodes.Tapa_143,
      Tapa1: nodes.Tapa_52,
      Cilin: nodes.Cilin97,
      Cubo: nodes.Cubo1,
      a: nodes._1,
      a1: nodes._2,
      NURBS: nodes.NURBS,
      NURBSExtr: nodes.NURBS_Extr,
      Cabina: nodes.cabina_0,
      a2: nodes['646001'],
      a3: nodes['895001'],
      Tapa2: nodes.Tapa_160,
      Cabina1: nodes.cabina_1,
      Tapa3: nodes.Tapa_156,
      Tapa4: nodes.Tapa_36,
      Cabina2: nodes.cabina_2,
      Tapa5: nodes.Tapa_154,
      Tapa6: nodes.Tapa_38,
      Cubo1: nodes.Cubo24,
      Esfer: nodes.Esfer10,
      Pirmide: nodes.Pir_mide,
      Cubo2: nodes.Cubo4,
      Pista: nodes.pista,
      Tapa7: nodes.Tapa_152,
      Tapa8: nodes.Tapa_40,
    }
  })

  const instancesd = createMemo(() => {
    if (!instances()) {
      return null
    }
    return Object.entries(instances()).map(([key, value]) => {
      return [key, makeMeshInstance(value)]
    })
  })

  const instanceObj = createMemo(() => {
    return instancesd() ? Object.fromEntries(instancesd().map(([key, value]) => [key, value.Instance])) : null
  })

  createEffect(() => console.log(instancesd()))

  return (
    <>
      <For each={instancesd() ?? []}>{([key, value]) => <value.Root castShadow />}</For>
      <context.Provider value={instanceObj}>{props.children}</context.Provider>
    </>
  )
}

export function CarrierInstance(props: ComponentProps<typeof T.Group>) {
  const instances = useContext(context)

  return (
    <Show when={instances()} keyed>
      {(instances) => (
        <T.Group {...props} dispose={null}>
          <T.Group position={[0, -0.5, 3]} scale={0.04}>
            <T.Group position={[0, 10.9, 31.4]} scale={[0.8, 1.2, 1.3]}>
              <instances.NURBSForr position={[0, -9.3, -24.4]} scale={[1.3, 0.9, 0.8]}>
                <instances.Tapa position={[0, 12.4, 31.4]} scale={[0.8, 1.2, 1.3]} />
                <instances.Tapa1 position={[0, -6.9, 0]} scale={0.7} />
              </instances.NURBSForr>
            </T.Group>
            <T.Group position={[-12.3, 42.6, -62]}>
              <instances.Cilin position={[0, 4.1, 0]} />
              <instances.Cubo position={[3.7, 6.3, 0]} />
            </T.Group>
            <T.Group position={[0, -4.9, 0]}>
              <T.Group position={[8.1, 17.6, 72.4]} rotation={[-Math.PI / 2, 0, 0]}>
                <instances.a position={[0, 0, 0]} />
                <instances.a1 position={[5, 0, 0]} />
              </T.Group>
              <instances.NURBS position={[-20, -42.2, 0]} />
              <instances.NURBSExtr position={[-32.1, -42.2, 0]} />
            </T.Group>
            <T.Group position={[-12.3, 38.8, -65.4]} scale={[0.7, 1, 1]}>
              <instances.Cabina>
                <T.Group position={[-10.2, -11.6, -35.1]} scale={0.9}>
                  <instances.a2 />
                  <instances.a3 />
                </T.Group>
              </instances.Cabina>
              <instances.Tapa2 position={[-10.2, -27.6, -35.1]} />
              <instances.Cabina1 position={[0, 7.5, 0]}>
                <instances.Tapa3 position={[-10.2, -27.6, -35.1]} />
                <instances.Tapa4 position={[-10.2, -11.6, -35.1]} scale={0.9} />
              </instances.Cabina1>
              <instances.Cabina2 position={[0, 15, 0]}>
                <instances.Tapa5 position={[-10.2, -27.6, -35.1]} />
                <instances.Tapa6 position={[-10.2, -11.6, -35.1]} scale={0.9} />
              </instances.Cabina2>
            </T.Group>
            <T.Group position={[-19.3, 41.9, -96.9]}>
              <instances.Cubo1 position={[0, 13.3, 0]} />
              <instances.Esfer position={[0, 16.8, 0]} />
              <instances.Pirmide position={[0, 8.6, 0]} />
            </T.Group>
            <instances.Cubo2 position={[-18.6, 42.5, -100.7]} />
            <instances.Pista position={[3.4, -6.2, 0]} scale={[1, 1, 1.6]}>
              <instances.Tapa7 position={[-26.5, 18.9, -41.7]} />
              <instances.Tapa8 position={[-26.5, 18.1, -41.7]} />
            </instances.Pista>
          </T.Group>
        </T.Group>
      )}
    </Show>
  )
}
