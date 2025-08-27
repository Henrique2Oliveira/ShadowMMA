export interface Move {
  move: string;
  pauseTime: number;
  direction: "left" | "right" | "up" | "down";
  tiltValue: number;
  comboName?: string;
  comboIndex?: number;
  moveIndex?: number;
  comboData?: Combo;
}

export interface Combo {
  comboId: string;
  name: string;
  moves: Move[];
  level: number;
}