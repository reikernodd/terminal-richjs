import { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';
import { isRenderable, type Renderable, type RenderResult } from '../types/renderable';
import { Segment } from '../core/segment';
import { splitLines } from '../core/lines';

export type PaddingValue = number | [number, number] | [number, number, number, number];

export class Padding implements Renderable {
  top: number;
  right: number;
  bottom: number;
  left: number;

  constructor(public renderable: Renderable | string, padding: PaddingValue) {
    if (typeof padding === 'number') {
        this.top = this.right = this.bottom = this.left = padding;
    } else if (Array.isArray(padding)) {
        if (padding.length === 2) {
            this.top = this.bottom = padding[0];
            this.right = this.left = padding[1];
        } else {
            [this.top, this.right, this.bottom, this.left] = padding;
        }
    } else {
        this.top = this.right = this.bottom = this.left = 0;
    }
  }

  __rich_console__(console: Console, options: ConsoleOptions): RenderResult {
    const width = options.width ?? console.width;
    const innerWidth = Math.max(0, width - this.left - this.right);
    
    // Render content
    let contentSegments: Segment[] = [];
    if (typeof this.renderable === 'string') {
        // Simple string handling
        // We really should expose a simpler renderString or use Text()
        contentSegments = [new Segment(this.renderable)];
    } else if (isRenderable(this.renderable)) {
        const result = this.renderable.__rich_console__(console, { ...options, width: innerWidth });
        if ('segments' in result) contentSegments = result.segments;
    }

    const lines = splitLines(contentSegments);
    const segments: Segment[] = [];

    // Top padding
    for (let i = 0; i < this.top; i++) {
        segments.push(new Segment(' '.repeat(width) + '\n'));
    }

    // Content with Left/Right padding
    const leftPad = ' '.repeat(this.left);
    // Right padding is implicit if we don't force width, but let's pad
    
    for (const line of lines) {
        segments.push(new Segment(leftPad));
        segments.push(...line);
        // We assume line renders to innerWidth or less. 
        // If we want hard right padding we need to know line length.
        // For simple flow, just left pad is enough unless background colors are involved.
        segments.push(new Segment('\n'));
    }

    // Bottom padding
    for (let i = 0; i < this.bottom; i++) {
        segments.push(new Segment(' '.repeat(width) + '\n'));
    }

    return { segments, width };
  }
}
