import stringWidth from 'string-width';
import { Style } from './style';
import type { Renderable, RenderResult } from '../types/renderable';
import type { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';

/**
 * A segment of text with a specific style.
 */
export class Segment implements Renderable {
  constructor(
    public readonly text: string,
    public readonly style: Style = Style.null(),
    public readonly isControl: boolean = false
  ) {}

  /**
   * Implementation of Renderable protocol.
   */
  __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult {
    return {
      segments: [this],
      width: this.cellLength()
    };
  }


  /**
   * Calculates the cell length of the text.
   */
  cellLength(): number {
    if (this.isControl) return 0;
    return stringWidth(this.text);
  }

  /**
   * Renders the segment to an ANSI string.
   */
  render(): string {
    if (this.isControl) return this.text;
    if (typeof this.style?.render === 'function') {
      return this.style.render(this.text);
    }
    return this.text;
  }

  /**
   * Splits the segment into lines.
   */
  splitLines(_allowEmpty: boolean = false): Segment[][] {
    const lines = this.text.split('\n');

    // If the text ends with a newline, split produces an empty string at the end.
    // Rich behavior: we might want to preserve that if needed, or handle it carefully.

    return lines.map((line) => {
      // If line is empty and we don't allow empty segments (unless it's a newline itself which is lost here),
      // effectively we just create new segments for each line part.
      return [new Segment(line, this.style, this.isControl)];
    });
  }

  /**
   * Creates a new Segment with modified properties.
   */
  clone(text?: string, style?: Style, isControl?: boolean): Segment {
    return new Segment(text ?? this.text, style ?? this.style, isControl ?? this.isControl);
  }
}
