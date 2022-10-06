import { Square as SquareType } from '~/lib/chess'
import { squareColor } from '../lib/chess/utils'
// import { Html } from "solid-drei";
import { ComponentProps, createMemo, createSignal } from 'solid-js'
import { createControls, folder } from 'solid-leva'
import { Color } from 'three'
import { generateMoves, getPiece, makeMove, makePretty, sanToMove } from '../lib/chess/state'
import { getGame } from '~/lib/game'
import { useHover } from '../lib/useHover'
import { T } from 'solid-three'
import { makeInstanceComponents } from './instancing'

const Colors = {
  gold: new Color('gold'),
  white: new Color('white'),
  black: new Color('black'),
  red: new Color('red'),
  blue: new Color('blue'),
  green: new Color('green'),
}
// const box

export const Squareinstances = makeInstanceComponents()

export function Square(props: { square: SquareType } & ComponentProps<typeof T.Mesh>) {
  const gameApp = getGame()
  const controls = createControls('square', {
    width: { value: props.size, step: 0.1 },
    height: { value: props.size, step: 0.1 },
    color: folder({
      light: props.light ?? '#d7ff7e',
      dark: props.dark ?? '#456f1b',
    }),
  })

  const color = squareColor(props.square)

  const getMoves = (square) => {
    if (square === 'none') return []
    let moves = generateMoves(gameApp.chessBoard, { square: square })
    return moves.map((move) => makePretty(gameApp.chessBoard, move))
  }

  const data = createMemo(() => {
    let piece = getPiece(gameApp.chessBoard, props.square)
    let moves = getMoves(gameApp.selectedSquare ?? 'none')
    return {
      piece: piece,
      moves: moves,
      availableMove: moves.find((m) => m.to === props.square),
    }
  })

  const isSelected = () => gameApp.selectedSquare === props.square

  const [isHovered, bind] = useHover({
    onPointerEnter: (e) => {
      console.log('hereee', props.square)
      gameApp.hoveredSquare = props.square
      e.stopPropagation()
    },
    onPointerLeave: (e) => {
      // gameApp.hoveredSquare = 'none' as const
      // e.stopPropagation();
    },
  })

  const isSquareHovered = () => {
    let h = gameApp.hoveredSquare === props.square
    let b = isHovered()
    return h
  }

  const isMovable = () => (data().availableMove ? true : false)

  const turn = () => gameApp.chessBoard.turn

  const isSelectable = () => (data().piece ? data().piece.color === turn() : false)
  const isKilling = () => isMovable() && data().piece && data().piece.color !== turn()

  return (
    <Squareinstances.Instance
      {...bind}
      onPointerDown={(e) => {
        if (isMovable()) {
          props.makeChessMove(sanToMove(gameApp.chessBoard, data().availableMove!.san))
          gameApp.selectedSquare = 'none' as const
        }
        if (data().piece?.color === turn()) {
          gameApp.selectedSquare = props.square
        }
        e.stopPropagation()
      }}
      // receiveShadow
      // castShadow
      {...props}
      color={
        isMovable() && isSquareHovered()
          ? Colors.green
          : isSquareHovered() && isSelectable()
          ? Colors.gold
          : isSelected()
          ? Colors.gold
          : isKilling()
          ? Colors.red
          : isMovable()
          ? Colors.blue
          : color == 'light'
          ? controls.light
          : controls.dark
      }>
      {/* <Html transform>{props.square}</Html> */}
      {/* <T.MeshToonMaterial
        transparent
        opacity={0.5}
        color={
          isMovable() && isSquareHovered()
            ? Colors.green
            : isSquareHovered() && isSelectable()
            ? Colors.gold
            : isSelected()
            ? Colors.gold
            : isKilling()
            ? Colors.red
            : isMovable()
            ? Colors.blue
            : color == 'light'
            ? controls.light
            : controls.dark
        }
      /> */}
    </Squareinstances.Instance>
  )
}
