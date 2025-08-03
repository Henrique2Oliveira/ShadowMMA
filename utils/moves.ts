import { Move } from './animations';

export const moves: Move[] = [
  // Basic 1-2 Combination test
  // { move: 'Pause', pauseTime: 10000, direction: 'up', tiltValue: 3.7 }, // Pause move for 10 seconds

  { move: 'JAB', pauseTime: 1001, direction: 'left', tiltValue: 0.2 },
  { move: 'CROSS', pauseTime: 400, direction: 'right', tiltValue: 0.2 },
  { move: 'JAB', pauseTime: 401, direction: 'left', tiltValue: 0.2 },
  { move: 'CROSS', pauseTime: 402, direction: 'right', tiltValue: 0.2 },
  { move: 'LEFT\nHOOK', pauseTime: 700, direction: 'left', tiltValue: 0.4 },
  { move: 'RIGHT\nUPPERCUT', pauseTime: 1000, direction: 'up', tiltValue: 0.5 },
  { move: 'JAB', pauseTime: 401, direction: 'left', tiltValue: 0.2 },
  { move: 'RIGHT\nHOOK', pauseTime: 700, direction: 'right', tiltValue: 0.4 },
  { move: 'SLIP', pauseTime: 1000, direction: 'pulse', tiltValue: 0.3 },
  { move: 'LEFT\nHOOK', pauseTime: 700, direction: 'left', tiltValue: 0.4 },
  { move: 'RIGHT\nUPPERCUT', pauseTime: 1000, direction: 'up', tiltValue: 0.5 },
  { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
  { move: 'RIGHT\nHOOK', pauseTime: 700, direction: 'right', tiltValue: 0.4 },
  { move: 'SLIP', pauseTime: 1000, direction: 'pulse', tiltValue: 0.8},

];
