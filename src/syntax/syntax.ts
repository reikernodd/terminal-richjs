/** biome-ignore-all assist/source/organizeImports: false */
import hljs, { type HighlightResult } from "highlight.js";
import type { Console } from "../console/console";
import type { ConsoleOptions } from "../types/console-options";
import type { Renderable, RenderResult } from "../types/renderable";
import { Segment } from "../core/segment";
import { Style } from "../core/style";
import { getTheme, type SyntaxTheme } from "./theme";
import stringWidth from "string-width";

export interface SyntaxOptions {
	theme?: string;
	lineNumbers?: boolean;
	startLine?: number;
	highlightLines?: number[]; // Lines to highlight (e.g., error lines)
	wordWrap?: boolean;
}

/**
 * Syntax highlighted code renderable.
 * Uses highlight.js for tokenization and applies Rich-style themes.
 */
export class Syntax implements Renderable {
	private readonly syntaxTheme: SyntaxTheme;

	constructor(
		public readonly code: string,
		public readonly lexer: string,
		public readonly options: SyntaxOptions = {},
	) {
		this.syntaxTheme = getTheme(options.theme ?? "monokai");
	}

	/**
	 * Create Syntax from a file path (convenience method).
	 */
	static fromPath(filePath: string, options: SyntaxOptions = {}): Syntax {
		const fs = require("node:fs");
		const path = require("node:path");
		const code = fs.readFileSync(filePath, "utf-8");
		const ext = path.extname(filePath).slice(1);

		// Map common extensions to highlight.js lexer names
		const lexerMap: Record<string, string> = {
			ts: "typescript",
			tsx: "typescript",
			js: "javascript",
			jsx: "javascript",
			py: "python",
			rb: "ruby",
			rs: "rust",
			go: "go",
			java: "java",
			cpp: "cpp",
			c: "c",
			h: "c",
			hpp: "cpp",
			cs: "csharp",
			php: "php",
			sh: "bash",
			bash: "bash",
			zsh: "bash",
			md: "markdown",
			json: "json",
			yaml: "yaml",
			yml: "yaml",
			toml: "ini",
			css: "css",
			scss: "scss",
			html: "html",
			xml: "xml",
			sql: "sql",
		};

		const lexer = lexerMap[ext] ?? ext;
		return new Syntax(code, lexer, options);
	}

	__rich_console__(_console: Console, _options: ConsoleOptions): RenderResult {
		const segments: Segment[] = [];
		const startLine = this.options.startLine ?? 1;
		const showLineNumbers = this.options.lineNumbers ?? false;
		const highlightLines = new Set(this.options.highlightLines ?? []);

		// Highlight the code
		let highlighted: HighlightResult;
		try {
			highlighted = hljs.highlight(this.code, { language: this.lexer });
		} catch {
			// Fallback if language not found
			highlighted = hljs.highlightAuto(this.code);
		}

		// Parse highlighted HTML into tokens
		const tokens = this.parseHighlightedHtml(highlighted.value);

		// Group tokens by line
		const lines = this.groupTokensByLine(tokens);

		// Calculate line number width
		const lastLineNumber = startLine + lines.length - 1;
		const lineNumberWidth = showLineNumbers
			? String(lastLineNumber).length + 1
			: 0;

		let maxWidth = 0;

		lines.forEach((lineTokens, i) => {
			const lineNumber = startLine + i;
			const isHighlighted = highlightLines.has(lineNumber);

			// Error line indicator
			if (isHighlighted) {
				segments.push(new Segment("❱ ", Style.parse("#ff5555 bold")));
			} else if (showLineNumbers) {
				segments.push(new Segment("  ", Style.null()));
			}

			// Line number
			if (showLineNumbers) {
				const lineNumStr = String(lineNumber).padStart(lineNumberWidth - 1);
				const lineNumStyle = isHighlighted
					? Style.parse("#ff5555 bold")
					: Style.parse("#6e7681 dim");
				segments.push(new Segment(`${lineNumStr} │ `, lineNumStyle));
			}

			// Line content with syntax highlighting
			let lineWidth = 0;
			for (const token of lineTokens) {
				// Apply highlight background for error lines
				let style = token.style;
				if (isHighlighted) {
					style = style.combine(Style.parse("on #3a1d1d"));
				}
				segments.push(new Segment(token.text, style));
				lineWidth += stringWidth(token.text);
			}

			segments.push(new Segment("\n", Style.null(), true));

			const totalLineWidth =
				lineWidth + (showLineNumbers ? lineNumberWidth + 5 : 0);
			if (totalLineWidth > maxWidth) maxWidth = totalLineWidth;
		});

		return {
			segments,
			width: maxWidth,
		};
	}

	/**
	 * Parse highlight.js HTML output into styled tokens.
	 */
	private parseHighlightedHtml(
		html: string,
	): Array<{ text: string; style: Style }> {
		const tokens: Array<{ text: string; style: Style }> = [];

		// Recursive parser for nested spans

		// Regex to match HTML tags and text is inlined in openMatch below

		const processHtml = (input: string, inheritedScope: string[] = []) => {
			// Simple recursive descent parser for nested spans
			let remaining = input;

			while (remaining.length > 0) {
				// Check for opening span
				const openMatch = remaining.match(/^<span class="hljs-([^"]+)">/);
				if (openMatch) {
					remaining = remaining.slice(openMatch[0].length);
					const scope = openMatch[1];

					// Find matching closing tag (handling nesting)
					let depth = 1;
					let innerEnd = 0;
					for (let i = 0; i < remaining.length; i++) {
						if (remaining.slice(i).startsWith("<span")) {
							depth++;
						} else if (remaining.slice(i).startsWith("</span>")) {
							depth--;
							if (depth === 0) {
								innerEnd = i;
								break;
							}
						}
					}

					const innerContent = remaining.slice(0, innerEnd);
					remaining = remaining.slice(innerEnd + "</span>".length);

					// Process inner content with updated scope
					const newScope = [...inheritedScope, scope];
					processHtml(innerContent, newScope);
					continue;
				}

				// Check for text content
				const textMatch = remaining.match(/^([^<]+)/);
				if (textMatch) {
					const text = this.decodeHtmlEntities(textMatch[1]);
					const scope = inheritedScope[inheritedScope.length - 1] ?? "";
					const style = this.getStyleForScope(scope);
					tokens.push({ text, style });
					remaining = remaining.slice(textMatch[0].length);
					continue;
				}

				// Skip any other tags
				const tagMatch = remaining.match(/^<[^>]+>/);
				if (tagMatch) {
					remaining = remaining.slice(tagMatch[0].length);
					continue;
				}

				// Safety: if nothing matches, consume one character
				if (remaining.length > 0) {
					tokens.push({ text: remaining[0], style: Style.null() });
					remaining = remaining.slice(1);
				}
			}
		};

		processHtml(html);
		return tokens;
	}

	/**
	 * Decode HTML entities to their character equivalents.
	 */
	private decodeHtmlEntities(text: string): string {
		return text
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&")
			.replace(/&quot;/g, '"')
			.replace(/&#x27;/g, "'")
			.replace(/&#39;/g, "'")
			.replace(/&nbsp;/g, " ");
	}

	/**
	 * Get style for a highlight.js scope/class.
	 */
	private getStyleForScope(scope: string): Style {
		if (!scope) return Style.null();

		// Try exact match first
		if (this.syntaxTheme.styles[scope]) {
			return this.syntaxTheme.styles[scope];
		}

		// Try parent scope (e.g., 'title.function' -> 'title')
		const parts = scope.split(".");
		for (let i = parts.length - 1; i >= 0; i--) {
			const partialScope = parts.slice(0, i + 1).join(".");
			if (this.syntaxTheme.styles[partialScope]) {
				return this.syntaxTheme.styles[partialScope];
			}
		}

		// Try first part only
		if (this.syntaxTheme.styles[parts[0]]) {
			return this.syntaxTheme.styles[parts[0]];
		}

		return Style.null();
	}

	/**
	 * Group tokens by line (split on newlines).
	 */
	private groupTokensByLine(
		tokens: Array<{ text: string; style: Style }>,
	): Array<Array<{ text: string; style: Style }>> {
		const lines: Array<Array<{ text: string; style: Style }>> = [[]];

		for (const token of tokens) {
			const parts = token.text.split("\n");

			for (let i = 0; i < parts.length; i++) {
				if (i > 0) {
					lines.push([]);
				}
				if (parts[i]) {
					lines[lines.length - 1].push({ text: parts[i], style: token.style });
				}
			}
		}

		return lines;
	}
}
