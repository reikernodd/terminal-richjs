import type { Console } from "../console/console";
import { padLine, splitLines } from "../core/lines";
import { Segment } from "../core/segment";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";
import { getRenderResult } from "../utils/render-utils";

export interface LayoutOptions {
	size?: number; // Fixed size
	ratio?: number; // Flex ratio (default 1)
	minimumSize?: number; // Min width/height
	visible?: boolean;
}

export class Layout implements Renderable {
	private _renderable: Renderable | null = null;
	private _children: Layout[] = [];
	private _direction: "row" | "column" = "column";

	public size: number | undefined;
	public ratio: number = 1;
	public minimumSize: number = 0;
	public visible: boolean = true;

	constructor(renderable?: Renderable, options: LayoutOptions = {}) {
		if (renderable) this._renderable = renderable;
		this.size = options.size;
		this.ratio = options.ratio ?? 1;
		this.minimumSize = options.minimumSize ?? 0;
		this.visible = options.visible ?? true;
	}

	/**
	 * Split the layout into a row (horizontal split).
	 */
	splitRow(...layouts: (Layout | Renderable)[]): void {
		this._direction = "row";
		this._children = layouts.map((l) =>
			l instanceof Layout ? l : new Layout(l),
		);
	}

	/**
	 * Split the layout into a column (vertical split).
	 */
	splitColumn(...layouts: (Layout | Renderable)[]): void {
		this._direction = "column";
		this._children = layouts.map((l) =>
			l instanceof Layout ? l : new Layout(l),
		);
	}

	get renderable(): Renderable | null {
		return this._renderable;
	}

	update(renderable: Renderable): void {
		this._renderable = renderable;
	}

	__rich_console__(console: Console, options: ConsoleOptions): RenderResult {
		if (!this.visible) return { segments: [], width: 0, height: 0 };

		const width = options.width ?? console.width;
		const height = options.height ?? console.height;

		// Leaf node: render the content
		if (this._children.length === 0) {
			if (this._renderable) {
				return getRenderResult(this._renderable, console, {
					...options,
					width,
					height,
				});
			}
			// Empty layout
			return { segments: [], width, height: 0 };
		}

		const segments: Segment[] = [];

		if (this._direction === "column") {
			// Vertical Split
			// In terminal, usually we just stack them.
			// If we had a fixed height constraint for THIS layout, we could distribute it.
			// For now, we assume implicit auto-height behavior unless explicit fixed height is implemented
			// which requires clipping.

			for (const child of this._children) {
				if (!child.visible) continue;

				const result = getRenderResult(child, console, { ...options, width });
				segments.push(...result.segments);
				const last = result.segments[result.segments.length - 1];
				if (last && !last.text.endsWith("\n")) {
					segments.push(new Segment("\n"));
				}
			}
		} else {
			// Horizontal Split (Row)
			const childWidths = this.calculateSizes(width, this._children);
			const renderedLines: Segment[][][] = [];
			let maxHeight = 0;

			// Render each child into its slice
			this._children.forEach((child, i) => {
				if (!child.visible) {
					renderedLines.push([]);
					return;
				}

				const w = childWidths[i];
				const result = getRenderResult(child, console, {
					...options,
					width: w,
				});

				const childSegments: Segment[] = result.segments;

				const lines = splitLines(childSegments);
				renderedLines.push(lines);
				if (lines.length > maxHeight) maxHeight = lines.length;
			});

			// Zip lines together
			for (let y = 0; y < maxHeight; y++) {
				for (let x = 0; x < this._children.length; x++) {
					if (!this._children[x].visible) continue;

					const lines = renderedLines[x];
					const w = childWidths[x];

					if (y < lines.length) {
						const line = lines[y];
						segments.push(...padLine(line, w));
					} else {
						segments.push(new Segment(" ".repeat(w)));
					}
				}
				segments.push(new Segment("\n"));
			}
		}

		return { segments, width, height };
	}

	/**
	 * Calculates the size (width for rows, height for columns) for each child
	 * based on constraints.
	 */
	private calculateSizes(availableSpace: number, children: Layout[]): number[] {
		const sizes = new Array(children.length).fill(0);
		const visibleChildren = children
			.map((c, i) => ({ child: c, index: i }))
			.filter((x) => x.child.visible);

		if (visibleChildren.length === 0) return sizes;

		let remainingSpace = availableSpace;
		let totalRatio = 0;

		// Pass 1: Allocate fixed sizes and minimums
		for (const { child, index } of visibleChildren) {
			if (child.size !== undefined) {
				const size = Math.min(child.size, remainingSpace);
				sizes[index] = size;
				remainingSpace -= size;
			} else if (child.minimumSize > 0) {
				sizes[index] = child.minimumSize;
				remainingSpace -= child.minimumSize;
			}

			// Only count ratio for children without fixed size
			if (child.size === undefined) {
				totalRatio += child.ratio;
			}
		}

		if (remainingSpace <= 0) return sizes;

		// Pass 2: Distribute remaining space by ratio
		// If totalRatio is 0 (all fixed), remaining space stays unused (or could be given to last)
		if (totalRatio > 0) {
			let distributed = 0;

			// Distribute to all flexible children
			for (let i = 0; i < visibleChildren.length; i++) {
				const { child, index } = visibleChildren[i];
				if (child.size === undefined) {
					const share = Math.floor((child.ratio / totalRatio) * remainingSpace);
					sizes[index] += share;
					distributed += share;
				}
			}

			// Give rounding dust to the last flexible child
			const dust = remainingSpace - distributed;
			if (dust > 0) {
				// Find last flexible child
				for (let i = visibleChildren.length - 1; i >= 0; i--) {
					const { child, index } = visibleChildren[i];
					if (child.size === undefined) {
						sizes[index] += dust;
						break;
					}
				}
			}
		}

		return sizes;
	}
}
