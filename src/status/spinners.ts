/**
 * Spinner animation definitions
 * Ported from Python Rich / cli-spinners
 */

export interface SpinnerData {
  interval: number; // milliseconds between frames
  frames: string[] | string; // animation frames
}

export const SPINNERS: Record<string, SpinnerData> = {
  dots: {
    interval: 80,
    frames: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏',
  },
  dots2: {
    interval: 80,
    frames: '⣾⣽⣻⢿⡿⣟⣯⣷',
  },
  dots3: {
    interval: 80,
    frames: '⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓',
  },
  line: {
    interval: 130,
    frames: ['-', '\\', '|', '/'],
  },
  line2: {
    interval: 100,
    frames: '⠂-–—–-',
  },
  pipe: {
    interval: 100,
    frames: '┤┘┴└├┌┬┐',
  },
  simpleDots: {
    interval: 400,
    frames: ['.  ', '.. ', '...', '   '],
  },
  simpleDotsScrolling: {
    interval: 200,
    frames: ['.  ', '.. ', '...', ' ..', '  .', '   '],
  },
  star: {
    interval: 70,
    frames: '✶✸✹✺✹✷',
  },
  star2: {
    interval: 80,
    frames: '+x*',
  },
  flip: {
    interval: 70,
    frames: "___-``'´-___",
  },
  hamburger: {
    interval: 100,
    frames: '☱☲☴',
  },
  growVertical: {
    interval: 120,
    frames: '▁▃▄▅▆▇▆▅▄▃',
  },
  growHorizontal: {
    interval: 120,
    frames: '▏▎▍▌▋▊▉▊▋▌▍▎',
  },
  balloon: {
    interval: 140,
    frames: ' .oO@* ',
  },
  balloon2: {
    interval: 120,
    frames: '.oO°Oo.',
  },
  noise: {
    interval: 100,
    frames: '▓▒░',
  },
  bounce: {
    interval: 120,
    frames: '⠁⠂⠄⠂',
  },
  boxBounce: {
    interval: 120,
    frames: '▖▘▝▗',
  },
  boxBounce2: {
    interval: 100,
    frames: '▌▀▐▄',
  },
  triangle: {
    interval: 50,
    frames: '◢◣◤◥',
  },
  arc: {
    interval: 100,
    frames: '◜◠◝◞◡◟',
  },
  circle: {
    interval: 120,
    frames: '◡⊙◠',
  },
  squareCorners: {
    interval: 180,
    frames: '◰◳◲◱',
  },
  circleQuarters: {
    interval: 120,
    frames: '◴◷◶◵',
  },
  circleHalves: {
    interval: 50,
    frames: '◐◓◑◒',
  },
  toggle: {
    interval: 250,
    frames: '⊶⊷',
  },
  toggle2: {
    interval: 80,
    frames: '▫▪',
  },
  toggle3: {
    interval: 120,
    frames: '□■',
  },
  arrow: {
    interval: 100,
    frames: '←↖↑↗→↘↓↙',
  },
  arrow3: {
    interval: 120,
    frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
  },
  bouncingBar: {
    interval: 80,
    frames: [
      '[    ]',
      '[=   ]',
      '[==  ]',
      '[=== ]',
      '[ ===]',
      '[  ==]',
      '[   =]',
      '[    ]',
      '[   =]',
      '[  ==]',
      '[ ===]',
      '[====]',
      '[=== ]',
      '[==  ]',
      '[=   ]',
    ],
  },
  bouncingBall: {
    interval: 80,
    frames: [
      '( ●    )',
      '(  ●   )',
      '(   ●  )',
      '(    ● )',
      '(     ●)',
      '(    ● )',
      '(   ●  )',
      '(  ●   )',
      '( ●    )',
      '(●     )',
    ],
  },
  smiley: {
    interval: 200,
    frames: ['😄 ', '😝 '],
  },
  monkey: {
    interval: 300,
    frames: ['🙈 ', '🙈 ', '🙉 ', '🙊 '],
  },
  hearts: {
    interval: 100,
    frames: ['💛 ', '💙 ', '💜 ', '💚 ', '❤️ '],
  },
  clock: {
    interval: 100,
    frames: ['🕛 ', '🕐 ', '🕑 ', '🕒 ', '🕓 ', '🕔 ', '🕕 ', '🕖 ', '🕗 ', '🕘 ', '🕙 ', '🕚 '],
  },
  earth: {
    interval: 180,
    frames: ['🌍 ', '🌎 ', '🌏 '],
  },
  moon: {
    interval: 80,
    frames: ['🌑 ', '🌒 ', '🌓 ', '🌔 ', '🌕 ', '🌖 ', '🌗 ', '🌘 '],
  },
  runner: {
    interval: 140,
    frames: ['🚶 ', '🏃 '],
  },
  weather: {
    interval: 100,
    frames: [
      '☀️ ',
      '🌤 ',
      '⛅️ ',
      '🌥 ',
      '☁️ ',
      '🌧 ',
      '🌨 ',
      '⛈ ',
      '🌧 ',
      '☁️ ',
      '🌥 ',
      '⛅️ ',
      '🌤 ',
      '☀️ ',
    ],
  },
  christmas: {
    interval: 400,
    frames: '🌲🎄',
  },
  point: {
    interval: 125,
    frames: ['∙∙∙', '●∙∙', '∙●∙', '∙∙●', '∙∙∙'],
  },
  layer: {
    interval: 150,
    frames: '-=≡',
  },
  aesthetic: {
    interval: 80,
    frames: [
      '▰▱▱▱▱▱▱',
      '▰▰▱▱▱▱▱',
      '▰▰▰▱▱▱▱',
      '▰▰▰▰▱▱▱',
      '▰▰▰▰▰▱▱',
      '▰▰▰▰▰▰▱',
      '▰▰▰▰▰▰▰',
      '▰▱▱▱▱▱▱',
    ],
  },
};

/**
 * Get spinner data by name
 */
export function getSpinner(name: string): SpinnerData | undefined {
  return SPINNERS[name];
}

/**
 * List all available spinner names
 */
export function listSpinners(): string[] {
  return Object.keys(SPINNERS);
}
