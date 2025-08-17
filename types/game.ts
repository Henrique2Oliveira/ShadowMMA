export interface Move {
  move: string;
  pauseTime: number;
  direction: "left" | "right" | "up" | "down";
  tiltValue: number;
  comboName?: string;
}

export interface Combo {
  comboId: string;
  name: string;
  moves: Move[];
  level: number;
}