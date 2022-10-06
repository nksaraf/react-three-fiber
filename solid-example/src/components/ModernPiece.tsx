import { T } from 'solid-three'
import { Html } from '../lib/Html'
import { ChessPieces } from './PieceSvg'
import { ShipPiece } from './Board'
import { getGame } from '~/lib/game'
import { useHover } from '../lib/useHover'
import { Piece } from './Piece'

export function ModernPiece(props) {
  const gameApp = getGame()
  const [isHovered, bind] = useHover({
    onPointerEnter: (e) => {},
    onPointerLeave: (e) => {
      gameApp.hoveredSquare = 'none' as const
      // e.stopPropagation();
    },
  })

  return (
    <>
      <T.Group {...props}>
        <T.Group position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, Math.PI]} scale={2.5}>
          <Html transform pointerEvents="none">
            <div style={`opacity:${props.opacity}`}>
              <ChessPieces piece={props.piece} color={props.color} />
            </div>
          </Html>
        </T.Group>
        {/* <ShipPiece /> */}
      </T.Group>
    </>
  )
}
