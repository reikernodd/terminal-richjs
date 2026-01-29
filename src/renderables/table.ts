/** biome-ignore-all assist/source/organizeImports: biome-ignore assist/source/organizeImports */
import type { Console } from "../console/console";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";
import { Segment } from "../core/segment";
import { Style } from "../core/style";
import { getBox, type BoxStyle } from "../utils/box";
import { getRenderResult } from "../utils/render-utils";
import { isRenderable } from "../types/renderable";
import stringWidth from "string-width";

export interface ColumnOptions {
	header?: string;
	footer?: string;
	style?: Style | string;
	headerStyle?: Style | string;
	footerStyle?: Style | string;
	justify?: "left" | "center" | "right";
	vertical?: "top" | "middle" | "bottom";
	width?: number;
	minWidth?: number;
	maxWidth?: number;
	ratio?: number;
	noWrap?: boolean;
	overflow?: "fold" | "crop" | "ellipsis";
}

class Column {
	constructor(public readonly options: ColumnOptions) {}

	get header(): string {
		return this.options.header ?? "";
	}
	get footer(): string {
		return this.options.footer ?? "";
	}
	get justify(): "left" | "center" | "right" {
		return this.options.justify ?? "left";
	}
	get style(): Style {
		return typeof this.options.style === "string"
			? Style.parse(this.options.style)
			: (this.options.style ?? Style.null());
	}
	get headerStyle(): Style {
		return typeof this.options.headerStyle === "string"
			? Style.parse(this.options.headerStyle)
			: (this.options.headerStyle ?? Style.null());
	}
}

export interface TableOptions {
	title?: string;
	caption?: string;
	box?: BoxStyle;
	showHeader?: boolean;
	showFooter?: boolean;
	showEdge?: boolean;
	showLines?: boolean;
	expand?: boolean;
	borderStyle?: Style | string;
	headerStyle?: Style | string;
	footerStyle?: Style | string;
	titleStyle?: Style | string;
	captionStyle?: Style | string;
	rowStyles?: string[]; // Alternating row styles, e.g., ["dim", ""] for zebra stripes
	padding?: number;
	highlight?: boolean;
}

export class Table implements Renderable {
	private columns: Column[] = [];
	private rows: (Renderable | string)[][] = [];
	private footerRow: (Renderable | string)[] = [];

	constructor(public readonly options: TableOptions = {}) {}

	addColumn(header: string | ColumnOptions, options?: ColumnOptions): this {
		if (typeof header === "string") {
			this.columns.push(new Column({ header, ...options }));
		} else {
			this.columns.push(new Column(header));
		}
		return this;
	}

	addRow(...cells: (Renderable | string)[]): this {
		this.rows.push(cells);
		return this;
	}

	addFooter(...cells: (Renderable | string)[]): this {
		this.footerRow = cells;
		return this;
	}

	private alignText(
		text: string,
		width: number,
		justify: "left" | "center" | "right",
	): string {
		const textWidth = stringWidth(text);
		const space = Math.max(0, width - textWidth);

		if (justify === "left") return text + " ".repeat(space);
		if (justify === "right") return " ".repeat(space) + text;

		const leftSpace = Math.floor(space / 2);
		const rightSpace = space - leftSpace;
		return " ".repeat(leftSpace) + text + " ".repeat(rightSpace);
	}

	__rich_console__(
		console: Console,
		consoleOptions: ConsoleOptions,
	): RenderResult {
		const width = consoleOptions.width ?? console.width;
		const box = getBox(this.options.box ?? "rounded");
		const segments: Segment[] = [];
		const borderStyle =
			typeof this.options.borderStyle === "string"
				? Style.parse(this.options.borderStyle)
				: (this.options.borderStyle ?? Style.parse("dim"));
		const headerStyle =
			typeof this.options.headerStyle === "string"
				? Style.parse(this.options.headerStyle)
				: (this.options.headerStyle ?? Style.parse("bold cyan"));
		const titleStyle =
			typeof this.options.titleStyle === "string"
				? Style.parse(this.options.titleStyle)
				: (this.options.titleStyle ?? Style.parse("bold"));
		const showLines = this.options.showLines ?? false;
		const rowStyles = this.options.rowStyles ?? [];
		const padding = this.options.padding ?? 1;

		if (!box) return { segments: [], width: 0 };

		// Calculate column widths
		const totalBorderWidth = this.columns.length + 1;
		const paddingWidth = padding * 2 * this.columns.length;
		const availableWidth = width - totalBorderWidth - paddingWidth;
		const colWidth = Math.max(
			1,
			Math.floor(availableWidth / this.columns.length),
		);
		const paddingStr = " ".repeat(padding);

		// Title
		if (this.options.title) {
			const titleLine = this.alignText(this.options.title, width, "center");
			segments.push(
				new Segment(titleLine, titleStyle),
				new Segment("\n", Style.null(), true),
			);
		}

		// Header
		if (this.options.showHeader !== false) {
			// Top border line
			segments.push(
				new Segment(
					box.topLeft +
						this.columns
							.map(() => (box.top || "─").repeat(colWidth + padding * 2))
							.join(box.topMid || "┬") +
						box.topRight,
					borderStyle,
				),
				new Segment("\n", Style.null(), true),
			);

			// Header row
			segments.push(new Segment(box.left, borderStyle));
			this.columns.forEach((col, i) => {
				const text = this.alignText(col.header, colWidth, col.justify);
				const cellStyle = col.headerStyle.combine(headerStyle);
				segments.push(new Segment(paddingStr + text + paddingStr, cellStyle));
				segments.push(
					new Segment(
						i === this.columns.length - 1 ? box.right : box.verticalMid || "│",
						borderStyle,
					),
				);
			});
			segments.push(new Segment("\n", Style.null(), true));

			// Header separator line
			segments.push(
				new Segment(
					(box.leftMid || "├") +
						this.columns
							.map(() => (box.mid || "─").repeat(colWidth + padding * 2))
							.join(box.midMid || "┼") +
						(box.rightMid || "┤"),
					borderStyle,
				),
				new Segment("\n", Style.null(), true),
			);
		}

		// Data rows
		this.rows.forEach((row, rowIndex) => {
			// Get alternating row style
			let rowStyle = Style.null();
			if (rowStyles.length > 0) {
				const styleStr = rowStyles[rowIndex % rowStyles.length];
				if (styleStr) {
					rowStyle = Style.parse(styleStr);
				}
			}

			segments.push(new Segment(box.left, borderStyle));
			this.columns.forEach((col, i) => {
				const cell = row[i];
				let cellSegments: Segment[] = [];

				// Render cell content
				if (typeof cell === "string") {
					const text = this.alignText(cell, colWidth, col.justify);
					const cellStyle = col.style.combine(rowStyle);
					cellSegments = [
						new Segment(paddingStr + text + paddingStr, cellStyle),
					];
				} else if (isRenderable(cell)) {
					// Render the renderable constrained to colWidth
					const result = getRenderResult(cell, console, {
						...consoleOptions,
						width: colWidth,
					});

					// Add padding
					segments.push(new Segment(paddingStr));
					cellSegments = result.segments.map((s) => {
						// Apply row style to each segment
						return new Segment(s.text, s.style.combine(rowStyle), s.isControl);
					});

					// Pad to fill column width
					const contentWidth = result.width ?? 0;
					const space = Math.max(0, colWidth - contentWidth);
					if (space > 0) {
						cellSegments.push(new Segment(" ".repeat(space), rowStyle));
					}
					cellSegments.push(new Segment(paddingStr));
				}

				segments.push(...cellSegments);
				segments.push(
					new Segment(
						i === this.columns.length - 1 ? box.right : box.verticalMid || "│",
						borderStyle,
					),
				);
			});
			segments.push(new Segment("\n", Style.null(), true));

			// Add row separator if showLines is true
			if (showLines && rowIndex < this.rows.length - 1) {
				segments.push(
					new Segment(
						(box.leftMid || "├") +
							this.columns
								.map(() => (box.mid || "─").repeat(colWidth + padding * 2))
								.join(box.midMid || "┼") +
							(box.rightMid || "┤"),
						borderStyle,
					),
					new Segment("\n", Style.null(), true),
				);
			}
		});

		// Footer
		if (this.options.showFooter && this.footerRow.length > 0) {
			const footerStyle =
				typeof this.options.footerStyle === "string"
					? Style.parse(this.options.footerStyle)
					: (this.options.footerStyle ?? Style.parse("bold"));

			// Footer separator
			segments.push(
				new Segment(
					(box.leftMid || "├") +
						this.columns
							.map(() => (box.mid || "─").repeat(colWidth + padding * 2))
							.join(box.midMid || "┼") +
						(box.rightMid || "┤"),
					borderStyle,
				),
				new Segment("\n", Style.null(), true),
			);

			// Footer row
			segments.push(new Segment(box.left, borderStyle));
			this.columns.forEach((col, i) => {
				const cell = this.footerRow[i];
				const text = typeof cell === "string" ? cell : "";
				const alignedText = this.alignText(text, colWidth, col.justify);
				segments.push(
					new Segment(paddingStr + alignedText + paddingStr, footerStyle),
				);
				segments.push(
					new Segment(
						i === this.columns.length - 1 ? box.right : box.verticalMid || "│",
						borderStyle,
					),
				);
			});
			segments.push(new Segment("\n", Style.null(), true));
		}

		// Bottom border line
		segments.push(
			new Segment(
				box.bottomLeft +
					this.columns
						.map(() => (box.bottom || "─").repeat(colWidth + padding * 2))
						.join(box.bottomMid || "┴") +
					box.bottomRight,
				borderStyle,
			),
			new Segment("\n", Style.null(), true),
		);

		// Caption
		if (this.options.caption) {
			const captionStyle =
				typeof this.options.captionStyle === "string"
					? Style.parse(this.options.captionStyle)
					: (this.options.captionStyle ?? Style.parse("dim italic"));
			const captionLine = this.alignText(this.options.caption, width, "center");
			segments.push(
				new Segment(captionLine, captionStyle),
				new Segment("\n", Style.null(), true),
			);
		}

		return { segments, width };
	}
}
