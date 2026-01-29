/** biome-ignore-all assist/source/organizeImports: false */
import fs from "node:fs";
import { Console } from "../console/console";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";
import { Segment } from "../core/segment";
import { Style } from "../core/style";
import { Trace, type StackFrame } from "./trace";
import { Syntax } from "../syntax/syntax";

export interface TracebackOptions {
	showLocals?: boolean;
	extraLines?: number;
	theme?: string;
	suppressInternal?: boolean;
	maxFrames?: number;
}

/**
 * Beautiful error traceback rendering.
 * Displays syntax-highlighted stack traces with optional local variables.
 */
export class Traceback implements Renderable {
	private frames: StackFrame[];

	constructor(
		public readonly error: Error,
		public readonly options: TracebackOptions = {},
	) {
		this.frames = Trace.parse(error);
	}

	__rich_console__(
		console: Console,
		consoleOptions: ConsoleOptions,
	): RenderResult {
		const segments: Segment[] = [];
		const extraLines = this.options.extraLines ?? 3;
		const theme = this.options.theme ?? "monokai";
		const suppressInternal = this.options.suppressInternal ?? true;
		const maxFrames = this.options.maxFrames ?? 100;
		const width = consoleOptions.width ?? console.width;

		// Header: "Traceback (most recent call last)"
		segments.push(new Segment("\n", Style.null(), true));
		const headerStyle = Style.parse("#ff5555 bold");
		segments.push(new Segment("Traceback", headerStyle));
		segments.push(
			new Segment(" (most recent call last)\n", Style.parse("dim")),
		);
		segments.push(new Segment("\n", Style.null(), true));

		// Filter and limit frames
		let filteredFrames = this.frames;
		if (suppressInternal) {
			filteredFrames = filteredFrames.filter(
				(f) =>
					!f.filePath.startsWith("node:") &&
					!f.filePath.includes("node_modules"),
			);
		}
		filteredFrames = filteredFrames.slice(0, maxFrames);

		// Render each frame
		for (const frame of filteredFrames) {
			// Frame header: File "path", line X, in functionName
			const frameHeaderStyle = Style.parse("#6e7681");
			segments.push(new Segment("  File ", frameHeaderStyle));
			segments.push(new Segment(`"${frame.filePath}"`, Style.parse("#61afef")));
			segments.push(new Segment(", line ", frameHeaderStyle));
			segments.push(
				new Segment(String(frame.lineNumber), Style.parse("#e5c07b bold")),
			);
			segments.push(new Segment(", in ", frameHeaderStyle));
			segments.push(
				new Segment(frame.functionName, Style.parse("#98c379 italic")),
			);
			segments.push(new Segment("\n", Style.null(), true));

			// Code snippet
			let codeSnippet = "";
			try {
				if (fs.existsSync(frame.filePath)) {
					const content = fs.readFileSync(frame.filePath, "utf-8");
					const lines = content.split("\n");
					const start = Math.max(0, frame.lineNumber - extraLines - 1);
					const end = Math.min(lines.length, frame.lineNumber + extraLines);
					codeSnippet = lines.slice(start, end).join("\n");

					// Detect language from file extension
					const ext = frame.filePath.split(".").pop() ?? "txt";
					const lexerMap: Record<string, string> = {
						ts: "typescript",
						tsx: "typescript",
						js: "javascript",
						jsx: "javascript",
						py: "python",
						rb: "ruby",
						rs: "rust",
						go: "go",
					};
					const lexer = lexerMap[ext] ?? ext;

					// Create syntax highlighter with error line highlighted
					const syntax = new Syntax(codeSnippet, lexer, {
						theme,
						lineNumbers: true,
						startLine: start + 1,
						highlightLines: [frame.lineNumber],
					});

					// Render the syntax block
					const syntaxResult = syntax.__rich_console__(console, {
						...consoleOptions,
						width: width - 4,
					});

					// Indent the code block
					segments.push(new Segment("\n", Style.null(), true));
					for (const seg of syntaxResult.segments) {
						if (seg.isControl && seg.text === "\n") {
							segments.push(seg);
							segments.push(new Segment("    ")); // Indent each line
						} else {
							segments.push(seg);
						}
					}
				}
			} catch {
				// If file can't be read, show a placeholder
				segments.push(new Segment("    ", Style.null()));
				segments.push(
					new Segment("[source not available]", Style.parse("dim italic")),
				);
				segments.push(new Segment("\n", Style.null(), true));
			}

			segments.push(new Segment("\n", Style.null(), true));
		}

		// Error message at the bottom
		const errorNameStyle = Style.parse("#ff5555 bold");
		const errorMsgStyle = Style.parse("#ff5555");

		segments.push(new Segment(this.error.name, errorNameStyle));
		segments.push(new Segment(": ", Style.parse("dim")));
		segments.push(new Segment(this.error.message, errorMsgStyle));
		segments.push(new Segment("\n", Style.null(), true));

		return { segments, width };
	}
}

/**
 * Install Rich traceback handler as the default for uncaught exceptions.
 */
export function installTracebackHandler(options: TracebackOptions = {}): void {
	const console = new Console();

	process.on("uncaughtException", (error: Error) => {
		const traceback = new Traceback(error, options);
		console.print(traceback);
		process.exit(1);
	});

	process.on("unhandledRejection", (reason: unknown) => {
		const error = reason instanceof Error ? reason : new Error(String(reason));
		const traceback = new Traceback(error, options);
		console.print(traceback);
		process.exit(1);
	});
}
