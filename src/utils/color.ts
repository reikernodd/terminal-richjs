import tinycolor from 'tinycolor2';

export class Color {
  private tc: tinycolor.Instance;

  constructor(color: string | tinycolor.ColorInput) {
    this.tc = tinycolor(color);
  }

  static parse(color: string): Color {
    return new Color(color);
  }

  get hex(): string {
    return this.tc.toHexString();
  }

  get rgb(): { r: number, g: number, b: number } {
    return this.tc.toRgb();
  }

  get isDark(): boolean {
    return this.tc.isDark();
  }

  get isLight(): boolean {
    return this.tc.isLight();
  }

  contrast(other: Color): number {
    return tinycolor.readability(this.tc, other.tc);
  }

  lighten(amount: number = 10): Color {
    return new Color(this.tc.lighten(amount));
  }

  darken(amount: number = 10): Color {
    return new Color(this.tc.darken(amount));
  }

  /**
   * Returns a readable foreground color (black or white) for this background color.
   */
  getContrastColor(): Color {
    return this.isDark ? new Color('#ffffff') : new Color('#000000');
  }
}
