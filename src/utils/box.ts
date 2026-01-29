import boxes from "cli-boxes";

export interface BoxData {
	topLeft: string;
	top: string;
	topRight: string;
	right: string;
	bottomRight: string;
	bottom: string;
	bottomLeft: string;
	left: string;
	// Middle connectors for tables
	topMid?: string;
	midMid?: string;
	bottomMid?: string;
	leftMid?: string;
	rightMid?: string;
	mid?: string;
	verticalMid?: string;
	[key: string]: string | undefined;
}

// Custom box definitions for styles not in cli-boxes or with enhanced connectors
const CUSTOM_BOXES: Record<string, BoxData> = {
	// Rounded corners (may not be in all versions of cli-boxes)
	rounded: {
		topLeft: "╭",
		top: "─",
		topRight: "╮",
		right: "│",
		bottomRight: "╯",
		bottom: "─",
		bottomLeft: "╰",
		left: "│",
		topMid: "┬",
		midMid: "┼",
		bottomMid: "┴",
		leftMid: "├",
		rightMid: "┤",
		mid: "─",
		verticalMid: "│",
	},
	round: {
		topLeft: "╭",
		top: "─",
		topRight: "╮",
		right: "│",
		bottomRight: "╯",
		bottom: "─",
		bottomLeft: "╰",
		left: "│",
		topMid: "┬",
		midMid: "┼",
		bottomMid: "┴",
		leftMid: "├",
		rightMid: "┤",
		mid: "─",
		verticalMid: "│",
	},
	// Heavy/bold lines
	heavy: {
		topLeft: "┏",
		top: "━",
		topRight: "┓",
		right: "┃",
		bottomRight: "┛",
		bottom: "━",
		bottomLeft: "┗",
		left: "┃",
		topMid: "┳",
		midMid: "╋",
		bottomMid: "┻",
		leftMid: "┣",
		rightMid: "┫",
		mid: "━",
		verticalMid: "┃",
	},
	// Double lines
	double: {
		topLeft: "╔",
		top: "═",
		topRight: "╗",
		right: "║",
		bottomRight: "╝",
		bottom: "═",
		bottomLeft: "╚",
		left: "║",
		topMid: "╦",
		midMid: "╬",
		bottomMid: "╩",
		leftMid: "╠",
		rightMid: "╣",
		mid: "═",
		verticalMid: "║",
	},
	// Single/square lines
	single: {
		topLeft: "┌",
		top: "─",
		topRight: "┐",
		right: "│",
		bottomRight: "┘",
		bottom: "─",
		bottomLeft: "└",
		left: "│",
		topMid: "┬",
		midMid: "┼",
		bottomMid: "┴",
		leftMid: "├",
		rightMid: "┤",
		mid: "─",
		verticalMid: "│",
	},
	square: {
		topLeft: "┌",
		top: "─",
		topRight: "┐",
		right: "│",
		bottomRight: "┘",
		bottom: "─",
		bottomLeft: "└",
		left: "│",
		topMid: "┬",
		midMid: "┼",
		bottomMid: "┴",
		leftMid: "├",
		rightMid: "┤",
		mid: "─",
		verticalMid: "│",
	},
	// ASCII-safe
	ascii: {
		topLeft: "+",
		top: "-",
		topRight: "+",
		right: "|",
		bottomRight: "+",
		bottom: "-",
		bottomLeft: "+",
		left: "|",
		topMid: "+",
		midMid: "+",
		bottomMid: "+",
		leftMid: "+",
		rightMid: "+",
		mid: "-",
		verticalMid: "|",
	},
	// Minimal - no borders
	minimal: {
		topLeft: " ",
		top: " ",
		topRight: " ",
		right: " ",
		bottomRight: " ",
		bottom: " ",
		bottomLeft: " ",
		left: " ",
		topMid: " ",
		midMid: " ",
		bottomMid: " ",
		leftMid: " ",
		rightMid: " ",
		mid: "─",
		verticalMid: " ",
	},
	// Simple - just horizontal lines
	simple: {
		topLeft: " ",
		top: "─",
		topRight: " ",
		right: " ",
		bottomRight: " ",
		bottom: "─",
		bottomLeft: " ",
		left: " ",
		topMid: " ",
		midMid: "─",
		bottomMid: " ",
		leftMid: " ",
		rightMid: " ",
		mid: "─",
		verticalMid: " ",
	},
	// Markdown style
	markdown: {
		topLeft: " ",
		top: " ",
		topRight: " ",
		right: "|",
		bottomRight: " ",
		bottom: " ",
		bottomLeft: " ",
		left: "|",
		topMid: " ",
		midMid: "|",
		bottomMid: " ",
		leftMid: "|",
		rightMid: "|",
		mid: "-",
		verticalMid: "|",
	},
};

export type BoxStyle =
	| "none"
	| "rounded"
	| "round"
	| "heavy"
	| "bold"
	| "double"
	| "single"
	| "square"
	| "ascii"
	| "minimal"
	| "simple"
	| "markdown"
	| keyof typeof boxes;

/**
 * Get box drawing characters for a given style.
 */
export function getBox(style: BoxStyle): BoxData | null {
	if (style === "none") return null;

	// Check custom boxes first (they have better middle connector support)
	if (style in CUSTOM_BOXES) {
		return CUSTOM_BOXES[style];
	}

	// Alias handling
	if (style === "bold") {
		return CUSTOM_BOXES.heavy;
	}

	// Fall back to cli-boxes
	const cliBox = (boxes as Record<string, BoxData>)[style];
	if (cliBox) {
		// Enhance cli-boxes data with middle connectors
		return {
			...cliBox,
			topMid: cliBox.topMid ?? "┬",
			midMid: cliBox.midMid ?? "┼",
			bottomMid: cliBox.bottomMid ?? "┴",
			leftMid: cliBox.leftMid ?? "├",
			rightMid: cliBox.rightMid ?? "┤",
			mid: cliBox.mid ?? "─",
			verticalMid: cliBox.verticalMid ?? "│",
		};
	}

	// Default to rounded
	return CUSTOM_BOXES.rounded;
}

/**
 * List all available box styles.
 */
export function listBoxStyles(): string[] {
	const customStyles = Object.keys(CUSTOM_BOXES);
	const cliBoxStyles = Object.keys(boxes);
	return [...new Set([...customStyles, ...cliBoxStyles])];
}
