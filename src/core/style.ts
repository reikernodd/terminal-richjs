/** biome-ignore-all lint/suspicious/noExplicitAny: false */
/** biome-ignore-all assist/source/organizeImports: false */
import chalk from 'chalk';
import type { StyleOptions, Color, RGB } from '../types/style-types';

export class Style {
  /**
   * Apply this style to text (alias for render).
   */
  apply(text: string): string {
    return this.render(text);
  }
  readonly color?: Color;
  readonly backgroundColor?: Color;
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly underline?: boolean;
  readonly strikethrough?: boolean;
  readonly dim?: boolean;
  readonly reverse?: boolean;
  readonly blink?: boolean;
  readonly hidden?: boolean;

  constructor(options: StyleOptions = {}) {
    this.color = options.color;
    this.backgroundColor = options.backgroundColor;
    this.bold = options.bold;
    this.italic = options.italic;
    this.underline = options.underline;
    this.strikethrough = options.strikethrough;
    this.dim = options.dim;
    this.reverse = options.reverse;
    this.blink = options.blink;
    this.hidden = options.hidden;
  }

  static null(): Style {
    return new Style({});
  }

  /**
   * Parse a style string into a Style object.
   * Supports:
   * - Modifiers: bold, italic, underline, dim, strike, reverse, blink, hidden
   * - Named colors: red, green, blue, cyan, magenta, yellow, white, black
   * - Bright colors: bright_red, bright_green, etc.
   * - Hex colors: #ff0000
   * - RGB colors: rgb(255,0,0)
   * - 256 colors: color(196)
   * - Background: on red, on #ff0000, on rgb(255,0,0)
   */
  static parse(styleString: string): Style {
    if (!styleString.trim()) return Style.null();

    const options: StyleOptions = {};
    const words = styleString.trim().split(/\s+/);
    let i = 0;

    while (i < words.length) {
      const word = words[i];

      // Check for modifiers
      if (word === 'bold') {
        options.bold = true;
        i++;
        continue;
      }
      if (word === 'italic') {
        options.italic = true;
        i++;
        continue;
      }
      if (word === 'underline') {
        options.underline = true;
        i++;
        continue;
      }
      if (word === 'strike' || word === 'strikethrough') {
        options.strikethrough = true;
        i++;
        continue;
      }
      if (word === 'dim') {
        options.dim = true;
        i++;
        continue;
      }
      if (word === 'reverse') {
        options.reverse = true;
        i++;
        continue;
      }
      if (word === 'blink') {
        options.blink = true;
        i++;
        continue;
      }
      if (word === 'hidden') {
        options.hidden = true;
        i++;
        continue;
      }

      // Check for background color prefix "on"
      if (word === 'on') {
        if (i + 1 < words.length) {
          const bgColor = Style.parseColor(words[i + 1]);
          if (bgColor !== null) {
            options.backgroundColor = bgColor;
            i += 2;
            continue;
          }
        }
        i++;
        continue;
      }

      // Check for color
      const color = Style.parseColor(word);
      if (color !== null) {
        options.color = color;
        i++;
        continue;
      }

      // Unknown word, skip
      i++;
    }

    return new Style(options);
  }

  /**
   * Parse a single color value.
   * Supports hex (#ff0000), RGB (rgb(255,0,0)), 256-color (color(196)), and named colors.
   */
  private static parseColor(word: string): Color | null {
    // Hex color: #ff0000 or #f00
    if (word.startsWith('#')) {
      if (/^#[0-9a-fA-F]{6}$/.test(word) || /^#[0-9a-fA-F]{3}$/.test(word)) {
        return word;
      }
      return null;
    }

    // RGB color: rgb(255,0,0) or rgb(255, 0, 0)
    const rgbMatch = word.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgbMatch) {
      return {
        r: Math.min(255, parseInt(rgbMatch[1], 10)),
        g: Math.min(255, parseInt(rgbMatch[2], 10)),
        b: Math.min(255, parseInt(rgbMatch[3], 10)),
      };
    }

    // 256-color: color(196)
    const color256Match = word.match(/^color\(\s*(\d+)\s*\)$/i);
    if (color256Match) {
      return Math.min(255, parseInt(color256Match[1], 10));
    }

    // Named colors (including bright_ variants)
    const namedColors = [
      'black',
      'red',
      'green',
      'yellow',
      'blue',
      'magenta',
      'cyan',
      'white',
      'gray',
      'grey',
      'blackBright',
      'redBright',
      'greenBright',
      'yellowBright',
      'blueBright',
      'magentaBright',
      'cyanBright',
      'whiteBright',
      // Underscore variants commonly used
      'bright_black',
      'bright_red',
      'bright_green',
      'bright_yellow',
      'bright_blue',
      'bright_magenta',
      'bright_cyan',
      'bright_white',
    ];

    // Convert snake_case to camelCase for bright colors
    let normalizedWord = word;
    if (word.startsWith('bright_')) {
      const base = word.slice(7);
      normalizedWord = `${base}Bright`;
    }

    if (namedColors.includes(word) || namedColors.includes(normalizedWord)) {
      return word;
    }

    // Could be an unknown color name, return it anyway and let chalk handle it
    if (/^[a-zA-Z]+$/.test(word)) {
      return word;
    }

    return null;
  }

  combine(other: Style): Style {
    return new Style({
      color: other.color ?? this.color,
      backgroundColor: other.backgroundColor ?? this.backgroundColor,
      bold: other.bold ?? this.bold,
      italic: other.italic ?? this.italic,
      underline: other.underline ?? this.underline,
      strikethrough: other.strikethrough ?? this.strikethrough,
      dim: other.dim ?? this.dim,
      reverse: other.reverse ?? this.reverse,
      blink: other.blink ?? this.blink,
      hidden: other.hidden ?? this.hidden,
    });
  }

  render(text: string): string {
    let result: any = chalk;

    // Apply foreground color
    if (this.color) {
      result = this.applyColor(result, this.color, false);
    }

    // Apply background color
    if (this.backgroundColor) {
      result = this.applyColor(result, this.backgroundColor, true);
    }

    // Apply modifiers
    if (this.bold) result = result.bold;
    if (this.italic) result = result.italic;
    if (this.underline) result = result.underline;
    if (this.strikethrough) result = result.strikethrough;
    if (this.dim) result = result.dim;
    if (this.reverse) result = result.inverse;
    if (this.blink) result = result.blink;
    if (this.hidden) result = result.hidden;

    return result(text);
  }

  /**
   * Apply a color to a chalk instance.
   */
  private applyColor(chalkInstance: any, color: Color, isBackground: boolean): any {
    // String color (hex or named)
    if (typeof color === 'string') {
      if (color.startsWith('#')) {
        // Hex color
        return isBackground ? chalkInstance.bgHex(color) : chalkInstance.hex(color);
      }

      // Handle bright_ prefix conversion
      let colorName = color;
      if (color.startsWith('bright_')) {
        const base = color.slice(7);
        colorName = `${base}Bright`;
      }

      // Named color
      if (isBackground) {
        const bgMethod = `bg${colorName.charAt(0).toUpperCase()}${colorName.slice(1)}`;
        if (bgMethod in chalkInstance) {
          return chalkInstance[bgMethod as keyof typeof chalkInstance];
        }
        // Fallback: try as-is
        const altMethod = `bg${color.charAt(0).toUpperCase()}${color.slice(1)}`;
        if (altMethod in chalkInstance) {
          return chalkInstance[altMethod as keyof typeof chalkInstance];
        }
      } else {
        if (colorName in chalkInstance) {
          return chalkInstance[colorName as keyof typeof chalkInstance];
        }
        if (color in chalkInstance) {
          return chalkInstance[color as keyof typeof chalkInstance];
        }
      }
      return chalkInstance;
    }

    // RGB object
    if (this.isRGB(color)) {
      return isBackground
        ? chalkInstance.bgRgb(color.r, color.g, color.b)
        : chalkInstance.rgb(color.r, color.g, color.b);
    }

    // 256-color number
    if (typeof color === 'number') {
      return isBackground ? chalkInstance.bgAnsi256(color) : chalkInstance.ansi256(color);
    }

    return chalkInstance;
  }

  private isRGB(color: any): color is RGB {
    return (
      typeof color === 'object' && color !== null && 'r' in color && 'g' in color && 'b' in color
    );
  }
}
