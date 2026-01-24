/**
 * Spinner renderable - animated spinners for status display
 */
/** biome-ignore-all assist/source/organizeImports: false */

import type { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';
import type { Renderable, RenderResult } from '../types/renderable';
import { Segment } from '../core/segment';
import { Style } from '../core/style';
import { SPINNERS } from './spinners';

export interface SpinnerOptions {
  text?: string;
  style?: string;
  speed?: number;
}

/**
 * A spinner animation that can be rendered with Live updates.
 */
export class Spinner implements Renderable {
  readonly name: string;
  readonly frames: string[];
  readonly interval: number;
  text: string;
  style: string;
  speed: number;

  private startTime: number | null = null;
  private frameNoOffset = 0;

  constructor(name: string = 'dots', options: SpinnerOptions = {}) {
    const spinner = SPINNERS[name];
    if (!spinner) {
      throw new Error(`No spinner called '${name}'. Use listSpinners() to see available spinners.`);
    }

    this.name = name;
    this.frames = typeof spinner.frames === 'string' ? [...spinner.frames] : [...spinner.frames];
    this.interval = spinner.interval;
    this.text = options.text ?? '';
    this.style = options.style ?? 'green';
    this.speed = options.speed ?? 1.0;
  }

  /**
   * Render the spinner for a given time.
   */
  render(time: number): string {
    if (this.startTime === null) {
      this.startTime = time;
    }

    const frameNo =
      ((time - this.startTime) * this.speed) / (this.interval / 1000.0) + this.frameNoOffset;
    const frame = this.frames[Math.floor(frameNo) % this.frames.length];

    const styledFrame = Style.parse(this.style).apply(frame);

    if (this.text) {
      return `${styledFrame} ${this.text}`;
    }
    return styledFrame;
  }

  /**
   * Get the current frame without time advancement (for static rendering).
   */
  getCurrentFrame(): string {
    const now = Date.now() / 1000;
    return this.render(now);
  }

  /**
   * Update spinner properties.
   */
  update(options: Partial<SpinnerOptions>): void {
    if (options.text !== undefined) this.text = options.text;
    if (options.style !== undefined) this.style = options.style;
    if (options.speed !== undefined) {
      this.frameNoOffset =
        this.startTime !== null
          ? ((Date.now() / 1000 - this.startTime) * this.speed) / (this.interval / 1000.0) +
            this.frameNoOffset
          : 0;
      this.startTime = Date.now() / 1000;
      this.speed = options.speed;
    }
  }

  __rich_console__(_console: Console, _consoleOptions: ConsoleOptions): RenderResult {
    const frame = this.getCurrentFrame();
    return {
      segments: [new Segment(`${frame}\n`, Style.null())],
      width: frame.length,
    };
  }
}

/**
 * List all available spinner names.
 */
export function listSpinners(): string[] {
  return Object.keys(SPINNERS);
}
