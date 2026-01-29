import type { Console } from "../console/console";
import type { Segment } from "../core/segment";
import type { ConsoleOptions } from "./console-options";

/**
 * Result of rendering a Renderable object.
 */
export interface RenderResult {
	/** The rendered text segments */
	segments: Segment[];
	/** The width in characters */
	width?: number;
	/** The height in lines */
	height?: number;
}

/**
 * Protocol for objects that can be rendered to the console.
 */
export interface Renderable {
	/**
	 * Renders the object to segments.
	 *
	 * @param console - The console instance
	 * @param options - Rendering options
	 * @returns The render result
	 */
	__rich_console__(
		console: Console,
		options: ConsoleOptions,
	): RenderResult | Generator<Segment>;
}

/**
 * Type guard to check if an object is renderable.
 */
export function isRenderable(obj: unknown): obj is Renderable {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"__rich_console__" in obj &&
		// biome-ignore lint/suspicious/noExplicitAny: Type guard check
		typeof (obj as any).__rich_console__ === "function"
	);
}
