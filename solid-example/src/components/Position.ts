import * as THREE from 'three'

const _instanceLocalMatrix = /*@__PURE__*/ new THREE.Matrix4()
const _instanceWorldMatrix = /*@__PURE__*/ new THREE.Matrix4()
const _instanceIntersects = []
const _mesh = /*@__PURE__*/ new THREE.Mesh()

export class Position extends THREE.Group {
  color: THREE.Color
  instance: React.MutableRefObject<THREE.InstancedMesh | undefined>
  instanceKey: number
  constructor() {
    super()
    this.color = new THREE.Color('white')
    this.instance = { current: undefined }
    this.instanceKey = { current: -1 }
  }

  // This will allow the virtual instance have bounds
  get geometry() {
    return this.instance.current?.geometry
  }

  // And this will allow the virtual instance to receive events
  raycast(raycaster, intersects) {
    const parent = this.instance.current
    if (!parent) return
    if (!parent.geometry || !parent.material) return
    _mesh.geometry = parent.geometry
    // let instanceId = this.instanceKey.current
    // If the instance wasn't found or exceeds the parents draw range, bail out
    // if (instanceId === -1 || instanceId > parent.count) return
    // calculate the world matrix for each instance
    // parent.getMatrixAt(instanceId, _instanceLocalMatrix)
    // _instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix)
    // the mesh represents this single instance
    _mesh.matrixWorld = this.matrixWorld
    // console.log(instanceId, _instanceLocalMatrix)
    _mesh.raycast(raycaster, _instanceIntersects)
    // process the result of raycast
    for (let i = 0, l = _instanceIntersects.length; i < l; i++) {
      const intersect = _instanceIntersects[i] as any
      intersect.instanceId = this.instanceKey.current
      intersect.object = this
      intersects.push(intersect)
    }
    _instanceIntersects.length = 0
  }
}
