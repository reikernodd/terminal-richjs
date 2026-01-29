import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import type { Console } from "../console/console";
import { Segment } from "../core/segment";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";

// Configure marked to use terminal renderer
marked.setOptions({
	renderer: new TerminalRenderer() as any,
});

export class Markdown implements Renderable {
	constructor(public readonly markup: string) {}

	__rich_console__(_console: Console, _options: ConsoleOptions): RenderResult {
		const rendered = marked.parse(this.markup) as string;

		return {
			segments: [new Segment(rendered)],
			width: 0, // Placeholder
		};
	}
}
