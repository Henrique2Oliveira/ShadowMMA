// Utility functions for converting move text between orthodox and southpaw.
// Keeps transformation logic in one place (DRY) so UI components just call swapForStance.

export type Stance = 'orthodox' | 'southpaw';

// Swap LEFT/RIGHT occurrences when stance is southpaw.
// Uses a TEMP token to avoid double replacement collisions.
export function transformMoveForStance(move: string, stance: Stance): string {
  if (!move) return '';
  if (stance !== 'southpaw') return move;
  return move
    .replace(/LEFT/g, 'TEMP')
    .replace(/RIGHT/g, 'LEFT')
    .replace(/TEMP/g, 'RIGHT');
}

// Accept arrays of moves or typed objects with a move property.
export function transformComboMoves<T extends { move: string }>(
  moves: T[] | undefined | null,
  stance: Stance
): T[] {
  if (!moves || stance !== 'southpaw') return moves || [];
  return moves.map(m => ({ ...m, move: transformMoveForStance(m.move, stance) }));
}
