// MMA Combinations Library
export const combinationSets = [{
  "id": 0,
  "category": "basic",
  "levels": {
    "beginner": [
      {
        "comboId": 0,
        "name": "1-2 (Jab Cross)",
        "moves": [
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 1,
        "name": "1-2-3",
        "moves": [
          { "move": "JAB", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 700, "direction": "right", "tiltValue": 0.2 },
          { "move": "LEFT\nHOOK", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 2,
        "name": "Double Jab Cross",
        "moves": [
          { "move": "JAB", "pauseTime": 400, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 400, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 3,
        "name": "1-2-3-2",
        "moves": [
          { "move": "JAB", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 600, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      }
    ],
    "intermediate": [
      {
        "comboId": 0,
        "name": "3-2-3",
        "moves": [
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1,
        "name": "Uppercut Combo",
        "moves": [
          { "move": "LEFT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 }
        ]
      }
    ],
    "advanced": [
      {
        "comboId": 0,
        "name": "Speed 6-Punch Combo",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.2 },
          { "move": "LEFT\nHOOK", "pauseTime": 500, "direction": "left", "tiltValue": 0.3 },
          { "move": "RIGHT\nHOOK", "pauseTime": 500, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nUPPERCUT", "pauseTime": 600, "direction": "up", "tiltValue": 0.5 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 600, "direction": "up", "tiltValue": 0.5 }
        ]
      }
    ]
  }
},
{
  "id": 1,
  "category": "defense",
  "levels": {
    "beginner": [
      {
        "comboId": 0,
        "name": "Slip and Jab",
        "moves": [
          { "move": "SLIP", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 1,
        "name": "Block and Cross",
        "moves": [
          { "move": "BLOCK", "pauseTime": 800, "direction": "up", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      }
    ],
    "intermediate": [
      {
        "comboId": 0,
        "name": "Slip, Hook, Roll",
        "moves": [
          { "move": "SLIP", "pauseTime": 600, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 },
          { "move": "ROLL", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
        ]
      }
    ],
    "advanced": [
      {
        "comboId": 0,
        "name": "Roll, Block, Uppercut",
        "moves": [
          { "move": "ROLL", "pauseTime": 1000, "direction": "down", "tiltValue": 0.5 },
          { "move": "BLOCK", "pauseTime": 800, "direction": "up", "tiltValue": 0.3 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 }
        ]
      }
    ]
  }
},
{
  "id": 2,
  "category": "footwork",
  "levels": {
    "beginner": [
      {
        "comboId": 0,
        "name": "Step Jab",
        "moves": [
          { "move": "STEP LEFT", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 1,
        "name": "Circle and Strike",
        "moves": [
          { "move": "STEP RIGHT", "pauseTime": 600, "direction": "right", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      }
    ],
    "intermediate": [
      {
        "comboId": 0,
        "name": "L Step Hook",
        "moves": [
          { "move": "L-STEP", "pauseTime": 600, "direction": "left", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 }
        ]
      }
    ],
    "advanced": [
      {
        "comboId": 0,
        "name": "Pivot Hook Blitz",
        "moves": [
          { "move": "PIVOT LEFT", "pauseTime": 500, "direction": "left", "tiltValue": 0.4 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 }
        ]
      }
    ]
  }
}
];
// Helper function to get a random combination from a specific set
export const getRandomCombo = (setName) => {
  const set = combinationSets[setName];
  if (!set) return null;
  return set[Math.floor(Math.random() * set.length)];
};

// Helper function to get all combinations from a specific set
export const getCombos = (setName) => {
  return combinationSets[setName] || [];
};

// Get all available set names
export const getAvailableSets = () => {
  return Object.keys(combinationSets);
};
