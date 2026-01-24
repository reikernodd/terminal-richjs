import { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';
import { isRenderable, type Renderable, type RenderResult } from '../types/renderable';
import { Segment } from '../core/segment';
import { splitLines } from '../core/lines';

export type AlignMethod = 'left' | 'center' | 'right';

export class Align implements Renderable {
  constructor(
    public renderable: Renderable | string,
    public align: AlignMethod,
    public style?: any
  ) {}

  static left(renderable: Renderable | string): Align {
      return new Align(renderable, 'left');
  }

  static center(renderable: Renderable | string): Align {
      return new Align(renderable, 'center');
  }

  static right(renderable: Renderable | string): Align {
      return new Align(renderable, 'right');
  }

  __rich_console__(console: Console, options: ConsoleOptions): RenderResult {
    const width = options.width ?? console.width;
    
    // Render content with unknown width (or full width?)
    // If we render with full width, many components expand to fill it (like Table).
    // If we want to align a Table, we assume it sized itself smaller than Width?
    // This is tricky. 
    // Usually Align wraps something that has an intrinsic size or we constrain it?
    // Let's assume we render content with full width available, but we need to know its ACTUAL width used.
    
    let contentSegments: Segment[] = [];
    if (typeof this.renderable === 'string') {
        contentSegments = [new Segment(this.renderable)];
    } else if (isRenderable(this.renderable)) {
        // We might want to pass a smaller width if we want to squeeze it? 
        // But aligning usually means moving a block in available space.
        const result = this.renderable.__rich_console__(console, options);
        if ('segments' in result) contentSegments = result.segments;
    }

    const lines = splitLines(contentSegments);
    const segments: Segment[] = [];

    for (const line of lines) {
        // Calculate line width
        const lineWidth = line.reduce((acc, s) => acc + s.cellLength(), 0);
        const remaining = Math.max(0, width - lineWidth);
        
        if (remaining === 0) {
            segments.push(...line);
        } else {
            let leftSpace = 0;
            if (this.align === 'center') leftSpace = Math.floor(remaining / 2);
            else if (this.align === 'right') leftSpace = remaining;
            
            if (leftSpace > 0) segments.push(new Segment(' '.repeat(leftSpace)));
            segments.push(...line);
            // Right space is implicit
        }
        segments.push(new Segment('\n'));
    }

    return { segments, width };
  }
}
