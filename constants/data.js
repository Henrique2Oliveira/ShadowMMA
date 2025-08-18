// MMA Combinations Library
export const combinationSets = [{
  "id": 0,
  "category": "attack",
  "levels": {
    "beginner": [
      {
        "comboId": 0, "level": 1, "name": "1-2 (Jab Cross)", "moves": [
          { "move": "JAB", "pauseTime": 1100, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 1, "level": 1, "name": "Cross Jab (2-1)", "moves": [
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 },
          { "move": "JAB", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 6, "level": 1, "name": "Double Jab", "moves": [
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 1000, "direction": "left", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 7, "level": 1, "name": "Jab Body Cross", "moves": [
          { "move": "JAB", "pauseTime": 900, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS\nBODY", "pauseTime": 1100, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 8, "level": 1, "name": "Cross Body Jab", "moves": [
          { "move": "CROSS\nBODY", "pauseTime": 1000, "direction": "right", "tiltValue": 0.4 },
          { "move": "JAB", "pauseTime": 900, "direction": "left", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 2, "level": 2, "name": "1-2-3", "moves": [
          { "move": "JAB", "pauseTime": 1000, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 1000, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHOOK", "pauseTime": 1300, "direction": "left", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 3, "level": 3, "name": "Double Jab Cross", "moves": [
          { "move": "JAB", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 4, "level": 4, "name": "1-2-3-2", "moves": [
          { "move": "JAB", "pauseTime": 900, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 900, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHOOK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 5, "level": 5, "name": "Jab Cross Uppercut", "moves": [
          { "move": "JAB", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 700, "direction": "right", "tiltValue": 0.2 },
          { "move": "REAR\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 9, "level": 2, "name": "Double Body Hook", "moves": [
          { "move": "LEAD\nHOOK\nBODY", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nHOOK\nBODY", "pauseTime": 1100, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 10, "level": 3, "name": "Head Body Head", "moves": [
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS\nBODY", "pauseTime": 900, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEAD\nHOOK", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 11, "level": 4, "name": "Body Blitz", "moves": [
          { "move": "JAB\nBODY", "pauseTime": 900, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS\nBODY", "pauseTime": 900, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEAD\nHOOK\nBODY", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 12, "level": 5, "name": "Mixed Level Attack", "moves": [
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS\nBODY", "pauseTime": 900, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEAD\nHOOK\nBODY", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nUPPERCUT", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 13, "level": 2, "name": "Lead Hook Cross", "moves": [
          { "move": "LEAD\nHOOK", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 14, "level": 3, "name": "Cross Lead Upper", "moves": [
          { "move": "CROSS", "pauseTime": 900, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 15, "level": 3, "name": "Basic Slip Counter", "moves": [
          { "move": "SLIP\nLEFT", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 900, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 16, "level": 4, "name": "Hook Upper Hook", "moves": [
          { "move": "LEAD\nHOOK", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 },
          { "move": "LEAD\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.4 },
          { "move": "REAR\nHOOK", "pauseTime": 1100, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 17, "level": 6, "name": "Slip Jab Cross", "moves": [
          { "move": "SLIP\nRIGHT", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 },
          { "move": "JAB", "pauseTime": 900, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 1000, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 18, "level": 5, "name": "Level Change Combo", "moves": [
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 900, "direction": "right", "tiltValue": 0.3 },
          { "move": "DUCK", "pauseTime": 800, "direction": "down", "tiltValue": 0.4 },
          { "move": "LEAD\nHOOK", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 }
        ]
      }
    ],
    "intermediate": [
      {
        "comboId": 0,
        "level": 6,
        "name": "3-2-3",
        "moves": [
          { "move": "LEAD\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 7,
        "level": 7,
        "name": "Low Kick Combo",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nLOW KICK", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "LEAD\nLOW KICK", "pauseTime": 700, "direction": "right", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 8,
        "level": 8,
        "name": "Jab Cross Hook",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "LEAD\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
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
          { "move": "LEAD\nHOOK", "pauseTime": 700, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nHOOK", "pauseTime": 700, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEAD\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 6,
        "level": 10,
        "name": "Muay Thai Flow",
        "moves": [
          { "move": "JAB", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 600, "direction": "right", "tiltValue": 0.3 },
          { "move": "REAR\nELBOW", "pauseTime": 700, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEAD\nKNEE", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 },
          { "move": "REAR\nHOOK", "pauseTime": 700, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 4,
        "level": 11,
        "name": "Knee Strike Combo",
        "moves": [
          { "move": "JAB", "pauseTime": 500, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 500, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nKNEE", "pauseTime": 800, "direction": "up", "tiltValue": 0.6 }
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
          { "move": "LEAD\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "REAR\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 }
        ]
      }
      ,
      {
        "comboId": 2,
        "level": 14,
        "name": "Hook Cross Uppercut",
        "moves": [
          { "move": "LEAD\nHOOK", "pauseTime": 700, "direction": "left", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 700, "direction": "right", "tiltValue": 0.3 },
          { "move": "REAR\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
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
          { "move": "LEAD\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "REAR\nHOOK", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 },
          { "move": "REAR\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 5,
        "level": 16,
        "name": "Full Strike Arsenal",
        "moves": [
          { "move": "JAB", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 600, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHIGH KICK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.5 },
          { "move": "REAR\nELBOW", "pauseTime": 800, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEAD\nKNEE", "pauseTime": 900, "direction": "left", "tiltValue": 0.5 },
          { "move": "REAR\nLOW KICK", "pauseTime": 1000, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 6,
        "level": 17,
        "name": "Kick Boxing Special",
        "moves": [
          { "move": "LEAD\nPUSH KICK", "pauseTime": 600, "direction": "up", "tiltValue": 0.5 },
          { "move": "REAR\nCROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nHIGH KICK", "pauseTime": 800, "direction": "up", "tiltValue": 0.7 },
          { "move": "LEAD\nLOW KICK", "pauseTime": 600, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 3,
        "level": 18,
        "name": "Complete Strike Package",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nELBOW", "pauseTime": 500, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEAD\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.6 },
          { "move": "REAR\nUPPERCUT", "pauseTime": 400, "direction": "up", "tiltValue": 0.5 },
          { "move": "LEAD\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 4,
        "level": 19,
        "name": "Dutch Kickboxing Flow",
        "moves": [
          { "move": "JAB", "pauseTime": 300, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 300, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEAD\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.6 },
          { "move": "LEAD\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "REAR\nHOOK", "pauseTime": 400, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1,
        "level": 20,
        "name": "Body-Head Blitz",
        "moves": [
          { "move": "LEAD\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nHOOK", "pauseTime": 400, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEAD\nUPPERCUT", "pauseTime": 400, "direction": "up", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 },
          { "move": "REAR\nHOOK", "pauseTime": 600, "direction": "right", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 2,
        "level": 21,
        "name": "Elbow Cross Combo",
        "moves": [
          { "move": "LEAD\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.3 },
          { "move": "REAR\nELBOW", "pauseTime": 600, "direction": "right", "tiltValue": 0.5 }
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
        "comboId": 0, "level": 1, "name": "Slip Left", "moves": [
          { "move": "SLIP", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1, "level": 1, "name": "Slip Right", "moves": [
          { "move": "SLIP", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 2, "level": 1, "name": "Roll", "moves": [
          { "move": "ROLL", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 3, "level": 1, "name": "Block", "moves": [
          { "move": "BLOCK", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 4, "level": 1, "name": "Slip and Jab", "moves": [
          { "move": "SLIP", "pauseTime": 1100, "direction": "down", "tiltValue": 0.4 },
          { "move": "JAB", "pauseTime": 1100, "direction": "left", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 5, "level": 1, "name": "Block and Cross", "moves": [
          { "move": "BLOCK", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 6, "level": 2, "name": "Slip Block", "moves": [
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
          { "move": "LEAD\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
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
          { "move": "REAR\nUPPERCUT", "pauseTime": 800, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 5,
        "level": 6,
        "name": "Defense to Kicks",
        "moves": [
          { "move": "BLOCK", "pauseTime": 600, "direction": "down", "tiltValue": 0.3 },
          { "move": "SLIP", "pauseTime": 400, "direction": "down", "tiltValue": 0.3 },
          { "move": "REAR\nLOW KICK", "pauseTime": 700, "direction": "up", "tiltValue": 0.2 },
          { "move": "LEAD\nHIGH KICK", "pauseTime": 800, "direction": "up", "tiltValue": 0.7 },
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
          { "move": "LEAD\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "REAR\nKNEE", "pauseTime": 900, "direction": "up", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 4,
        "level": 8,
        "name": "Counter Attack Master",
        "moves": [
          { "move": "SLIP", "pauseTime": 400, "direction": "down", "tiltValue": 0.4 },
          { "move": "LEAD\nHOOK", "pauseTime": 400, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nELBOW", "pauseTime": 500, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEAD\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 400, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 2,
        "level": 9,
        "name": "Elbow Knee Rush",
        "moves": [
          { "move": "LEAD\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "REAR\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.4 },
          { "move": "REAR\nELBOW", "pauseTime": 500, "direction": "right", "tiltValue": 0.5 }
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
          { "move": "REAR\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.6 }
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
        "name": "Step Left",
        "moves": [
          { "move": "STEP LEFT", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 1,
        "level": 1,
        "name": "Step Right",
        "moves": [
          { "move": "STEP RIGHT", "pauseTime": 700, "direction": "right", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 2,
        "level": 1,
        "name": "Pivot Left",
        "moves": [
          { "move": "PIVOT LEFT", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 3,
        "level": 1,
        "name": "Pivot Right",
        "moves": [
          { "move": "PIVOT RIGHT", "pauseTime": 800, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 4,
        "level": 1,
        "name": "L-Step",
        "moves": [
          { "move": "L-STEP", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 5,
        "level": 1,
        "name": "Lead Knee",
        "moves": [
          { "move": "LEAD\nKNEE", "pauseTime": 1100, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 6,
        "level": 1,
        "name": "Rear Knee",
        "moves": [
          { "move": "REAR\nKNEE", "pauseTime": 1100, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 7,
        "level": 1,
        "name": "Lead Low Kick",
        "moves": [
          { "move": "LEAD\nLOW KICK", "pauseTime": 1200, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 8,
        "level": 1,
        "name": "Rear Low Kick",
        "moves": [
          { "move": "REAR\nLOW KICK", "pauseTime": 1200, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 9,
        "level": 1,
        "name": "Lead High Kick",
        "moves": [
          { "move": "LEAD\nHIGH KICK", "pauseTime": 1300, "direction": "up", "tiltValue": 0.7 }
        ]
      },
      {
        "comboId": 10,
        "level": 1,
        "name": "Rear High Kick",
        "moves": [
          { "move": "REAR\nHIGH KICK", "pauseTime": 1300, "direction": "up", "tiltValue": 0.7 }
        ]
      },
      {
        "comboId": 11,
        "level": 1,
        "name": "Lead Push Kick",
        "moves": [
          { "move": "LEAD\nPUSH KICK", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 12,
        "level": 1,
        "name": "Rear Push Kick",
        "moves": [
          { "move": "REAR\nPUSH KICK", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 13,
        "level": 1,
        "name": "Step Jab",
        "moves": [
          { "move": "STEP LEFT", "pauseTime": 600, "direction": "left", "tiltValue": 0.2 },
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.2 }
        ]
      },
      {
        "comboId": 14,
        "level": 1,
        "name": "Circle and Strike",
        "moves": [
          { "move": "STEP RIGHT", "pauseTime": 600, "direction": "right", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 800, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 15,
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
          { "move": "LEAD\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.4 }
        ]
      }
      ,
      {
        "comboId": 1,
        "level": 4,
        "name": "Circle Hook",
        "moves": [
          { "move": "STEP RIGHT", "pauseTime": 600, "direction": "right", "tiltValue": 0.2 },
          { "move": "LEAD\nHOOK", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 }
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
          { "move": "LEAD\nHOOK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nUPPERCUT", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 2,
        "level": 6,
        "name": "Advanced Footwork Chain",
        "moves": [
          { "move": "L-STEP", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "PIVOT RIGHT", "pauseTime": 800, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEAD\nHOOK", "pauseTime": 700, "direction": "left", "tiltValue": 0.4 },
          { "move": "REAR\nELBOW", "pauseTime": 800, "direction": "right", "tiltValue": 0.5 },
          { "move": "LEAD\nKNEE", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
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
          { "move": "LEAD\nELBOW", "pauseTime": 500, "direction": "left", "tiltValue": 0.5 },
          { "move": "REAR\nKNEE", "pauseTime": 600, "direction": "up", "tiltValue": 0.6 }
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
          { "move": "LEAD\nHOOK", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 }
        ]
      }
    ]
  }
}
  ,
{
  "id": 3,
  "category": "single-attack",
  "levels": {
    "beginner": [
      {
        "comboId": 0, "level": 1, "name": "Jab", "moves": [
          { "move": "JAB", "pauseTime": 1000, "direction": "left", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 1, "level": 1, "name": "Cross", "moves": [
          { "move": "CROSS", "pauseTime": 1000, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 2, "level": 1, "name": "Lead Hook", "moves": [
          { "move": "LEAD\nHOOK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 3, "level": 1, "name": "Rear Hook", "moves": [
          { "move": "REAR\nHOOK", "pauseTime": 1100, "direction": "right", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 4, "level": 1, "name": "Lead Uppercut", "moves": [
          { "move": "LEAD\nUPPERCUT", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 5, "level": 1, "name": "Rear Uppercut", "moves": [
          { "move": "REAR\nUPPERCUT", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 6, "level": 1, "name": "Lead Elbow", "moves": [
          { "move": "LEAD\nELBOW", "pauseTime": 1600, "direction": "left", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 7, "level": 1, "name": "Rear Elbow", "moves": [
          { "move": "REAR\nELBOW", "pauseTime": 1600, "direction": "right", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 8, "level": 1, "name": "Lead Knee", "moves": [
          { "move": "LEAD\nKNEE", "pauseTime": 1700, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 9, "level": 1, "name": "Rear Knee", "moves": [
          { "move": "REAR\nKNEE", "pauseTime": 1700, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 10, "level": 1, "name": "Lead Low Kick", "moves": [
          { "move": "LEAD\nLOW KICK", "pauseTime": 2200, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 11, "level": 1, "name": "Rear Low Kick", "moves": [
          { "move": "REAR\nLOW KICK", "pauseTime": 2200, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 12, "level": 1, "name": "Lead High Kick", "moves": [
          { "move": "LEAD\nHIGH KICK", "pauseTime": 2300, "direction": "up", "tiltValue": 0.7 }
        ]
      },
      {
        "comboId": 13, "level": 1, "name": "Rear High Kick", "moves": [
          { "move": "REAR\nHIGH KICK", "pauseTime": 2300, "direction": "up", "tiltValue": 0.7 }
        ]
      },
      {
        "comboId": 14, "level": 1, "name": "Lead Push Kick", "moves": [
          { "move": "LEAD\nPUSH KICK", "pauseTime": 2100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 15, "level": 1, "name": "Rear Push Kick", "moves": [
          { "move": "REAR\nPUSH KICK", "pauseTime": 2100, "direction": "up", "tiltValue": 0.5 }
        ]
      }
    ],
    "intermediate": [],
    "advanced": []
  }
},
{
  "id": 4,
  "category": "single-defense",
  "levels": {
    "beginner": [
      {
        "comboId": 0, "level": 1, "name": "Slip", "moves": [
          { "move": "SLIP", "pauseTime": 1500, "direction": "down", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1, "level": 1, "name": "Roll", "moves": [
          { "move": "ROLL", "pauseTime": 1700, "direction": "down", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 2, "level": 1, "name": "Block", "moves": [
          { "move": "BLOCK", "pauseTime": 1000, "direction": "up", "tiltValue": 0.5 }
        ]
      }
    ],
    "intermediate": [],
    "advanced": []
  }
}
];
