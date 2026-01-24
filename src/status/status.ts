import { Spinner } from './spinner';

export interface StatusOptions {
  spinnerName?: string;
}

export class Status {
  private spinner: Spinner;
  private message: string;
  private interval: ReturnType<typeof setInterval> | null = null;
  private started = false;
  private lastRenderedLines = 0;

  constructor(message: string, options: StatusOptions = {}) {
    this.message = message;
    this.spinner = new Spinner(options.spinnerName ?? 'dots');
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    // Hide cursor
    process.stdout.write('\x1b[?25l');

    // Start animation
    this.interval = setInterval(() => {
      this.refresh();
    }, this.spinner.interval);

    this.refresh();
  }

  stop(): void {
    if (!this.started) return;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Clear the status line
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write('\x1b[2K\n');
      }
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
    }

    // Show cursor
    process.stdout.write('\x1b[?25h');
    this.started = false;
  }

  update(message: string): void {
    this.message = message;
    if (this.started) {
      this.refresh();
    }
  }

  private refresh(): void {
    // Clear previous output
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write('\x1b[2K\n');
      }
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
    }

    const frame = this.spinner.getCurrentFrame();
    const output = `${frame} ${this.message}\n`;
    this.lastRenderedLines = 1;
    process.stdout.write(output);
  }
}
