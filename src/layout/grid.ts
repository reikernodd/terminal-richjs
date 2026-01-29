import { Layout, type LayoutOptions } from "./layout";

export class Grid extends Layout {
	constructor() {
		super();
	}

	/**
	 * Adds a row to the grid with optional constraints.
	 */
	addRow(content: Layout | any, options: LayoutOptions = {}): void {
		const layout =
			content instanceof Layout ? content : new Layout(content, options);
		// Ensure options are applied if wrapping
		if (!(content instanceof Layout)) {
			layout.size = options.size;
			layout.ratio = options.ratio ?? 1;
			layout.minimumSize = options.minimumSize ?? 0;
		}

		// If grid is initialized, we assume it's a Column of Rows
		// (This is a simplified Grid, effectively a generic Layout wrapper for clarity)
		// A true Grid often implies 2D addressing, but in Rich, Grid is often just rows of columns.
		this.splitColumn(...(this["_children"] || []), layout);
	}
}
