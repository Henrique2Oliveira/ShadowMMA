export interface Move {
  move: string;
  pauseTime: number;
  direction: "left" | "right" | "up" | "down";
  tiltValue: number;
  comboName?: string;
}

export interface Combo {
  comboId: number;
  level: number;
  name: string;
  moves: Move[];
}
