/** biome-ignore-all lint/suspicious/noExplicitAny: false */
/** biome-ignore-all assist/source/organizeImports: false */
import process from 'node:process';
import wrapAnsi from 'wrap-ansi';
import { Terminal } from '../terminal/terminal';
import { MarkupParser } from '../core/markup';
import type { ConsoleOptions } from '../types/console-options';
import { isRenderable, type Renderable } from '../types/renderable';
import { Segment } from '../core/segment';
import { Traceback } from '../traceback/traceback';
import { type Theme, DEFAULT_THEME } from '../themes/theme';
import { getRenderResult } from '../utils/render-utils';
import { Status } from '../status/status';
import type { SpinnerName } from 'cli-spinners';

export class Console {
  error(message: any): void {
    const text = String(message);
    process.stderr.write(`\x1b[31m${text}\x1b[0m\n`);
  }
  private readonly terminal: Terminal;
  private readonly markupParser: MarkupParser;
  private readonly options: ConsoleOptions;
  public theme: Theme;

  constructor(options: ConsoleOptions = {}) {
    this.options = options;
    this.terminal = new Terminal();
    this.theme = options.theme ?? DEFAULT_THEME;
    this.markupParser = new MarkupParser(this.theme);
  }

  get width(): number {
    return this.options.width ?? this.terminal.width;
  }

  get height(): number {
    return this.options.height ?? this.terminal.height;
  }

  /**
   * Prints objects to the console.
   */
  print(...objects: any[]): void {
    const lastObj = objects[objects.length - 1];
    let printObjects = objects;
    let options: { style?: any; markup?: boolean } = {};

    // Check for options object at the end
    if (
      objects.length > 1 &&
      typeof lastObj === 'object' &&
      lastObj !== null &&
      !isRenderable(lastObj) &&
      ('style' in lastObj || 'markup' in lastObj)
    ) {
      options = objects.pop();
      printObjects = objects;
    }

    const output = printObjects
      .map((obj) => {
        if (typeof obj === 'string') {
          return this.renderString(obj, options.markup ?? true);
        }
        if (isRenderable(obj)) {
          return this.render(obj);
        }
        return String(obj);
      })
      .join(' ');

    this.write(`${output}\n`);
  }

  /**
   * Prints a formatted exception.
   */
  printException(error: Error): void {
    const traceback = new Traceback(error);
    this.print(traceback);
  }

  /**
   * Displays a status spinner.
   */
  status(
    message: string,
    options: { spinner?: SpinnerName } = {},
  ): { start: () => void; stop: () => void; update: (msg: string) => void } & Promise<void> {
    // Allow usage as a context manager if a callback is provided?
    // JavaScript doesn't have 'with'.
    // We can return an object with start/stop.
    // But to match python "with console.status(...) as status:", we might want a callback helper?
    // For now, let's return the Status object controls.
    // But wait, the Python example is:
    // with console.status("Working..."):
    //    time.sleep(2)
    //
    // In JS:
    // await console.status("Working...", async () => { await sleep(2000) });

    // Let's implement the callback overload.
    return new Status(message, { spinnerName: options.spinner, ...options }) as any;
  }

  /**
   * Run a task with a status spinner.
   */
  async withStatus<T>(
    message: string,
    task: (status: Status) => Promise<T>,
    options: { spinner?: SpinnerName } = {},
  ): Promise<T> {
    const status = new Status(message, { spinnerName: options.spinner });
    status.start();
    try {
      return await task(status);
    } finally {
      status.stop();
    }
  }

  /**
   * Renders a renderable object to a string.
   */
  render(renderable: Renderable): string {
    const result = getRenderResult(renderable, this, this.options);
    return result.segments.map((s: Segment) => s.render()).join('');
  }

  /**
   * Internal string rendering with markup and wrapping.
   */
  private renderString(text: string, markup: boolean = true): string {
    const segments = markup ? this.markupParser.parse(text) : [new Segment(text)];
    const rendered = segments.map((s) => s.render()).join('');

    // Apply word wrapping
    // wrapAnsi handles ANSI codes correctly
    return wrapAnsi(rendered, this.width, { hard: true });
  }

  /**
   * Low-level write to stdout.
   */
  private write(text: string): void {
    process.stdout.write(text);
  }
}
