import { app } from '@/FirebaseConfig';
import { Move } from '@/types/game';
import { getAuth } from '@firebase/auth';

interface ComboData {
  name: string;
  moves: Move[];
}

interface FetchMovesResponse {
  moves: Move[];
  combos: ComboData[];
  fightsLeft?: number;
}

export const fetchGameMoves = async (
  category: string = '0',
  difficulty: string = 'beginner'
): Promise<FetchMovesResponse> => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user');
  }

  const idToken = await user.getIdToken();
  const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/startFight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      category,
      difficulty: difficulty.toLowerCase()
    })
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('NO_FIGHTS_LEFT');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.combos || data.combos.length === 0) {
    throw new Error('No moves found in response');
  }

  const countdownMoves: Move[] = [
    { move: "Ready?", pauseTime: 800, direction: "down", tiltValue: 3.75 },
    { move: "3", pauseTime: 1000, direction: "down", tiltValue: 3.75 },
    { move: "2", pauseTime: 1000, direction: "down", tiltValue: 3.75 },
    { move: "1", pauseTime: 1000, direction: "down", tiltValue: 3.75 },
    { move: "Fight!", pauseTime: 1600, direction: "up", tiltValue: 3.75 },
  ];

  const allMoves = data.combos.reduce((acc: Move[], combo: any) => {
    return [...acc, ...combo.moves];
  }, []);

  const combos = data.combos.map((combo: any) => ({
    name: combo.name,
    moves: combo.moves
  }));

  return {
    moves: [...countdownMoves, ...allMoves],
    combos,
    fightsLeft: data.fightsLeft
  };
};
