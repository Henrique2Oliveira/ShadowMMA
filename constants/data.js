// MMA Combinations Library
export const combinationSets = [
  {
    "id": 0,
    "category": "basic",
    "levels": {
      "Punches": [
        {
          "comboId": 0,
          "level": 1,
          "name": "Classic One-Two",
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
          "name": "Reverse Entry",
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
          "name": "Twin Sting",
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
          "name": "Triple Threat",
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
          "name": "Jab Jab Boom",
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
          "level": 2,
          "name": "Hooked on Power",
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
          "level": 3,
          "name": "Quad Strike",
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
          "level": 4,
          "name": "Uppercut Surprise",
          "proOnly": true,
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
          "level": 2,
          "name": "Body Sniper",
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
          "level": 2,
          "name": "Body Reversal",
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
          "level": 3,
          "name": "Body Barrage",
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
          "level": 7,
          "name": "Body Barrage II",
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
            },
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
          "comboId": 12,
          "level": 12,
          "name": "Body Barrage III",
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
            },
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
            },
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
          "comboId": 13,
          "level": 20,
          "name": "Body Barrage IV",
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
            },
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
            },
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
            },
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
          "comboId": 14,
          "level": 5,
          "name": "Sandwich Combo",
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
          "comboId": 15,
          "level": 6,
          "name": "Blitz to the Body",
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
          "comboId": 16,
          "level": 6,
          "name": "Level Mixer",
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
          "comboId": 17,
          "level": 7,
          "name": "Southpaw Snap",
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
          "comboId": 18,
          "level": 7,
          "name": "Uppercut Switch",
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
          "comboId": 19,
          "level": 8,
          "name": "Slip and Strike",
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
          "comboId": 20,
          "level": 13,
          "name": "Slip and Strike II",
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
            }
          ]
        },
        {
          "comboId": 21,
          "level": 18,
          "name": "Slip and Strike III",
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
          "comboId": 22,
          "level": 24,
          "name": "Slip and Strike IV",
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
            }
          ]
        },
        {
          "comboId": 23,
          "level": 9,
          "name": "Hookstorm",
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
          "comboId": 24,
          "level": 14,
          "name": "Hookstorm II",
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
            },
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
          "comboId": 25,
          "level": 19,
          "name": "Hookstorm III",
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
            },
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
            },
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
          "comboId": 26,
          "level": 25,
          "name": "Hookstorm IV",
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
            },
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
            },
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
            },
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
          "comboId": 27,
          "level": 10,
          "name": "Slipstream Entry",
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
          "comboId": 28,
          "level": 10,
          "name": "Level Changer",
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
          "comboId": 29,
          "level": 11,
          "name": "Double Tap Return",
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
          "comboId": 30,
          "level": 12,
          "name": "Jab Sandwich",
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
          "comboId": 31,
          "level": 13,
          "name": "Crossfire",
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
          "comboId": 32,
          "level": 14,
          "name": "Uppercut Insertion",
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
          "comboId": 33,
          "level": 15,
          "name": "Upper-Hook Flow",
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
          "comboId": 34,
          "level": 16,
          "name": "Double Trouble",
          "moves": [
            {
              "move": "CROSS",
              "pauseTime": 800,
              "direction": "right",
              "tiltValue": 0.3
            },
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
            }
          ]
        },
        {
          "comboId": 35,
          "level": 17,
          "name": "Jab & Swing",
          "moves": [
            {
              "move": "JAB",
              "pauseTime": 1200,
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
          "comboId": 36,
          "level": 18,
          "name": "Uppercut Sandwich",
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
          "comboId": 37,
          "level": 19,
          "name": "Body-Head Switch",
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
          "comboId": 38,
          "level": 20,
          "name": "Uppercut Hookdown",
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
          "comboId": 39,
          "level": 20,
          "name": "Jab & Weave",
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
          "comboId": 40,
          "level": 20,
          "name": "Combo Cascade",
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
          "comboId": 41,
          "level": 21,
          "name": "Cross-Hook-Cross",
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
          "comboId": 42,
          "level": 22,
          "name": "Uppercut Twins",
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
          "comboId": 43,
          "level": 23,
          "name": "Body Crossfire",
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
          "comboId": 44,
          "level": 24,
          "name": "Blitzing Uppers",
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
          "comboId": 45,
          "level": 25,
          "name": "Body Breaker",
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
          "comboId": 46,
          "level": 26,
          "name": "Slip & Rip",
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
          "comboId": 47,
          "level": 27,
          "name": "Duck and Deliver",
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
          "comboId": 48,
          "level": 27,
          "name": "Jab Machine",
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
          "comboId": 49,
          "level": 29,
          "name": "Body Cascade",
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
          "comboId": 50,
          "level": 30,
          "name": "Crossed Up",
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
          "comboId": 51,
          "level": 31,
          "name": "Hook Sandwich",
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
          "comboId": 52,
          "level": 32,
          "name": "Slip and Swing",
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
          "comboId": 53,
          "level": 33,
          "name": "Uppercut Crossfire",
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
          "comboId": 54,
          "level": 34,
          "name": "Slipstream Combo",
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
          "comboId": 55,
          "level": 34,
          "name": "Jab Jab Swing",
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
          "comboId": 56,
          "level": 35,
          "name": "Crossed Up Uppers",
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
          "comboId": 57,
          "level": 36,
          "name": "Jab to the Core",
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
          "comboId": 58,
          "level": 37,
          "name": "Slip and Double Down",
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
          "comboId": 59,
          "level": 38,
          "name": "Overhand Entry",
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
          "comboId": 60,
          "level": 39,
          "name": "Southpaw Overhand",
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
          "comboId": 61,
          "level": 40,
          "name": "Jab Jab Overhand",
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
          "comboId": 62,
          "level": 41,
          "name": "Overhand Return",
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
          "comboId": 63,
          "level": 42,
          "name": "Overhand Finisher",
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
          "comboId": 64,
          "level": 44,
          "name": "Overhand Sandwich",
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
          "comboId": 65,
          "level": 45,
          "name": "Overhand Uppercut Surprise",
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
          "comboId": 66,
          "level": 46,
          "name": "Left Overhand Entry",
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
          "comboId": 67,
          "level": 47,
          "name": "Slip and Overhand",
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
          "comboId": 68,
          "level": 48,
          "name": "Overhand Double Down",
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
          "comboId": 69,
          "level": 50,
          "name": "Overhand Storm",
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
          "comboId": 70,
          "level": 51,
          "name": "Jab Jab Overhand Cross",
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
          "comboId": 71,
          "level": 52,
          "name": "Overhand Duck & Hook",
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
          "comboId": 72,
          "level": 53,
          "name": "Slip and Overhand Cross",
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
          "comboId": 73,
          "level": 54,
          "name": "Overhand Uppercut Combo",
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
          "comboId": 74,
          "level": 55,
          "name": "Triple Threat Overhand",
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
          "comboId": 75,
          "level": 56,
          "name": "Right Overhand Entry",
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
          "comboId": 76,
          "level": 57,
          "name": "Slip and Combo",
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
          "comboId": 77,
          "level": 58,
          "name": "Body Combo Machine",
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
          "comboId": 78,
          "level": 59,
          "name": "Cross-Hook-Upper",
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
          "comboId": 79,
          "level": 60,
          "name": "Left Overhand Finale",
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
          "comboId": 80,
          "level": 30,
          "name": "Elbow Body Breaker",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 81,
          "level": 32,
          "name": "Elbow Slip Machine",
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
            },
            {
              "move": "LEFT ELBOW",
              "pauseTime": 900,
              "direction": "left",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 82,
          "level": 33,
          "name": "Elbow Hookstorm",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 83,
          "level": 34,
          "name": "Elbow Upper Blitz",
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
            },
            {
              "move": "LEFT ELBOW",
              "pauseTime": 900,
              "direction": "left",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 84,
          "level": 35,
          "name": "Elbow Slip & Rip",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 85,
          "level": 36,
          "name": "Elbow Duck & Cross",
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
            },
            {
              "move": "LEFT ELBOW",
              "pauseTime": 900,
              "direction": "left",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 86,
          "level": 38,
          "name": "Elbow Overhand Barrage",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 87,
          "level": 39,
          "name": "Elbow Slipstream",
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
            },
            {
              "move": "LEFT ELBOW",
              "pauseTime": 900,
              "direction": "left",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 88,
          "level": 40,
          "name": "Elbow Combo Machine",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 89,
          "level": 41,
          "name": "Elbow Duckstorm",
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
            },
            {
              "move": "LEFT ELBOW",
              "pauseTime": 900,
              "direction": "left",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 90,
          "level": 71,
          "name": "Elbow Body Cascade",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 91,
          "level": 72,
          "name": "Elbow Uppercut Slip",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 92,
          "level": 73,
          "name": "Elbow Cross-Hook Fury",
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
            },
            {
              "move": "LEFT ELBOW",
              "pauseTime": 900,
              "direction": "left",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 93,
          "level": 74,
          "name": "Elbow Duck & Body",
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
            },
            {
              "move": "LEFT ELBOW",
              "pauseTime": 900,
              "direction": "left",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 94,
          "level": 75,
          "name": "Elbow Slip & Combo",
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
            },
            {
              "move": "RIGHT ELBOW",
              "pauseTime": 900,
              "direction": "right",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 95,
          "level": 76,
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
          "comboId": 96,
          "level": 77,
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
          "comboId": 97,
          "level": 78,
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
          "comboId": 98,
          "level": 79,
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
          "comboId": 99,
          "level": 80,
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
          "comboId": 100,
          "level": 81,
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
          "comboId": 101,
          "level": 82,
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
          "comboId": 102,
          "level": 83,
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
          "comboId": 103,
          "level": 84,
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
          "comboId": 104,
          "level": 85,
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
          "comboId": 105,
          "level": 86,
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
          "comboId": 106,
          "level": 87,
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
          "comboId": 107,
          "level": 88,
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
          "comboId": 108,
          "level": 89,
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
          "comboId": 109,
          "level": 90,
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
          "comboId": 110,
          "level": 91,
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
          "comboId": 111,
          "level": 92,
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
          "comboId": 112,
          "level": 93,
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
          "comboId": 113,
          "level": 94,
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
          "comboId": 114,
          "level": 95,
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
          "comboId": 115,
          "level": 96,
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
          "comboId": 116,
          "level": 97,
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
          "comboId": 117,
          "level": 98,
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
          "comboId": 118,
          "level": 99,
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
          "comboId": 119,
          "level": 100,
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
          "comboId": 120,
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
          "comboId": 121,
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
          "comboId": 122,
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
          "comboId": 123,
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
          "comboId": 124,
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
          "comboId": 125,
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
          "comboId": 126,
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
          "comboId": 127,
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
          "comboId": 128,
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
          "comboId": 129,
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
          "comboId": 130,
          "level": 20,
          "name": "Push Kick Flow",
          "moves": [
            {
              "move": "RIGHT PUSH KICK",
              "pauseTime": 1500,
              "direction": "up",
              "tiltValue": 0.5
            },
            {
              "move": "LEFT HIGH KICK",
              "pauseTime": 1300,
              "direction": "up",
              "tiltValue": 0.7
            },
            {
              "move": "RIGHT KNEE",
              "pauseTime": 1200,
              "direction": "up",
              "tiltValue": 0.6
            }
          ]
        },
        {
          "comboId": 131,
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
          "comboId": 132,
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
          "comboId": 133,
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
          "comboId": 134,
          "level": 1,
          "name": "Slip Left",
          "moves": [
            {
              "move": "LEFT SLIP",
              "pauseTime": 1000,
              "direction": "down",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 135,
          "level": 1,
          "name": "Slip Right",
          "moves": [
            {
              "move": "RIGHT SLIP",
              "pauseTime": 1000,
              "direction": "down",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 136,
          "level": 1,
          "name": "Roll",
          "moves": [
            {
              "move": "ROLL",
              "pauseTime": 1000,
              "direction": "down",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 137,
          "level": 1,
          "name": "Block",
          "moves": [
            {
              "move": "BLOCK",
              "pauseTime": 800,
              "direction": "up",
              "tiltValue": 0.5
            }
          ]
        },
        {
          "comboId": 138,
          "level": 1,
          "name": "Slip and Jab",
          "moves": [
            {
              "move": "SLIP",
              "pauseTime": 1100,
              "direction": "down",
              "tiltValue": 0.4
            },
            {
              "move": "JAB",
              "pauseTime": 1100,
              "direction": "left",
              "tiltValue": 0.2
            }
          ]
        },
        {
          "comboId": 139,
          "level": 1,
          "name": "Block and Cross",
          "moves": [
            {
              "move": "BLOCK",
              "pauseTime": 800,
              "direction": "up",
              "tiltValue": 0.5
            },
            {
              "move": "CROSS",
              "pauseTime": 800,
              "direction": "right",
              "tiltValue": 0.3
            }
          ]
        },
        {
          "comboId": 140,
          "level": 2,
          "name": "Slip Block",
          "moves": [
            {
              "move": "SLIP",
              "pauseTime": 700,
              "direction": "down",
              "tiltValue": 0.4
            },
            {
              "move": "BLOCK",
              "pauseTime": 700,
              "direction": "up",
              "tiltValue": 0.4
            }
          ]
        },
        {
          "comboId": 141,
          "level": 3,
          "name": "Slip, Hook, Roll",
          "moves": [
            {
              "move": "SLIP",
              "pauseTime": 800,
              "direction": "down",
              "tiltValue": 0.3
            },
            {
              "move": "LEFT HOOK",
              "pauseTime": 800,
              "direction": "left",
              "tiltValue": 0.3
            },
            {
              "move": "ROLL",
              "pauseTime": 1000,
              "direction": "down",
              "tiltValue": 0.3
            }
          ]
        },
        {
          "comboId": 142,
          "level": 4,
          "name": "Roll Slip Block",
          "moves": [
            {
              "move": "ROLL",
              "pauseTime": 900,
              "direction": "down",
              "tiltValue": 0.3
            },
            {
              "move": "SLIP",
              "pauseTime": 800,
              "direction": "down",
              "tiltValue": 0.3
            },
            {
              "move": "BLOCK",
              "pauseTime": 600,
              "direction": "up",
              "tiltValue": 0.3
            }
          ]
        },
        {
          "comboId": 143,
          "level": 5,
          "name": "Roll, Block, Uppercut",
          "moves": [
            {
              "move": "ROLL",
              "pauseTime": 1000,
              "direction": "down",
              "tiltValue": 0.4
            },
            {
              "move": "BLOCK",
              "pauseTime": 600,
              "direction": "up",
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
          "comboId": 144,
          "level": 6,
          "name": "Defense to Attack",
          "moves": [
            {
              "move": "BLOCK",
              "pauseTime": 900,
              "direction": "down",
              "tiltValue": 0.3
            },
            {
              "move": "SLIP",
              "pauseTime": 1000,
              "direction": "down",
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
          "comboId": 145,
          "level": 10,
          "name": "Double Roll Uppercut",
          "moves": [
            {
              "move": "ROLL",
              "pauseTime": 1200,
              "direction": "up",
              "tiltValue": 0.3
            },
            {
              "move": "ROLL",
              "pauseTime": 1200,
              "direction": "up",
              "tiltValue": 0.3
            },
            {
              "move": "RIGHT UPPERCUT",
              "pauseTime": 1000,
              "direction": "up",
              "tiltValue": 0.6
            }
          ]
        }
      ]
    }
  }
];
