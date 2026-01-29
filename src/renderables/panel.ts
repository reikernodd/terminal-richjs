/** biome-ignore-all assist/source/organizeImports: biome-ignore assist/source/organizeImports */
/** biome-ignore-all lint/suspicious/noExplicitAny: biome-ignore lint/suspicious/noExplicitAny */
import type { Console } from "../console/console";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";
import { isRenderable } from "../types/renderable";
import { Segment } from "../core/segment";
import { Style } from "../core/style";
import { getBox, type BoxStyle } from "../utils/box";
import { splitLines, padLine } from "../core/lines";
import stringWidth from "string-width";

export interface PanelOptions {
	title?: string;
	titleAlign?: "left" | "center" | "right";
	subtitle?: string;
	subtitleAlign?: "left" | "center" | "right";
	box?: BoxStyle;
	style?: Style | string;
	borderStyle?: Style | string;
	padding?: number | [number, number] | [number, number, number, number];
	width?: number;
	height?: number;
	expand?: boolean;
	highlight?: boolean;
}

/**
 * A bordered panel container for any renderable content.
 * Supports titles, subtitles, various box styles, and padding.
 */
export class Panel implements Renderable {
	constructor(
		public readonly renderable: Renderable | string,
		public readonly options: PanelOptions = {},
	) {}

	/**
	 * Create a panel that fits its content (expand=false).
	 */
	static fit(
		renderable: Renderable | string,
		options: PanelOptions = {},
	): Panel {
		return new Panel(renderable, { ...options, expand: false });
	}

	__rich_console__(
		console: Console,
		consoleOptions: ConsoleOptions,
	): RenderResult {
		const box = getBox(this.options.box ?? "rounded");
		const expand = this.options.expand ?? true;
		const maxWidth =
			this.options.width ?? consoleOptions.width ?? console.width;

		const borderStyle =
			typeof this.options.borderStyle === "string"
				? Style.parse(this.options.borderStyle)
				: (this.options.borderStyle ?? Style.parse("dim"));

		const titleAlign = this.options.titleAlign ?? "center";
		const subtitleAlign = this.options.subtitleAlign ?? "center";

		// Parse padding
		const padding = this.normalizePadding(this.options.padding ?? 1);
		const segments: Segment[] = [];

		if (!box) {
			return { segments: [], width: 0 };
		}

		// Render content first to determine width
		let contentSegments: Segment[] = [];
		if (typeof this.renderable === "string") {
			// Simple string content
			contentSegments = [new Segment(this.renderable)];
		} else if (isRenderable(this.renderable)) {
			const contentWidth = maxWidth - 2 - padding[1] - padding[3];
			const result = this.renderable.__rich_console__(console, {
				...consoleOptions,
				width: contentWidth,
			});
			if ("segments" in result) {
				contentSegments = Array.from(result.segments);
			}
		}

		// Split content into lines
		const lines = splitLines(contentSegments);

		// Calculate actual width needed
		let maxContentWidth = 0;
		for (const line of lines) {
			const lineWidth = line.reduce((w, seg) => w + stringWidth(seg.text), 0);
			if (lineWidth > maxContentWidth) maxContentWidth = lineWidth;
		}

		// Consider title/subtitle width
		const titleWidth = this.options.title
			? stringWidth(this.options.title) + 4
			: 0;
		const subtitleWidth = this.options.subtitle
			? stringWidth(this.options.subtitle) + 4
			: 0;

		let panelWidth: number;
		if (expand) {
			panelWidth = maxWidth;
		} else {
			panelWidth = Math.min(
				maxWidth,
				Math.max(
					maxContentWidth + 2 + padding[1] + padding[3],
					titleWidth + 2,
					subtitleWidth + 2,
				),
			);
		}

		const innerWidth = panelWidth - 2;

		// Top border with optional title
		segments.push(
			...this.renderTopBorder(box, innerWidth, borderStyle, titleAlign),
		);
		segments.push(new Segment("\n", Style.null(), true));

		// Top padding
		for (let i = 0; i < padding[0]; i++) {
			segments.push(new Segment(box.left, borderStyle));
			segments.push(new Segment(" ".repeat(innerWidth)));
			segments.push(new Segment(box.right, borderStyle));
			segments.push(new Segment("\n", Style.null(), true));
		}

		// Content rows with borders
		for (const line of lines) {
			segments.push(new Segment(box.left, borderStyle));

			// Left padding
			segments.push(new Segment(" ".repeat(padding[3])));

			// Content with right padding to fill width
			const contentPaddedWidth = innerWidth - padding[1] - padding[3];
			const paddedLine = padLine(line, contentPaddedWidth);
			segments.push(...paddedLine);

			// Right padding
			segments.push(new Segment(" ".repeat(padding[1])));

			segments.push(new Segment(box.right, borderStyle));
			segments.push(new Segment("\n", Style.null(), true));
		}

		// Handle empty content
		if (lines.length === 0) {
			segments.push(new Segment(box.left, borderStyle));
			segments.push(new Segment(" ".repeat(innerWidth)));
			segments.push(new Segment(box.right, borderStyle));
			segments.push(new Segment("\n", Style.null(), true));
		}

		// Bottom padding
		for (let i = 0; i < padding[2]; i++) {
			segments.push(new Segment(box.left, borderStyle));
			segments.push(new Segment(" ".repeat(innerWidth)));
			segments.push(new Segment(box.right, borderStyle));
			segments.push(new Segment("\n", Style.null(), true));
		}

		// Bottom border with optional subtitle
		segments.push(
			...this.renderBottomBorder(box, innerWidth, borderStyle, subtitleAlign),
		);
		segments.push(new Segment("\n", Style.null(), true));

		return {
			segments,
			width: panelWidth,
		};
	}

	/**
	 * Normalize padding to [top, right, bottom, left] format.
	 */
	private normalizePadding(
		padding: number | [number, number] | [number, number, number, number],
	): [number, number, number, number] {
		if (typeof padding === "number") {
			return [padding, padding, padding, padding];
		}
		if (padding.length === 2) {
			return [padding[0], padding[1], padding[0], padding[1]];
		}
		return padding;
	}

	/**
	 * Render top border with optional title.
	 */
	private renderTopBorder(
		box: any,
		innerWidth: number,
		borderStyle: Style,
		align: "left" | "center" | "right",
	): Segment[] {
		const segments: Segment[] = [];

		if (this.options.title) {
			const title = ` ${this.options.title} `;
			const titleWidth = stringWidth(title);
			const remainingWidth = Math.max(0, innerWidth - titleWidth);

			let leftLine: string;
			let rightLine: string;

			switch (align) {
				case "left":
					leftLine = "";
					rightLine = box.top.repeat(remainingWidth);
					break;
				case "right":
					leftLine = box.top.repeat(remainingWidth);
					rightLine = "";
					break;
				case "center":
				default: {
					const leftWidth = Math.floor(remainingWidth / 2);
					leftLine = box.top.repeat(leftWidth);
					rightLine = box.top.repeat(remainingWidth - leftWidth);
					break;
				}
			}

			segments.push(new Segment(box.topLeft, borderStyle));
			segments.push(new Segment(leftLine, borderStyle));
			segments.push(new Segment(title, Style.parse("bold")));
			segments.push(new Segment(rightLine, borderStyle));
			segments.push(new Segment(box.topRight, borderStyle));
		} else {
			segments.push(
				new Segment(
					box.topLeft + box.top.repeat(innerWidth) + box.topRight,
					borderStyle,
				),
			);
		}

		return segments;
	}

	/**
	 * Render bottom border with optional subtitle.
	 */
	private renderBottomBorder(
		box: any,
		innerWidth: number,
		borderStyle: Style,
		align: "left" | "center" | "right",
	): Segment[] {
		const segments: Segment[] = [];

		if (this.options.subtitle) {
			const subtitle = ` ${this.options.subtitle} `;
			const subtitleWidth = stringWidth(subtitle);
			const remainingWidth = Math.max(0, innerWidth - subtitleWidth);

			let leftLine: string;
			let rightLine: string;

			switch (align) {
				case "left":
					leftLine = "";
					rightLine = box.bottom.repeat(remainingWidth);
					break;
				case "right":
					leftLine = box.bottom.repeat(remainingWidth);
					rightLine = "";
					break;
				case "center":
				default: {
					const leftWidth = Math.floor(remainingWidth / 2);
					leftLine = box.bottom.repeat(leftWidth);
					rightLine = box.bottom.repeat(remainingWidth - leftWidth);
					break;
				}
			}

			segments.push(new Segment(box.bottomLeft, borderStyle));
			segments.push(new Segment(leftLine, borderStyle));
			segments.push(new Segment(subtitle, Style.parse("dim italic")));
			segments.push(new Segment(rightLine, borderStyle));
			segments.push(new Segment(box.bottomRight, borderStyle));
		} else {
			segments.push(
				new Segment(
					box.bottomLeft + box.bottom.repeat(innerWidth) + box.bottomRight,
					borderStyle,
				),
			);
		}

		return segments;
	}
}
