import { Segment } from "./segment";
import { Style } from "./style";

/**
 * Split a list of segments into lines based on newlines.
 */
export function splitLines(segments: Segment[]): Segment[][] {
	const lines: Segment[][] = [];
	let currentLine: Segment[] = [];

	for (const segment of segments) {
		if (segment.text.includes("\n")) {
			const parts = segment.text.split("\n");
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				if (part) {
					currentLine.push(new Segment(part, segment.style, segment.isControl));
				}

				if (i < parts.length - 1) {
					lines.push(currentLine);
					currentLine = [];
				}
			}
		} else {
			currentLine.push(segment);
		}
	}

	if (currentLine.length > 0) {
		lines.push(currentLine);
	}

	return lines;
}

/**
 * Pad a line of segments to a specific width.
 */
export function padLine(
	line: Segment[],
	width: number,
	style: Style = Style.null(),
): Segment[] {
	const currentWidth = line.reduce((acc, s) => acc + s.cellLength(), 0);
	if (currentWidth >= width) return line;

	const padding = width - currentWidth;
	return [...line, new Segment(" ".repeat(padding), style)];
}
