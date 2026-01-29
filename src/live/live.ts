/**
 * Live display - updates content in place
 */

export interface LiveOptions {
	refreshPerSecond?: number;
	transient?: boolean; // Clear display when done
}

/**
 * Simple renderable that returns a string.
 */
export interface SimpleRenderable {
	render(): string;
}

/**
 * Renders an auto-updating live display.
 *
 * @example
 * ```typescript
 * const live = new Live();
 *
 * await live.start(async (update) => {
 *   for (let i = 0; i <= 100; i++) {
 *     update(`Progress: ${i}%`);
 *     await sleep(50);
 *   }
 * });
 * ```
 */
export class Live {
	private transient: boolean;
	private started = false;
	private refreshThread: ReturnType<typeof setInterval> | null = null;
	private lastRenderedLines = 0;
	private currentContent = "";

	constructor(options: LiveOptions = {}) {
		this.transient = options.transient ?? false;
	}

	/**
	 * Check if live display is currently running.
	 */
	get isStarted(): boolean {
		return this.started;
	}

	/**
	 * Update the displayed content.
	 */
	update(content: string): void {
		this.currentContent = content;
	}

	/**
	 * Refresh the display with current content.
	 */
	private refresh(): void {
		if (!this.started) return;

		// Clear previous output
		if (this.lastRenderedLines > 0) {
			// Move cursor up and clear lines
			process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
			for (let i = 0; i < this.lastRenderedLines; i++) {
				process.stdout.write("\x1b[2K\n");
			}
			process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
		}

		// Count lines for next clear
		this.lastRenderedLines =
			(this.currentContent.match(/\n/g) || []).length + 1;

		process.stdout.write(`${this.currentContent}\n`);
	}

	/**
	 * Start live display with a callback function.
	 * The callback receives an update function to change the displayed content.
	 */
	async start(
		callback: (update: (content: string) => void) => Promise<void> | void,
	): Promise<void> {
		if (this.started) {
			throw new Error("Live display already started");
		}

		this.started = true;

		// Hide cursor
		process.stdout.write("\x1b[?25l");

		// Create update function that triggers refresh
		const updateFn = (content: string) => {
			this.currentContent = content;
			this.refresh();
		};

		try {
			await callback(updateFn);
		} finally {
			this.stop();
		}
	}

	/**
	 * Stop live display.
	 */
	stop(): void {
		if (!this.started) return;

		// Stop refresh thread
		if (this.refreshThread) {
			clearInterval(this.refreshThread);
			this.refreshThread = null;
		}

		// Show cursor
		process.stdout.write("\x1b[?25h");

		// Clear output if transient
		if (this.transient && this.lastRenderedLines > 0) {
			process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
			for (let i = 0; i < this.lastRenderedLines; i++) {
				process.stdout.write("\x1b[2K\n");
			}
			process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
		}

		this.started = false;
	}
}

/**
 * Helper function to sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
