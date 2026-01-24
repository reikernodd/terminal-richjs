import { Color } from '../utils/color';

export class Palette {
  constructor(public colors: Record<string, string> = {}) {}

  get(name: string): string | undefined {
    return this.colors[name];
  }

  /**
   * Generates a simple palette from a primary color.
   */
  static fromPrimary(primary: string): Palette {
    const p = new Color(primary);
    return new Palette({
      primary: p.hex,
      secondary: p.lighten(20).hex,
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      error: '#cf6679',
      success: '#03dac6',
      warning: '#bb86fc'
    });
  }
}

export const DEFAULT_PALETTE = new Palette({
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545',
  light: '#f8f9fa',
  dark: '#343a40',
});
