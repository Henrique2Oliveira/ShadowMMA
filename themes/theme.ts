
// Typography settings
export const Typography = {
    fontFamily: 'CalSans',
} as const;

// Base color palette
const palette = {
    black: '#000000',
    white: '#FFFFFF',
    gray: {
        light: '#A8A8A8',
        medium: '#666666',
        dark: '#4D4D4D',
        darker: '#1A1A1A',
        level: '#575757'
    },
    red: {
        light: '#D64D6B',
        medium: '#D15A5A',
        dark: '#c9213aff'
    },
    green: {
        light: '#3EB516',
        dark: '#3F8531'
    },
    yellow: '#FCFFC9'
} as const;

// Theme color assignments
export const Colors = {
    // Text colors
    text: palette.white,
    lightText: palette.gray.light,
    
    // Background colors
    background: palette.gray.darker,
    cardColor: palette.black,
    bgDark: palette.black,
    
    // UI Elements
    button: palette.gray.dark,
    lightgray: palette.gray.medium,
    
    // Game specific
    timeGameBar: palette.red.medium,
    grayLevelBar: palette.gray.level,
    green: palette.green.light,
    darkGreen: palette.green.dark,
    yellow: palette.yellow,
    bgGame: palette.red.light,
    bgGameDark: palette.red.dark
} as const;
