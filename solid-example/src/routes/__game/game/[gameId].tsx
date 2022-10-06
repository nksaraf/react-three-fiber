import { createControls } from 'solid-leva'
import { Board } from '~/components/Board'
import { Piece } from '~/components/Piece'
import { Tree } from '~/components/Tree'
import { BLACK, WHITE } from '~/lib/chess'
import { piecesEliminated } from '~/lib/chess/state'
import { getGame } from '~/lib/game'
import { PerspectiveCamera } from '../../../components/PerspectiveCamera'

function Plane() {
  return (
    <T.Mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position-y={-0.5}>
      <T.PlaneBufferGeometry args={[100, 100]} />
      <T.MeshStandardMaterial color={'indianred'} />
    </T.Mesh>
  )
}

export default function Hello() {
  const lightControls = createControls('light', {
    rotation: [0, 1, 0],
    position: [10, 20, 10],
    color: '#020910',
  })

  return (
    <>
      <PerspectiveCamera position={[0, 25, 10]} />
      <T.Group rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <Board />
      </T.Group>
      <Plane />
      <T.Group position={[8, 0, 13]} rotation-y={-1.4}>
        <For each={Object.entries(piecesEliminated(getGame().chessBoard, BLACK))}>
          {([piece, count], pieceIndex) => (
            <Show when={count}>
              <For each={[...Array(count)].map((x, i) => i)}>
                {(i) => <Piece piece={piece} color={BLACK} position={[i * 2, 0, pieceIndex() * 2]} />}
              </For>
            </Show>
          )}
        </For>
      </T.Group>
      <T.Group position={[-8, 0, -13]} rotation-y={-1.4}>
        <For each={Object.entries(piecesEliminated(getGame().chessBoard, WHITE))}>
          {([piece, count], pieceIndex) => (
            <Show when={count}>
              <For each={[...Array(count)].map((x, i) => i)}>
                {(i) => <Piece piece={piece} color={WHITE} position={[-i * 2, 0, -pieceIndex() * 2]} />}
              </For>
            </Show>
          )}
        </For>
      </T.Group>
      {/* <Html>
        <div>Hello world</div>
      </Html> */}
      <Tree position={[-15, 0, 0]} rotation-y={Math.random()} />
      <Tree position={[15, 0, 0]} rotation-y={Math.random()} />
      <Tree position={[-12, 0, 10]} rotation-y={Math.random()} />
      <Tree position={[17, 0, -8]} rotation-y={Math.random()} />
      <T.AmbientLight intensity={0.2} />
      <T.SpotLight
        penumbra={1}
        position={lightControls.position}
        rotation={lightControls.rotation}
        intensity={1}
        castShadow
      />
    </>
  )
}
