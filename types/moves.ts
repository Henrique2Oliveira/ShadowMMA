
type MoveIconName = 'boxing-glove' | 'karate' | 'arm-flex' | 'shield' | 'human-handsdown';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Move {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: MoveIconName;
  difficulty: Difficulty;
}
