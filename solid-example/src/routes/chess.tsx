import { Suspense } from 'solid-js'
import { T } from 'solid-three'
import { Board } from '../components/Board'
import * as React from 'react'
import { piecesEliminated } from '../lib/chess/state'
import { getGame } from '~/lib/game'
import { Piece } from '../components/Piece'
import { BLACK, WHITE } from '../lib/chess'
import { Html } from '~/lib/Html'
import { ChessPieces } from '../components/PieceSvg'
export function Chess() {
  return (
    <Suspense>
      <Board />
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
    </Suspense>
  )
}
