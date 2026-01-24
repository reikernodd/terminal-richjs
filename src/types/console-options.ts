import { Theme } from '../themes/theme';

export type ColorSystem = 'standard' | '256' | 'truecolor' | 'none';

// Removed generic interface definition for Theme as we have a class now
// export interface Theme {
//   [key: string]: string;
// }

export interface ConsoleOptions {
  /**
   * The width of the console in characters.
   * If not provided, it will be detected automatically.
   */
  width?: number;

  /**
   * The height of the console in lines.
   * If not provided, it will be detected automatically.
   */
  height?: number;

  /**
   * The color system to use.
   * If not provided, it will be detected automatically.
   */
  colorSystem?: ColorSystem;

  /**
   * Whether to force terminal output even if not a TTY.
   */
  forceTerminal?: boolean;

  /**
   * Theme configuration.
   */
  theme?: Theme;

  /**
   * Whether to record output for later export.
   */
  record?: boolean;
}