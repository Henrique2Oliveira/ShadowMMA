// MMA Combinations Library
export const combinationSets = [{
  "id": 0,
  "category": "basic",
  "levels": {
    "Punches": [
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
          { "move": "LEFT\nHOOK", "pauseTime": 1300, "direction": "left", "tiltValue": 0.5 }
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
          { "move": "LEFT\nHOOK", "pauseTime": 1100, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 5, "level": 5, "name": "Jab Cross Uppercut", "moves": [
          { "move": "JAB", "pauseTime": 700, "direction": "left", "tiltValue": 0.2 },
          { "move": "CROSS", "pauseTime": 700, "direction": "right", "tiltValue": 0.2 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 900, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 9, "level": 2, "name": "Double Body Hook", "moves": [
          { "move": "LEFT\nHOOK\nBODY", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nHOOK\nBODY", "pauseTime": 1100, "direction": "right", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 10, "level": 3, "name": "Head Body Head", "moves": [
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS\nBODY", "pauseTime": 900, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEFT\nHOOK", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 11, "level": 4, "name": "Body Blitz", "moves": [
          { "move": "JAB\nBODY", "pauseTime": 900, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS\nBODY", "pauseTime": 900, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEFT\nHOOK\nBODY", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 12, "level": 5, "name": "Mixed Level Attack", "moves": [
          { "move": "JAB", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "CROSS\nBODY", "pauseTime": 900, "direction": "right", "tiltValue": 0.4 },
          { "move": "LEFT\nHOOK\nBODY", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 13, "level": 2, "name": "LEFT Hook Cross", "moves": [
          { "move": "LEFT\nHOOK", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 },
          { "move": "CROSS", "pauseTime": 1100, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 14, "level": 3, "name": "Cross LEFT Upper", "moves": [
          { "move": "CROSS", "pauseTime": 900, "direction": "right", "tiltValue": 0.3 },
          { "move": "LEFT\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.4 }
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
          { "move": "LEFT\nHOOK", "pauseTime": 900, "direction": "left", "tiltValue": 0.4 },
          { "move": "LEFT\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.4 },
          { "move": "RIGHT\nHOOK", "pauseTime": 1100, "direction": "right", "tiltValue": 0.4 }
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
          { "move": "LEFT\nHOOK", "pauseTime": 1000, "direction": "left", "tiltValue": 0.4 }
        ]
      }
    ],
    "Kicks": [
      {
        "comboId": 0,
        "level": 1,
        "name": "RIGHT Knee",
        "moves": [
          { "move": "RIGHT\nKNEE", "pauseTime": 1100, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 1,
        "level": 1,
        "name": "LEFT Knee",
        "moves": [
          { "move": "LEFT\nKNEE", "pauseTime": 1100, "direction": "up", "tiltValue": 0.6 }
        ]
      },
      {
        "comboId": 2,
        "level": 1,
        "name": "LEFT Low Kick",
        "moves": [
          { "move": "LEFT\nLOW KICK", "pauseTime": 1200, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 3,
        "level": 1,
        "name": "RIGHT Low Kick",
        "moves": [
          { "move": "RIGHT\nLOW KICK", "pauseTime": 1200, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 4,
        "level": 1,
        "name": "LEFT High Kick",
        "moves": [
          { "move": "LEFT\nHIGH KICK", "pauseTime": 1300, "direction": "up", "tiltValue": 0.7 }
        ]
      },
      {
        "comboId": 5,
        "level": 1,
        "name": "RIGHT High Kick",
        "moves": [
          { "move": "RIGHT\nHIGH KICK", "pauseTime": 1300, "direction": "up", "tiltValue": 0.7 }
        ]
      },
      {
        "comboId": 6,
        "level": 1,
        "name": "LEFT Push Kick",
        "moves": [
          { "move": "LEFT\nPUSH KICK", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 7,
        "level": 1,
        "name": "RIGHT Push Kick",
        "moves": [
          { "move": "RIGHT\nPUSH KICK", "pauseTime": 1100, "direction": "up", "tiltValue": 0.5 }
        ]
      },
    ],
    "Defense": [
      {
        "comboId": 0, "level": 1, "name": "Slip Left", "moves": [
          { "move": "LEFT\nSLIP", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1, "level": 1, "name": "Slip Right", "moves": [
          { "move": "RIGHT\nSLIP", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
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
      },
      {
        "comboId": 7,
        "level": 3,
        "name": "Slip, Hook, Roll",
        "moves": [
          { "move": "SLIP", "pauseTime": 800, "direction": "down", "tiltValue": 0.3 },
          { "move": "LEFT\nHOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
          { "move": "ROLL", "pauseTime": 1000, "direction": "down", "tiltValue": 0.3 }
        ]
      }
      ,
      {
        "comboId": 8,
        "level": 4,
        "name": "Roll Slip Block",
        "moves": [
          { "move": "ROLL", "pauseTime": 900, "direction": "down", "tiltValue": 0.3 },
          { "move": "SLIP", "pauseTime": 800, "direction": "down", "tiltValue": 0.3 },
          { "move": "BLOCK", "pauseTime": 600, "direction": "up", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 9,
        "level": 5,
        "name": "Roll, Block, Uppercut",
        "moves": [
          { "move": "ROLL", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 },
          { "move": "BLOCK", "pauseTime": 600, "direction": "up", "tiltValue": 0.3 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.5 }
        ]
      },
      {
        "comboId": 10,
        "level": 6,
        "name": "Defense to Attack",
        "moves": [
          { "move": "BLOCK", "pauseTime": 900, "direction": "down", "tiltValue": 0.3 },
          { "move": "SLIP", "pauseTime": 1000, "direction": "down", "tiltValue": 0.3 },
          { "move": "CROSS", "pauseTime": 1000, "direction": "right", "tiltValue": 0.3 }
        ]
      },
      {
        "comboId": 11,
        "level": 10,
        "name": "Double Roll Uppercut",
        "moves": [
          { "move": "ROLL", "pauseTime": 1200, "direction": "up", "tiltValue": 0.3 },
          { "move": "ROLL", "pauseTime": 1200, "direction": "up", "tiltValue": 0.3 },
          { "move": "RIGHT\nUPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.6 }
        ]
      }
    ]
  }
}
];
