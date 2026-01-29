import stringWidth from "string-width";
import type { Console } from "../console/console";
import { Segment } from "../core/segment";
import { Style } from "../core/style";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";

export class Rule implements Renderable {
	constructor(
		public readonly title: string = "",
		public readonly characters: string = "─",
		public readonly style: Style = Style.null(),
	) {}

	__rich_console__(console: Console, options: ConsoleOptions): RenderResult {
		const width = options.width ?? console.width;
		let line = "";

		if (this.title) {
			const titleText = ` ${this.title} `;
			const titleWidth = stringWidth(titleText);
			const sideWidth = Math.floor((width - titleWidth) / 2);
			line =
				this.characters.repeat(sideWidth) +
				titleText +
				this.characters.repeat(width - titleWidth - sideWidth);
		} else {
			line = this.characters.repeat(width);
		}

		return {
			segments: [
				new Segment(line, this.style),
				new Segment("\n", Style.null(), true),
			],
			width: width,
		};
	}
}
