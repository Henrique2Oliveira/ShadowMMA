export interface Move {
  move: string;
  pauseTime: number;
  direction: "left" | "right" | "up" | "down";
  tiltValue: number;
}
