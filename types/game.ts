export interface Move {
  move: string;
  pauseTime: number;
  direction: "left" | "right" | "up" | "down";
  tiltValue: number;
  comboName?: string;
}

export interface Combo {
  name: string;
  moves: Move[];
}

export interface GameState {
  currentRound: number;
  isRestPeriod: boolean;
  timeLeft: number;
  isPaused: boolean;
  isGameOver: boolean;
}

export interface FightResponse {
  combos: Combo[];
  fightsLeft?: number;
}
