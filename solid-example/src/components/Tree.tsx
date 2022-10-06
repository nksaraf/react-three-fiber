export function Tree(props) {
  return (
    <T.Mesh {...props}>
      <T.Mesh scale={1} castShadow position-y={5}>
        <T.CylinderBufferGeometry args={[0.5, 0.75, 10]} />
        <T.MeshStandardMaterial color="brown" />
      </T.Mesh>
      <T.Mesh scale={1} castShadow position-y={5} position-z={1} rotation={[1, 1, 0]}>
        <T.CylinderBufferGeometry args={[0.1, 0.2, 3]} />
        <T.MeshStandardMaterial color="brown" />
        <T.Mesh scale={1} castShadow position-y={2}>
          <T.TetrahedronBufferGeometry args={[1, 1]} />
          <T.MeshStandardMaterial color="green" />
        </T.Mesh>
      </T.Mesh>

      <T.Mesh scale={1} castShadow position-y={8} position-z={-2} rotation={[-1, -1, 0.5]}>
        <T.CylinderBufferGeometry args={[0.1, 0.2, 3]} />
        <T.MeshStandardMaterial color="brown" />
        <T.Mesh scale={1} castShadow position-y={2}>
          <T.TetrahedronBufferGeometry args={[1.5, 1]} />
          <T.MeshStandardMaterial color="green" />
        </T.Mesh>
      </T.Mesh>
      <T.Mesh scale={1} castShadow position-y={12}>
        <T.TetrahedronBufferGeometry args={[3, 1]} />
        <T.MeshStandardMaterial color="green" />
      </T.Mesh>
    </T.Mesh>
  )
}
