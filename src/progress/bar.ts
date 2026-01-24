/** biome-ignore-all assist/source/organizeImports: false */
import type { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';
import type { Renderable, RenderResult } from '../types/renderable';
import { Segment } from '../core/segment';
import { Style } from '../core/style';

export interface ProgressBarOptions {
  width?: number;
  completeStyle?: string;
  finishedStyle?: string;
  remainingStyle?: string;
  pulseStyle?: string;
  pulse?: boolean;
  completeChar?: string;
  remainingChar?: string;
}

/**
 * Visual progress bar component.
 * Supports customizable styles, pulse animation, and gradient colors.
 */
export class ProgressBar implements Renderable {
  render(_arg0: number) {
    throw new Error('Method not implemented.');
  }
  private pulseOffset = 0;
  private lastPulseTime = 0;

  constructor(
    public readonly total: number = 100,
    public readonly completed: number = 0,
    public readonly options: ProgressBarOptions = {},
  ) {}

  __rich_console__(console: Console, consoleOptions: ConsoleOptions): RenderResult {
    const width = this.options.width ?? Math.min(40, (consoleOptions.width ?? console.width) - 20);
    const percentage = Math.min(1, Math.max(0, this.completed / this.total));
    const isComplete = percentage >= 1;
    const isPulse = this.options.pulse ?? false;

    // Characters for the bar
    const completeChar = this.options.completeChar ?? '━';
    const remainingChar = this.options.remainingChar ?? '━';

    // Styles
    const completeStyleStr = isComplete
      ? (this.options.finishedStyle ?? '#50fa7b bold')
      : (this.options.completeStyle ?? '#61afef');
    const remainingStyleStr = this.options.remainingStyle ?? '#3a3a3a dim';
    const pulseStyleStr = this.options.pulseStyle ?? '#98c379 bold';

    const completeStyle = Style.parse(completeStyleStr);
    const remainingStyle = Style.parse(remainingStyleStr);
    const pulseStyle = Style.parse(pulseStyleStr);

    const filledWidth = Math.floor(width * percentage);
    const segments: Segment[] = [];

    if (isPulse && !isComplete) {
      // Pulse animation for indeterminate progress
      // Create a moving highlight effect
      const now = Date.now();
      if (now - this.lastPulseTime > 100) {
        this.pulseOffset = (this.pulseOffset + 1) % width;
        this.lastPulseTime = now;
      }

      for (let i = 0; i < width; i++) {
        const isPulsePos = Math.abs(i - this.pulseOffset) < 3;
        const style = isPulsePos ? pulseStyle : remainingStyle;
        segments.push(new Segment(remainingChar, style));
      }
    } else {
      // Standard progress bar with filled/remaining sections

      // Add filled portion with potential gradient
      if (filledWidth > 0) {
        // Create gradient effect for large bars
        if (width >= 20 && !isComplete) {
          const gradientColors = ['#61afef', '#66d9ef', '#50fa7b'];
          for (let i = 0; i < filledWidth; i++) {
            const colorIndex = Math.floor((i / filledWidth) * gradientColors.length);
            const color = gradientColors[Math.min(colorIndex, gradientColors.length - 1)];
            segments.push(new Segment(completeChar, Style.parse(color)));
          }
        } else {
          segments.push(new Segment(completeChar.repeat(filledWidth), completeStyle));
        }
      }

      // Add remaining portion
      const remainingWidth = width - filledWidth;
      if (remainingWidth > 0) {
        segments.push(new Segment(remainingChar.repeat(remainingWidth), remainingStyle));
      }
    }

    return {
      segments,
      width,
    };
  }
}

/**
 * Compact progress indicator showing percentage.
 */
export class PercentageColumn implements Renderable {
  constructor(
    public readonly percentage: number,
    public readonly style?: string,
  ) {}

  __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult {
    const pct = Math.floor(this.percentage * 100);
    const text = `${pct.toString().padStart(3)}%`;
    const style = Style.parse(this.style ?? (pct >= 100 ? '#50fa7b bold' : '#61afef'));

    return {
      segments: [new Segment(text, style)],
      width: 4,
    };
  }
}

/**
 * Time elapsed display for progress tracking.
 */
export class TimeElapsedColumn implements Renderable {
  constructor(
    public readonly elapsedMs: number,
    public readonly style?: string,
  ) {}

  __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult {
    const seconds = Math.floor(this.elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    let text: string;
    if (hours > 0) {
      text = `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      text = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      text = `0:${seconds.toString().padStart(2, '0')}`;
    }

    const style = Style.parse(this.style ?? '#e5c07b');
    return {
      segments: [new Segment(text, style)],
      width: text.length,
    };
  }
}

/**
 * Estimated time remaining display.
 */
export class TimeRemainingColumn implements Renderable {
  constructor(
    public readonly percentage: number,
    public readonly elapsedMs: number,
    public readonly style?: string,
  ) {}

  __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult {
    if (this.percentage <= 0 || this.percentage >= 1) {
      const text = '-:--';
      return {
        segments: [new Segment(text, Style.parse(this.style ?? 'dim'))],
        width: 4,
      };
    }

    const estimatedTotal = this.elapsedMs / this.percentage;
    const remainingMs = estimatedTotal - this.elapsedMs;

    const seconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    let text: string;
    if (hours > 0) {
      text = `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      text = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      text = `0:${seconds.toString().padStart(2, '0')}`;
    }

    const style = Style.parse(this.style ?? '#c678dd');
    return {
      segments: [new Segment(text, style)],
      width: text.length,
    };
  }
}
