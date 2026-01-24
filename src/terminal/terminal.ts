import terminalSize from 'terminal-size';
import os from 'os';
import process from 'process';

export type ColorSystem = 'standard' | '256' | 'truecolor' | 'none';

export class Terminal {
  constructor() {}

  get width(): number {
    return terminalSize().columns;
  }

  get height(): number {
    return terminalSize().rows;
  }

  get isInteractive(): boolean {
    return !!process.stdout.isTTY;
  }

  get isLegacyWindows(): boolean {
    return os.platform() === 'win32' && !process.env.WT_SESSION;
  }

  get colorSystem(): ColorSystem {
    // Basic detection logic based on env vars
    // In a real implementation we might use 'supports-color' package or similar logic
    const env = process.env;

    if (env.NO_COLOR) return 'none';

    if (env.COLORTERM === 'truecolor' || env.COLORTERM === '24bit') {
      return 'truecolor';
    }

    if (this.isLegacyWindows) {
      return 'standard'; 
    }

    // Default to standard or 256 based on TERM
    if (env.TERM && env.TERM.includes('256')) {
      return '256';
    }

    return 'standard';
  }
}
