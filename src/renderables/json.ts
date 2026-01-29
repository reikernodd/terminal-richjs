/**
 * JSON renderable - pretty-printed and syntax-highlighted JSON
 */
/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: false */
/** biome-ignore-all assist/source/organizeImports: false */

import type { Console } from "../console/console";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";
import { Segment } from "../core/segment";
import { Style } from "../core/style";

export interface JSONOptions {
	indent?: number | string;
	highlight?: boolean;
	sortKeys?: boolean;
}

/**
 * A renderable which pretty prints JSON with syntax highlighting.
 */
export class JSON implements Renderable {
	private readonly text: string;
	private readonly highlight: boolean;

	constructor(json: string, options: JSONOptions = {}) {
		const { indent = 2, sortKeys = false } = options;
		this.highlight = options.highlight ?? true;

		// Parse and re-stringify for formatting
		try {
			let data = globalThis.JSON.parse(json);

			if (sortKeys && typeof data === "object" && data !== null) {
				data = this.sortObject(data);
			}

			this.text = globalThis.JSON.stringify(data, null, indent);
		} catch {
			// If parsing fails, use the original text
			this.text = json;
		}
	}

	/**
	 * Create JSON from any data object.
	 */
	static fromData(data: unknown, options: JSONOptions = {}): JSON {
		const { indent = 2, sortKeys = false } = options;

		let processedData = data;
		if (sortKeys && typeof data === "object" && data !== null) {
			processedData = JSON.prototype.sortObject(data);
		}

		const json = globalThis.JSON.stringify(processedData, null, indent);
		const instance = new JSON(json, { ...options, sortKeys: false }); // Already sorted
		return instance;
	}

	private sortObject(obj: unknown): unknown {
		if (Array.isArray(obj)) {
			return obj.map((item) => this.sortObject(item));
		}
		if (obj !== null && typeof obj === "object") {
			const sorted: Record<string, unknown> = {};
			const keys = Object.keys(obj as Record<string, unknown>).sort();
			for (const key of keys) {
				sorted[key] = this.sortObject((obj as Record<string, unknown>)[key]);
			}
			return sorted;
		}
		return obj;
	}

	/**
	 * Apply JSON syntax highlighting.
	 */
	private highlightJSON(text: string): string {
		if (!this.highlight) {
			return text;
		}

		// JSON syntax highlighting patterns
		const highlighted = text
			// Strings (keys and values)
			.replace(/"([^"\\]|\\.)*"/g, (match) => {
				return Style.parse("#f1fa8c").apply(match); // Yellow for strings
			})
			// Numbers
			.replace(/\b(-?\d+\.?\d*(?:e[+-]?\d+)?)\b/gi, (match) => {
				return Style.parse("#bd93f9").apply(match); // Purple for numbers
			})
			// Booleans and null
			.replace(/\b(true|false)\b/g, (match) => {
				return match === "true"
					? Style.parse("#50fa7b").apply(match) // Green for true
					: Style.parse("#ff79c6").apply(match); // Pink for false
			})
			.replace(/\bnull\b/g, (match) => {
				return Style.parse("#8be9fd italic").apply(match); // Cyan for null
			});

		return highlighted;
	}

	__rich_console__(
		_console: Console,
		_consoleOptions: ConsoleOptions,
	): RenderResult {
		const highlighted = this.highlightJSON(this.text);
		return {
			segments: [new Segment(highlighted + "\n", Style.null())],
			width: this.text
				.split("\n")
				.reduce((max, line) => Math.max(max, line.length), 0),
		};
	}
}
