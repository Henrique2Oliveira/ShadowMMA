// MMA Combinations Library
export const combinationSets = [{
  "id": 0,
  "category": "basic",
  "levels": {
    "Punches": [
      {
        "comboId": 0,
        "level": 1,
        "name": "1-2 (Jab Cross)",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 1,
        "level": 1,
        "name": "Cross Jab (2-1)",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 2,
        "level": 1,
        "name": "Double Jab",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "JAB",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 3,
        "level": 1,
        "name": "1-2-1 (Jab Cross Jab)",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 4,
        "level": 1,
        "name": "Double Jab Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 700,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 5,
        "level": 1,
        "name": "1-2-3",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1300,
            "direction": "left",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 6,
        "level": 4,
        "name": "1-2-3-2",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 7,
        "level": 5,
        "name": "Jab Cross Uppercut",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 700,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "CROSS",
            "pauseTime": 700,
            "direction": "right",
            "tiltValue": 0.2
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 8,
        "level": 1,
        "name": "Jab Body Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 9,
        "level": 1,
        "name": "Cross Body Jab",
        "moves": [
          {
            "move": "CROSS BODY",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 10,
        "level": 2,
        "name": "Double Body Hook",
        "moves": [
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK BODY",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 11,
        "level": 3,
        "name": "Head Body Head",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 12,
        "level": 4,
        "name": "Body Blitz",
        "moves": [
          {
            "move": "JAB BODY",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 13,
        "level": 5,
        "name": "Mixed Level Attack",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 14,
        "level": 2,
        "name": "LEFT Hook Cross",
        "moves": [
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 15,
        "level": 3,
        "name": "Cross LEFT Upper",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 16,
        "level": 3,
        "name": "Basic Slip Counter",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 17,
        "level": 4,
        "name": "Hook Upper Hook",
        "moves": [
          {
            "move": "LEFT HOOK",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 18,
        "level": 6,
        "name": "Slip Jab Cross",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 19,
        "level": 5,
        "name": "Level Change Combo",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 20,
        "level": 3,
        "name": "Cross Double Jab",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "JAB",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 21,
        "level": 3,
        "name": "1-2-1",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 22,
        "level": 4,
        "name": "Cross Hook Cross",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 23,
        "level": 5,
        "name": "1-2-5",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 24,
        "level": 5,
        "name": "1-6-3",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 25,
        "level": 6,
        "name": "Double Cross Combo",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 26,
        "level": 2,
        "name": "Jab Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 27,
        "level": 3,
        "name": "Cross Upper Cross",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 28,
        "level": 4,
        "name": "Body Head Combo",
        "moves": [
          {
            "move": "CROSS BODY",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 29,
        "level": 5,
        "name": "Upper Hook Cross",
        "moves": [
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 30,
        "level": 6,
        "name": "Jab Slip Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 31,
        "level": 4,
        "name": "1-2-3-6",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 32,
        "level": 5,
        "name": "2-3-2",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 33,
        "level": 5,
        "name": "5-6 Combo",
        "moves": [
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 34,
        "level": 6,
        "name": "Body Cross Hook",
        "moves": [
          {
            "move": "CROSS BODY",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 35,
        "level": 6,
        "name": "Uppercut Blitz",
        "moves": [
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 800,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 36,
        "level": 4,
        "name": "Jab Cross Body Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 37,
        "level": 5,
        "name": "Slip Hook Cross",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 38,
        "level": 6,
        "name": "Duck Upper Hook",
        "moves": [
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 39,
        "level": 2,
        "name": "Triple Jab",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 700,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 40,
        "level": 2,
        "name": "1-2-3 Body",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 41,
        "level": 3,
        "name": "Double Cross Jab",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 42,
        "level": 4,
        "name": "Hook Cross Hook",
        "moves": [
          {
            "move": "LEFT HOOK",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 43,
        "level": 5,
        "name": "Slip Cross Hook",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 44,
        "level": 6,
        "name": "Upper Cross Hook",
        "moves": [
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 45,
        "level": 3,
        "name": "1-2 Slip Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 46,
        "level": 4,
        "name": "Double Jab Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 47,
        "level": 5,
        "name": "Cross Upper Hook Cross",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 48,
        "level": 2,
        "name": "Jab Body Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 49,
        "level": 6,
        "name": "Slip Double Cross",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 40,
        "level": 2,
        "name": "Jab Right Overhand",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 41,
        "level": 2,
        "name": "Cross Left Overhand",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT OVERHAND",
            "pauseTime": 1200,
            "direction": "left",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 42,
        "level": 3,
        "name": "Double Jab Overhand",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 43,
        "level": 3,
        "name": "Overhand Cross",
        "moves": [
          {
            "move": "LEFT OVERHAND",
            "pauseTime": 1200,
            "direction": "left",
            "tiltValue": 0.6
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 44,
        "level": 4,
        "name": "Jab Cross Overhand",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 45,
        "level": 4,
        "name": "Overhand Hook Cross",
        "moves": [
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 46,
        "level": 5,
        "name": "Overhand Uppercut Hook",
        "moves": [
          {
            "move": "LEFT OVERHAND",
            "pauseTime": 1200,
            "direction": "left",
            "tiltValue": 0.6
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 47,
        "level": 5,
        "name": "Jab Cross Left Overhand",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT OVERHAND",
            "pauseTime": 1200,
            "direction": "left",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 48,
        "level": 6,
        "name": "Slip Cross Overhand",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 49,
        "level": 6,
        "name": "Overhand Double Hook",
        "moves": [
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 50,
        "level": 6,
        "name": "Jab Cross Hook Overhand",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 51,
        "level": 7,
        "name": "Double Jab Overhand Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 700,
            "direction": "left",
            "tiltValue": 0.2
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 52,
        "level": 7,
        "name": "Overhand Duck Hook",
        "moves": [
          {
            "move": "LEFT OVERHAND",
            "pauseTime": 1200,
            "direction": "left",
            "tiltValue": 0.6
          },
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 53,
        "level": 7,
        "name": "Slip Overhand Cross",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT OVERHAND",
            "pauseTime": 1200,
            "direction": "left",
            "tiltValue": 0.6
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 54,
        "level": 8,
        "name": "Overhand Cross Uppercut",
        "moves": [
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 55,
        "level": 8,
        "name": "Triple Attack Overhand",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT OVERHAND",
            "pauseTime": 1200,
            "direction": "right",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 56,
        "level": 4,
        "name": "Jab Cross Overhand Right",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "OVERHAND RIGHT",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 57,
        "level": 5,
        "name": "Slip Jab Cross Hook",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 58,
        "level": 5,
        "name": "Double Jab Cross Hook Body",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 59,
        "level": 6,
        "name": "Cross Hook Cross Uppercut",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 60,
        "level": 7,
        "name": "Duck Cross Hook Overhand Left",
        "moves": [
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "OVERHAND LEFT",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 61,
        "level": 4,
        "name": "Jab Cross Body Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 62,
        "level": 5,
        "name": "Double Jab Cross Slip Right",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 63,
        "level": 5,
        "name": "Hook Body Hook Cross",
        "moves": [
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 64,
        "level": 6,
        "name": "Jab Uppercut Cross Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 65,
        "level": 6,
        "name": "Slip Cross Hook Body Hook",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK BODY",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 66,
        "level": 6,
        "name": "Jab Cross Duck Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 67,
        "level": 7,
        "name": "Uppercut Hook Cross Overhand Right",
        "moves": [
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "OVERHAND RIGHT",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 68,
        "level": 7,
        "name": "Jab Cross Hook Slip Left Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 69,
        "level": 7,
        "name": "Double Jab Cross Uppercut Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 70,
        "level": 8,
        "name": "Slip Duck Cross Hook Cross",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 71,
        "level": 5,
        "name": "Body Jab Cross Hook Cross",
        "moves": [
          {
            "move": "JAB BODY",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 72,
        "level": 6,
        "name": "Jab Cross Uppercut Slip Left Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 73,
        "level": 6,
        "name": "Cross Hook Uppercut Hook",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 74,
        "level": 7,
        "name": "Duck Cross Hook Body Cross",
        "moves": [
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 75,
        "level": 7,
        "name": "Jab Cross Slip Right Uppercut Hook",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 76,
        "level": 7,
        "name": "Cross Hook Cross Overhand Left",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "OVERHAND LEFT",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 77,
        "level": 8,
        "name": "Slip Jab Cross Hook Duck Cross",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 78,
        "level": 8,
        "name": "Double Jab Cross Hook Uppercut Cross",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 79,
        "level": 8,
        "name": "Slip Cross Hook Body Hook Cross",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 80,
        "level": 9,
        "name": "Duck Slip Cross Hook Uppercut Overhand",
        "moves": [
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "OVERHAND RIGHT",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 81,
        "level": 6,
        "name": "Power Surge",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 82,
        "level": 6,
        "name": "Body Blitz",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 83,
        "level": 7,
        "name": "Slipstorm",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 84,
        "level": 7,
        "name": "Duck & Strike",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "DUCK",
            "pauseTime": 800,
            "direction": "down",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 85,
        "level": 7,
        "name": "Hook Wave",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 1100,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 86,
        "level": 8,
        "name": "Slipstream",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 87,
        "level": 8,
        "name": "Blitz Barrage",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 88,
        "level": 8,
        "name": "Rising Storm",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 89,
        "level": 8,
        "name": "Iron Fist",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 90,
        "level": 9,
        "name": "Phantom Strike",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 91,
        "level": 9,
        "name": "Cyclone",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 92,
        "level": 9,
        "name": "Thunderclap",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          }
        ]
      },
      {
        "comboId": 93,
        "level": 10,
        "name": "Vortex",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 94,
        "level": 10,
        "name": "Iron Curtain",
        "moves": [
          {
            "move": "CROSS",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 95,
        "level": 10,
        "name": "Stormbreaker",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 96,
        "level": 10,
        "name": "Tempest",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1100,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 97,
        "level": 10,
        "name": "Thunderbolt",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "CROSS BODY",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 98,
        "level": 10,
        "name": "Iron Gale",
        "moves": [
          {
            "move": "SLIP LEFT",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 99,
        "level": 10,
        "name": "Blade Rush",
        "moves": [
          {
            "move": "JAB",
            "pauseTime": 800,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "LEFT HOOK BODY",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          }
        ]
      },
      {
        "comboId": 100,
        "level": 10,
        "name": "Storm Breaker",
        "moves": [
          {
            "move": "SLIP RIGHT",
            "pauseTime": 800,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "JAB",
            "pauseTime": 900,
            "direction": "left",
            "tiltValue": 0.3
          },
          {
            "move": "CROSS",
            "pauseTime": 900,
            "direction": "right",
            "tiltValue": 0.3
          },
          {
            "move": "LEFT HOOK",
            "pauseTime": 1000,
            "direction": "left",
            "tiltValue": 0.4
          },
          {
            "move": "RIGHT HOOK",
            "pauseTime": 1000,
            "direction": "right",
            "tiltValue": 0.4
          },
          {
            "move": "LEFT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT UPPERCUT",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      }
    ],
    "Kicks": [
      {
        "comboId": 0,
        "level": 7,
        "name": "RIGHT Knee",
        "moves": [
          {
            "move": "RIGHT KNEE",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 1,
        "level": 7,
        "name": "LEFT Knee",
        "moves": [
          {
            "move": "LEFT KNEE",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 2,
        "level": 7,
        "name": "LEFT Low Kick",
        "moves": [
          {
            "move": "LEFT LOW KICK",
            "pauseTime": 1200,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 3,
        "level": 7,
        "name": "RIGHT Low Kick",
        "moves": [
          {
            "move": "RIGHT LOW KICK",
            "pauseTime": 1200,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 4,
        "level": 7,
        "name": "LEFT High Kick",
        "moves": [
          {
            "move": "LEFT HIGH KICK",
            "pauseTime": 1300,
            "direction": "up",
            "tiltValue": 0.7
          }
        ]
      },
      {
        "comboId": 5,
        "level": 7,
        "name": "RIGHT High Kick",
        "moves": [
          {
            "move": "RIGHT HIGH KICK",
            "pauseTime": 1300,
            "direction": "up",
            "tiltValue": 0.7
          }
        ]
      },
      {
        "comboId": 6,
        "level": 7,
        "name": "LEFT Push Kick",
        "moves": [
          {
            "move": "LEFT PUSH KICK",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 7,
        "level": 7,
        "name": "RIGHT Push Kick",
        "moves": [
          {
            "move": "RIGHT PUSH KICK",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.5
          }
        ]
      },
      {
        "comboId": 8,
        "level": 10,
        "name": "Knee Kick Combo",
        "moves": [
          {
            "move": "RIGHT KNEE",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "LEFT LOW KICK",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT HIGH KICK",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.7
          }
        ]
      },
      {
        "comboId": 9,
        "level": 15,
        "name": "Low-High Kick",
        "moves": [
          {
            "move": "LEFT LOW KICK",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT LOW KICK",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HIGH KICK",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.7
          }
        ]
      },
      {
        "comboId": 10,
        "level": 20,
        "name": "Push Kick Flow",
        "moves": [
          {
            "move": "LEFT PUSH KICK",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT PUSH KICK",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HIGH KICK",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.7
          },
          {
            "move": "RIGHT KNEE",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 11,
        "level": 25,
        "name": "Leg Barrage",
        "moves": [
          {
            "move": "LEFT LOW KICK",
            "pauseTime": 800,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT LOW KICK",
            "pauseTime": 800,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT PUSH KICK",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT HIGH KICK",
            "pauseTime": 1100,
            "direction": "up",
            "tiltValue": 0.7
          }
        ]
      },
      {
        "comboId": 12,
        "level": 27,
        "name": "Flying Knee Kick",
        "moves": [
          {
            "move": "RIGHT KNEE",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.6
          },
          {
            "move": "LEFT HIGH KICK",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.7
          },
          {
            "move": "RIGHT HIGH KICK",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.7
          },
          {
            "move": "LEFT KNEE",
            "pauseTime": 900,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      },
      {
        "comboId": 13,
        "level": 42,
        "name": "Kickstorm",
        "moves": [
          {
            "move": "LEFT PUSH KICK",
            "pauseTime": 800,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "RIGHT LOW KICK",
            "pauseTime": 800,
            "direction": "up",
            "tiltValue": 0.5
          },
          {
            "move": "LEFT HIGH KICK",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.7
          },
          {
            "move": "RIGHT HIGH KICK",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.7
          },
          {
            "move": "RIGHT KNEE",
            "pauseTime": 1000,
            "direction": "up",
            "tiltValue": 0.6
          }
        ]
      }
    ],
    "Defense": [
      {
        "comboId": 0, "level": 1, "name": "Slip Left", "moves": [
          { "move": "LEFT SLIP", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
        ]
      },
      {
        "comboId": 1, "level": 1, "name": "Slip Right", "moves": [
          { "move": "RIGHT SLIP", "pauseTime": 1000, "direction": "down", "tiltValue": 0.4 }
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
          { "move": "LEFT HOOK", "pauseTime": 800, "direction": "left", "tiltValue": 0.3 },
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
          { "move": "RIGHT UPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.5 }
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
          { "move": "RIGHT UPPERCUT", "pauseTime": 1000, "direction": "up", "tiltValue": 0.6 }
        ]
      }
    ]
  }
}
];
