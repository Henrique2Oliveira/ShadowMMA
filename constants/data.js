// MMA Combinations Library
export const combinationSets = {
  beginner: [
    // Basic Boxing Combinations
    {
      name: "Basic 1-2",
      moves: [
        { move: 'JAB', pauseTime: 800, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 800, direction: 'right', tiltValue: 0.2 },
      ]
    },
    {
      name: "1-2-3",
      moves: [
        { move: 'JAB', pauseTime: 800, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 800, direction: 'right', tiltValue: 0.2 },
        { move: 'LEFT\nHOOK', pauseTime: 1000, direction: 'left', tiltValue: 0.4 },
      ]
    },
    {
      name: "Double Jab Cross",
      moves: [
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 800, direction: 'right', tiltValue: 0.3 },
      ]
    },
    {
      name: "Basic Defense",
      moves: [
        { move: 'SLIP', pauseTime: 1000, direction: 'down', tiltValue: 0.3 },
        { move: 'JAB', pauseTime: 800, direction: 'left', tiltValue: 0.2 },
      ]
    },
    {
      name: "Basic Body Work",
      moves: [
        { move: 'JAB\nBODY', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
        { move: 'CROSS\nBODY', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
      ]
    },
    {
      name: "Simple Kicks",
      moves: [
        { move: 'JAB', pauseTime: 600, direction: 'left', tiltValue: 0.2 },
        { move: 'FRONT\nKICK', pauseTime: 1000, direction: 'up', tiltValue: 0.4 },
      ]
    },
    {
      name: "Basic Block Counter",
      moves: [
        { move: 'BLOCK', pauseTime: 800, direction: 'up', tiltValue: 0.3 },
        { move: 'JAB', pauseTime: 600, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 800, direction: 'right', tiltValue: 0.3 },
      ]
    }
  ],

  intermediate: [
    // Mixed Boxing Combinations
    {
      name: "Hook Uppercut Series",
      moves: [
        { move: 'LEFT\nHOOK', pauseTime: 800, direction: 'left', tiltValue: 0.4 },
        { move: 'RIGHT\nUPPERCUT', pauseTime: 800, direction: 'up', tiltValue: 0.5 },
        { move: 'LEFT\nHOOK', pauseTime: 800, direction: 'left', tiltValue: 0.4 },
      ]
    },
    {
      name: "Slip Counter",
      moves: [
        { move: 'SLIP', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
        { move: 'CROSS', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
        { move: 'LEFT\nHOOK', pauseTime: 800, direction: 'left', tiltValue: 0.4 },
      ]
    },
    {
      name: "Body Head Flow",
      moves: [
        { move: 'JAB\nBODY', pauseTime: 600, direction: 'down', tiltValue: 0.3 },
        { move: 'CROSS\nBODY', pauseTime: 600, direction: 'down', tiltValue: 0.3 },
        { move: 'LEFT\nHOOK', pauseTime: 800, direction: 'left', tiltValue: 0.4 },
        { move: 'RIGHT\nHOOK', pauseTime: 800, direction: 'right', tiltValue: 0.4 },
      ]
    },
    {
      name: "Kick Defense Combo",
      moves: [
        { move: 'CHECK', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
        { move: 'CROSS', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
        { move: 'LEFT\nKICK', pauseTime: 1000, direction: 'left', tiltValue: 0.5 },
      ]
    },
    {
      name: "Double Hook Body",
      moves: [
        { move: 'LEFT\nHOOK', pauseTime: 700, direction: 'left', tiltValue: 0.4 },
        { move: 'RIGHT\nHOOK', pauseTime: 700, direction: 'right', tiltValue: 0.4 },
        { move: 'LEFT\nBODY', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
        { move: 'RIGHT\nBODY', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
      ]
    },
    {
      name: "Mixed Defense",
      moves: [
        { move: 'BLOCK', pauseTime: 600, direction: 'up', tiltValue: 0.3 },
        { move: 'SLIP', pauseTime: 600, direction: 'down', tiltValue: 0.3 },
        { move: 'DUCK', pauseTime: 600, direction: 'down', tiltValue: 0.4 },
        { move: 'COUNTER\nCROSS', pauseTime: 800, direction: 'right', tiltValue: 0.4 },
      ]
    },
    {
      name: "Kick Counter Series",
      moves: [
        { move: 'CHECK', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 400, direction: 'right', tiltValue: 0.2 },
        { move: 'LOW\nKICK', pauseTime: 1000, direction: 'down', tiltValue: 0.4 },
      ]
    }
  ],

  advanced: [
    // Complex Boxing Combinations
    {
      name: "Advanced Boxing Flow",
      moves: [
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 400, direction: 'right', tiltValue: 0.2 },
        { move: 'SLIP', pauseTime: 600, direction: 'down', tiltValue: 0.3 },
        { move: 'LEFT\nHOOK', pauseTime: 600, direction: 'left', tiltValue: 0.4 },
        { move: 'RIGHT\nUPPERCUT', pauseTime: 800, direction: 'up', tiltValue: 0.5 },
      ]
    },
    {
      name: "Defense to Offense",
      moves: [
        { move: 'SLIP', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
        { move: 'DUCK', pauseTime: 800, direction: 'down', tiltValue: 0.4 },
        { move: 'LEFT\nHOOK', pauseTime: 600, direction: 'left', tiltValue: 0.4 },
        { move: 'CROSS', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
        { move: 'LEFT\nUPPERCUT', pauseTime: 800, direction: 'up', tiltValue: 0.5 },
      ]
    }
  ],

  kickboxing: [
    // Kickboxing Combinations
    {
      name: "Basic Kick Combo",
      moves: [
        { move: 'JAB', pauseTime: 600, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 600, direction: 'right', tiltValue: 0.2 },
        { move: 'LOW\nKICK', pauseTime: 1000, direction: 'down', tiltValue: 0.4 },
      ]
    },
    {
      name: "Advanced Kick Series",
      moves: [
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 400, direction: 'right', tiltValue: 0.2 },
        { move: 'LEFT\nHOOK', pauseTime: 600, direction: 'left', tiltValue: 0.4 },
        { move: 'RIGHT\nKICK', pauseTime: 1000, direction: 'right', tiltValue: 0.5 },
        { move: 'SWITCH\nKICK', pauseTime: 1200, direction: 'left', tiltValue: 0.5 },
      ]
    }
  ],

  mma: [
    // MMA Specific Combinations
    {
      name: "MMA Flow",
      moves: [
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 400, direction: 'right', tiltValue: 0.2 },
        { move: 'LEFT\nHOOK', pauseTime: 600, direction: 'left', tiltValue: 0.4 },
        { move: 'LOW\nKICK', pauseTime: 800, direction: 'down', tiltValue: 0.4 },
        { move: 'FAKE\nTAKEDOWN', pauseTime: 1000, direction: 'down', tiltValue: 0.6 },
        { move: 'RIGHT\nUPPERCUT', pauseTime: 800, direction: 'up', tiltValue: 0.5 },
      ]
    },
    {
      name: "Ground and Pound",
      moves: [
        { move: 'SHOOT', pauseTime: 1200, direction: 'down', tiltValue: 0.6 },
        { move: 'LEFT\nGROUND', pauseTime: 800, direction: 'left', tiltValue: 0.3 },
        { move: 'RIGHT\nGROUND', pauseTime: 800, direction: 'right', tiltValue: 0.3 },
        { move: 'SPRAWL', pauseTime: 1000, direction: 'up', tiltValue: 0.5 },
      ]
    }
  ],

  defense: [
    // Defensive Combinations
    {
      name: "Shell Defense",
      moves: [
        { move: 'BLOCK', pauseTime: 600, direction: 'up', tiltValue: 0.3 },
        { move: 'BLOCK', pauseTime: 600, direction: 'up', tiltValue: 0.3 },
        { move: 'COUNTER\nJAB', pauseTime: 800, direction: 'left', tiltValue: 0.2 },
        { move: 'COUNTER\nCROSS', pauseTime: 800, direction: 'right', tiltValue: 0.3 },
      ]
    },
    {
      name: "Head Movement",
      moves: [
        { move: 'SLIP', pauseTime: 600, direction: 'left', tiltValue: 0.3 },
        { move: 'SLIP', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
        { move: 'DUCK', pauseTime: 800, direction: 'down', tiltValue: 0.4 },
        { move: 'LEFT\nHOOK', pauseTime: 800, direction: 'left', tiltValue: 0.4 },
      ]
    },
    {
      name: "Parry Counter",
      moves: [
        { move: 'PARRY', pauseTime: 500, direction: 'right', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
        { move: 'PARRY', pauseTime: 500, direction: 'left', tiltValue: 0.2 },
        { move: 'LEFT\nHOOK', pauseTime: 800, direction: 'left', tiltValue: 0.4 },
      ]
    }
  ],

  footwork: [
    // Footwork Combinations
    {
      name: "In and Out",
      moves: [
        { move: 'STEP\nBACK', pauseTime: 800, direction: 'down', tiltValue: 0.3 },
        { move: 'STEP\nIN', pauseTime: 600, direction: 'up', tiltValue: 0.3 },
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'CROSS', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
      ]
    },
    {
      name: "Lateral Movement",
      moves: [
        { move: 'SIDE\nSTEP', pauseTime: 600, direction: 'left', tiltValue: 0.3 },
        { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
        { move: 'SIDE\nSTEP', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
        { move: 'CROSS', pauseTime: 600, direction: 'right', tiltValue: 0.3 },
      ]
    },
    {
      name: "Pivot Attack",
      moves: [
        { move: 'PIVOT', pauseTime: 800, direction: 'left', tiltValue: 0.4 },
        { move: 'LEFT\nHOOK', pauseTime: 600, direction: 'left', tiltValue: 0.4 },
        { move: 'PIVOT', pauseTime: 800, direction: 'right', tiltValue: 0.4 },
        { move: 'RIGHT\nHOOK', pauseTime: 600, direction: 'right', tiltValue: 0.4 },
      ]
    }
  ]
};

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
