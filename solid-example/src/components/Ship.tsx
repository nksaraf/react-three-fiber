import { ComponentProps } from 'solid-js'
import { T } from 'solid-three'
import { useGLTF } from '../lib/useGLTF'
import { GLTF } from 'three-stdlib'
import * as React from 'react'

type GLTFResult = GLTF & {
  nodes: {
    Object_8: THREE.Mesh
    Object_2: THREE.Mesh
    Object_3: THREE.Mesh
    Object_4: THREE.Mesh
    Object_5: THREE.Mesh
    Object_6: THREE.Mesh
    Object_7: THREE.Mesh
    Object_9: THREE.Mesh
  }
  materials: {
    ['1003']: THREE.MeshStandardMaterial
    ['1001']: THREE.MeshStandardMaterial
    ['1002']: THREE.MeshStandardMaterial
  }
}

export function Model(props: ComponentProps<'group'>) {
  const gltf = useGLTF<GLTFResult>('/cargo_ship.glb')
  return (
    <Show when={gltf()}>
      <T.Group {...props}>
        <T.Group rotation={[-Math.PI / 2, 0, 0]}>
          <T.Mesh geometry={gltf().nodes.Object_8.geometry} material={gltf().materials['1003']} />
          <T.Mesh geometry={gltf().nodes.Object_2.geometry} material={gltf().materials['1001']} />
          <T.Mesh geometry={gltf().nodes.Object_3.geometry} material={gltf().materials['1001']} />
          <T.Mesh geometry={gltf().nodes.Object_4.geometry} material={gltf().materials['1001']} />
          <T.Mesh geometry={gltf().nodes.Object_5.geometry} material={gltf().materials['1001']} />
          <T.Mesh geometry={gltf().nodes.Object_6.geometry} material={gltf().materials['1001']} />
          <T.Mesh geometry={gltf().nodes.Object_7.geometry} material={gltf().materials['1001']} />
          <T.Mesh geometry={gltf().nodes.Object_9.geometry} material={gltf().materials['1002']} />
        </T.Group>
      </T.Group>
    </Show>
  )
}
