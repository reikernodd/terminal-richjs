/**
 * Columns layout - display renderables in responsive columns
 */
/** biome-ignore-all lint/suspicious/noControlCharactersInRegex: false */
/** biome-ignore-all assist/source/organizeImports: false */

import type { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';
import type { Renderable, RenderResult } from '../types/renderable';
import { Segment } from '../core/segment';
import { Style } from '../core/style';

export interface ColumnsOptions {
  width?: number; // Fixed column width
  padding?: number; // Padding between columns
  expand?: boolean; // Expand to fill width
  equal?: boolean; // Equal width columns
  columnFirst?: boolean; // Fill columns top-to-bottom instead of left-to-right
  rightToLeft?: boolean; // Start from right side
  title?: string; // Optional title
}

/**
 * Display renderables in neat columns that adapt to terminal width.
 */
export class Columns implements Renderable {
  private renderables: Array<string | Renderable>;
  private options: ColumnsOptions;

  constructor(renderables: Iterable<string | Renderable> = [], options: ColumnsOptions = {}) {
    this.renderables = Array.from(renderables);
    this.options = {
      padding: options.padding ?? 1,
      expand: options.expand ?? false,
      equal: options.equal ?? false,
      columnFirst: options.columnFirst ?? false,
      rightToLeft: options.rightToLeft ?? false,
      ...options,
    };
  }

  /**
   * Add a renderable to the columns.
   */
  add(renderable: string | Renderable): this {
    this.renderables.push(renderable);
    return this;
  }

  __rich_console__(console: Console, consoleOptions: ConsoleOptions): RenderResult {
    if (this.renderables.length === 0) {
      return { segments: [], width: 0 };
    }

    // Convert all renderables to strings
    const items: string[] = this.renderables.map((r) => {
      if (typeof r === 'string') {
        return r;
      }
      // For renderables, get their text content
      const result = r.__rich_console__(console, consoleOptions);
      if ('segments' in result) {
        return result.segments.map((s: Segment) => s.text).join('');
      }
      return '';
    });

    // Calculate widths
    const terminalWidth = consoleOptions.width ?? console.width ?? 80;
    const padding = this.options.padding ?? 1;
    const paddingStr = ' '.repeat(padding);

    // If fixed width is specified, use it
    let columnWidth: number;
    if (this.options.width) {
      columnWidth = this.options.width;
    } else if (this.options.equal) {
      // Find the maximum item width
      columnWidth = Math.max(...items.map((item) => this.getDisplayWidth(item)));
    } else {
      // Use max item width
      columnWidth = Math.max(...items.map((item) => this.getDisplayWidth(item)));
    }

    // Calculate how many columns fit
    const columnCount = Math.max(
      1,
      Math.floor((terminalWidth + padding) / (columnWidth + padding)),
    );

    // Arrange items into columns
    const lines: string[] = [];

    if (this.options.title) {
      lines.push(this.options.title);
    }

    // Create rows
    const rows: string[][] = [];
    if (this.options.columnFirst) {
      // Fill columns first (top to bottom, then left to right)
      const rowCount = Math.ceil(items.length / columnCount);
      for (let row = 0; row < rowCount; row++) {
        const rowItems: string[] = [];
        for (let col = 0; col < columnCount; col++) {
          const index = col * rowCount + row;
          if (index < items.length) {
            rowItems.push(this.padItem(items[index], columnWidth));
          }
        }
        rows.push(rowItems);
      }
    } else {
      // Fill rows first (left to right, then top to bottom)
      for (let i = 0; i < items.length; i += columnCount) {
        const rowItems: string[] = [];
        for (let j = 0; j < columnCount && i + j < items.length; j++) {
          rowItems.push(this.padItem(items[i + j], columnWidth));
        }
        rows.push(rowItems);
      }
    }

    // Render rows
    for (const row of rows) {
      let rowItems = row;
      if (this.options.rightToLeft) {
        rowItems = [...row].reverse();
      }
      lines.push(rowItems.join(paddingStr));
    }

    const output = `${lines.join('\n')}\n`;
    return {
      segments: [new Segment(output, Style.null())],
      width: terminalWidth,
    };
  }

  /**
   * Get the display width of a string (accounting for ANSI codes).
   */
  private getDisplayWidth(text: string): number {
    // Strip ANSI codes for width calculation
    const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
    return stripped.length;
  }

  /**
   * Pad an item to the specified width.
   */
  private padItem(item: string, width: number): string {
    const currentWidth = this.getDisplayWidth(item);
    if (currentWidth >= width) {
      return item;
    }
    return item + ' '.repeat(width - currentWidth);
  }
}
