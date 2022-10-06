import { Loader } from 'three'
import { DRACOLoader, GLTF, GLTFLoader } from 'three-stdlib'
import { useLoader } from 'solid-three'

let dracoLoader: DRACOLoader | null = null

function extensions(useDraco: boolean | string, useMeshopt: boolean, extendLoader?: (loader: GLTFLoader) => void) {
  return (loader: Loader) => {
    if (extendLoader) {
      extendLoader(loader as GLTFLoader)
    }
    if (useDraco) {
      if (!dracoLoader) {
        dracoLoader = new DRACOLoader()
      }
      dracoLoader.setDecoderPath(
        typeof useDraco === 'string' ? useDraco : 'https://www.gstatic.com/draco/versioned/decoders/1.4.3/',
      )
      ;(loader as GLTFLoader).setDRACOLoader(dracoLoader)
    }
    // if (useMeshopt) {
    //   (loader as GLTFLoader).setMeshoptDecoder(
    //     typeof MeshoptDecoder === "function" ? MeshoptDecoder() : MeshoptDecoder
    //   );
    // }
  }
}

export function useGLTF<Data extends GLTF, T extends string | string[] = string>(
  path: T,
  useDraco: boolean | string = true,
  useMeshOpt: boolean = true,
  extendLoader?: (loader: GLTFLoader) => void,
) {
  return useLoader<Data, T>(GLTFLoader as any, path, extensions(useDraco, useMeshOpt, extendLoader))
}

// useGLTF.preload = (
//   path: string | string[],
//   useDraco: boolean | string = true,
//   useMeshOpt: boolean = true,
//   extendLoader?: (loader: GLTFLoader) => void
// ) =>
//   useLoader.preload(
//     GLTFLoader,
//     path,
//     extensions(useDraco, useMeshOpt, extendLoader)
//   );

// useGLTF.clear = (input: string | string[]) =>
//   useLoader.clear(GLTFLoader, input);
