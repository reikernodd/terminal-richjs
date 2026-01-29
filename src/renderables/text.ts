import wrapAnsi from "wrap-ansi";
import type { Console } from "../console/console";
import { MarkupParser } from "../core/markup";
import { Segment } from "../core/segment";
import { Style } from "../core/style";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";

export type JustifyMethod = "left" | "center" | "right" | "full";
export type OverflowMethod = "fold" | "crop" | "ellipsis";

export class Text implements Renderable {
	private readonly segments: Segment[];

	constructor(
		content: string | Segment[],
		public readonly style: Style = Style.null(),
		public readonly justify: JustifyMethod = "left",
		public readonly overflow: OverflowMethod = "fold",
		public readonly noWrap: boolean = false,
	) {
		if (typeof content === "string") {
			const parser = new MarkupParser();
			this.segments = parser.parse(content);
		} else {
			this.segments = content;
		}
	}

	__rich_console__(console: Console, options: ConsoleOptions): RenderResult {
		const width = options.width ?? console.width;
		const text = this.segments.map((s) => s.render()).join("");

		let wrapped = text;
		if (!this.noWrap) {
			wrapped = wrapAnsi(text, width, { hard: true, trim: false });
		}

		// TODO: Implement justification and overflow

		const resultSegments = wrapped.split("\n").flatMap((line) => {
			// This is a bit simplified as we lose original segments styles if we just wrap the rendered string
			// In a full implementation we'd wrap the Segment objects themselves.
			return [new Segment(line), new Segment("\n", Style.null(), true)];
		});

		return {
			segments: resultSegments,
			width: width,
		};
	}
}
