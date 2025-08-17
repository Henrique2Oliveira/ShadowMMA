// MMA Combinations Library
export const combinationSets = [{
  "id": 0,
  "category": "attack",
  "levels": {
    "beginner": [
      {
        "comboId": 0,
        "level": 1,
        "name": "1-2 (Jab Cross)",
        "moves": [
          { "move": "JAB", "pauseTime": 1100, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 5,
        "level": 1,
        "name": "Cross Jab (2-1)",
        "moves": [
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 },
          { "move": "JAB", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1,
        "level": 2,
        "name": "1-2-3",
        "moves": [
          { "move": "JAB", "pauseTime": 1000, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 1000, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 1300, "direction": "left", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 2,
        "level": 3,
        "name": "Double Jab Cross",
        "moves": [
          { "move": "JAB", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 3,
        "level": 4,
        "name": "1-2-3-2",
        "moves": [
          { "move": "JAB", "pauseTime": 900, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 900, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      }
      ,
      {
        "comboId": 4,
        "level": 5,
        "name": "Jab Cross Uppercut",
        "moves": [
          { "move": "JAB", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 700, "direction": "right", "tiltValue": 0.2 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
        ]
      }
    ],
    "intermediate": [
      {
        "comboId": 0,
        "level": 6,
        "name": "3-2-3",
        "moves": [
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 7,
        "level": 7,
        "name": "Low Kick Combo",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nLOW KICK", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "LEFT\nLOW KICK", "pauseTime": 700, "direction": "right", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 8,
        "level": 8,
        "name": "Jab Cross Hook",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "LEFT\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 5,
        "level": 9,
        "name": "Boxer's Special",
        "moves": [
          { "move": "JAB", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 600, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 700, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nHOOK", "pauseTime": 700, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEFT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 6,
        "level": 10,
        "name": "Muay Thai Flow",
        "moves": [
          { "move": "JAB", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 600, "direction": "right", "tiltValue": 0.3 },
          { "move": "RIGHT\nELBOW", "pauseTime": 700, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEFT\nKNEE", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 },
          { "move": "RIGHT\nHOOK", "pauseTime": 700, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 4,
        "level": 11,
        "name": "Knee Strike Combo",
        "moves": [
          { "move": "JAB", "pauseTime": 500, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 500, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nKNEE", "pauseTime": 800, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 3,
        "level": 12,
        "name": "Triple Jab Power",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 1,
        "level": 13,
        "name": "Uppercut Combo",
        "moves": [
          { "move": "LEFT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 }
        ]
      }
      ,
      {
        "comboId": 2,
        "level": 14,
        "name": "Hook Cross Uppercut",
        "moves": [
          { "move": "LEFT\nHOOK", "pauseTime": 700, "direction": "left", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 700, "direction": "right", "tiltValue": 0.3 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
        ]
      }
    ],
    "advanced": [
      {
        "comboId": 0,
        "level": 15,
        "name": "Speed 6-Punch Combo",
        "moves": [
          { "move": "JAB", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 600, "direction": "right", "tiltValue": 0.2 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "RIGHT\nHOOK", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 5,
        "level": 16,
        "name": "Full Strike Arsenal",
        "moves": [
          { "move": "JAB", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 600, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHIGH KICK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.5 },
          { "move": "RIGHT\nELBOW", "pauseTime": 800, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEFT\nKNEE", "pauseTime": 900, "direction": "left", "tiltValue": 0.5 },
          { "move": "RIGHT\nLOW KICK", "pauseTime": 1000, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 6,
        "level": 17,
        "name": "Kick Boxing Special",
        "moves": [
          { "move": "LEFT\nPUSH KICK", "pauseTime": 600, "direction": "up", "tiltValue": 0.5 },
          { "move": "RIGHT\nCROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nHIGH KICK", "pauseTime": 800, "direction": "up", "tiltValue": 0.7 },
          { "move": "LEFT\nLOW KICK", "pauseTime": 600, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 3,
        "level": 18,
        "name": "Complete Strike Package",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nELBOW", "pauseTime": 500, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEFT\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.6 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 400, "direction": "up", "tiltValue": 0.5 },
          { "move": "LEFT\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 4,
        "level": 19,
        "name": "Dutch Kickboxing Flow",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.6 },
          { "move": "LEFT\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "RIGHT\nHOOK", "pauseTime": 400, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1,
        "level": 20,
        "name": "Body-Head Blitz",
        "moves": [
          { "move": "LEFT\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nHOOK", "pauseTime": 400, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEFT\nUPPERCUT", "pauseTime": 400, "direction": "up", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 },
          { "move": "RIGHT\nHOOK", "pauseTime": 600, "direction": "right", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 2,
        "level": 21,
        "name": "Elbow Cross Combo",
        "moves": [
          { "move": "LEFT\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 },
          { "move": "RIGHT\nELBOW", "pauseTime": 600, "direction": "right", "tiltValue": 0.5 }
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
        "level": 1,
        "name": "Slip and Jab",
        "moves": [
          { "move": "SLIP", "pauseTime": 1100, "direction": "down", "tiltValue": 0.4 },
          { "move": "JAB", "pauseTime": 1100, "direction": "left", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 1,
        "level": 1,
        "name": "Block and Cross",
        "moves": [
          { "move": "BLOCK", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      }
      ,
      {
        "comboId": 2,
        "level": 2,
        "name": "Slip Block",
        "moves": [
          { "move": "SLIP", "pauseTime": 700, "direction": "down", "tiltValue": 0.4 },
          { "move": "BLOCK", "pauseTime": 700, "direction": "up", "tiltValue": 0.4 }
        ]
      }
    ],
    "intermediate": [
      {
        "comboId": 0,
        "level": 3,
        "name": "Slip, Hook, Roll",
        "moves": [
          { "move": "SLIP", "pauseTime": 600, "direction": "down", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "ROLL", "pauseTime": 1000, "direction": "down", "tiltValue": 0.3 }
        ]
      }
      ,
      {
        "comboId": 1,
        "level": 4,
        "name": "Roll Slip Block",
        "moves": [
          { "move": "ROLL", "pauseTime": 900, "direction": "down", "tiltValue": 0.3 },
          { "move": "SLIP", "pauseTime": 800, "direction": "down", "tiltValue": 0.3 },
          { "move": "BLOCK", "pauseTime": 600, "direction": "up", "tiltValue": 0.3 }
        ]
      }
    ],
    "advanced": [
      {
        "comboId": 0,
        "level": 5,
        "name": "Roll, Block, Uppercut",
        "moves": [
          { "move": "ROLL", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 },
          { "move": "BLOCK", "pauseTime": 800, "direction": "up", "tiltValue": 0.3 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 5,
        "level": 6,
        "name": "Defense to Kicks",
        "moves": [
          { "move": "BLOCK", "pauseTime": 600, "direction": "down", "tiltValue": 0.3 },
          { "move": "SLIP", "pauseTime": 400, "direction": "down", "tiltValue": 0.3 },
          { "move": "RIGHT\nLOW KICK", "pauseTime": 700, "direction": "up", "tiltValue": 0.2 },
          { "move": "LEFT\nHIGH KICK", "pauseTime": 800, "direction": "up", "tiltValue": 0.7 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 3,
        "level": 7,
        "name": "Advanced Defense Chain",
        "moves": [
          { "move": "SLIP", "pauseTime": 400, "direction": "down", "tiltValue": 0.4 },
          { "move": "ROLL", "pauseTime": 500, "direction": "down", "tiltValue": 0.5 },
          { "move": "BLOCK", "pauseTime": 400, "direction": "up", "tiltValue": 0.4 },
          { "move": "LEFT\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "RIGHT\nKNEE", "pauseTime": 900, "direction": "up", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 4,
        "level": 8,
        "name": "Counter Attack Master",
        "moves": [
          { "move": "SLIP", "pauseTime": 400, "direction": "down", "tiltValue": 0.4 },
          { "move": "LEFT\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nELBOW", "pauseTime": 500, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEFT\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 2,
        "level": 9,
        "name": "Elbow Knee Rush",
        "moves": [
          { "move": "LEFT\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "RIGHT\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.4 },
          { "move": "RIGHT\nELBOW", "pauseTime": 500, "direction": "right", "tiltValue": 0.5 }
        ]
      }
      ,
      {
        "comboId": 1,
        "level": 10,
        "name": "Double Roll Uppercut",
        "moves": [
          { "move": "ROLL", "pauseTime": 900, "direction": "up", "tiltValue": 0.3 },
          { "move": "ROLL", "pauseTime": 900, "direction": "up", "tiltValue": 0.3 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.6 }
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
        "level": 1,
        "name": "Step Jab",
        "moves": [
          { "move": "STEP LEFT", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 1,
        "level": 1,
        "name": "Circle and Strike",
        "moves": [
          { "move": "STEP RIGHT", "pauseTime": 600, "direction": "right", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      }
      ,
      {
        "comboId": 2,
        "level": 2,
        "name": "Step Cross",
        "moves": [
          { "move": "STEP LEFT", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      }
    ],
    "intermediate": [
      {
        "comboId": 0,
        "level": 3,
        "name": "L Step Hook",
        "moves": [
          { "move": "L-STEP", "pauseTime": 600, "direction": "left", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 }
        ]
      }
      ,
      {
        "comboId": 1,
        "level": 4,
        "name": "Circle Hook",
        "moves": [
          { "move": "STEP RIGHT", "pauseTime": 600, "direction": "right", "tiltValue": 0.2 },
          { "move": "LEFT\nHOOK", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 }
        ]
      }
    ],
    "advanced": [
      {
        "comboId": 0,
        "level": 5,
        "name": "Pivot Hook Blitz",
        "moves": [
          { "move": "PIVOT LEFT", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 },
          { "move": "LEFT\nHOOK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 2,
        "level": 6,
        "name": "Advanced Footwork Chain",
        "moves": [
          { "move": "L-STEP", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "PIVOT RIGHT", "pauseTime": 800, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEFT\nHOOK", "pauseTime": 700, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nELBOW", "pauseTime": 800, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEFT\nKNEE", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 3,
        "level": 7,
        "name": "Circle and Strike Elite",
        "moves": [
          { "move": "STEP RIGHT", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 },
          { "move": "PIVOT LEFT", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "RIGHT\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.6 }
        ]
      }
      ,
      {
        "comboId": 1,
        "level": 8,
        "name": "Pivot Cross Blitz",
        "moves": [
          { "move": "PIVOT RIGHT", "pauseTime": 500, "direction": "right", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 }
        ]
      }
    ]
  }
}
];
