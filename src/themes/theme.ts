import { Style } from "../core/style";
import { DEFAULT_PALETTE, type Palette } from "./palette";

export class Theme {
	public palette: Palette;

	constructor(
		public styles: Record<string, Style | string> = {},
		palette?: Palette,
	) {
		this.palette = palette ?? DEFAULT_PALETTE;
	}

	get(name: string): Style {
		// 1. Check if it's a semantic style name
		const style = this.styles[name];
		if (style) {
			return typeof style === "string" ? this.parseWithPalette(style) : style;
		}

		// 2. Check if it's a palette color name used as a style (e.g. "[primary]")
		const paletteColor = this.palette.get(name);
		if (paletteColor) {
			return new Style({ color: paletteColor });
		}

		return Style.null();
	}

	/**
	 * Parses a style string replacing palette references.
	 * e.g. "bold primary" -> "bold #007bff"
	 */
	private parseWithPalette(styleString: string): Style {
		const parts = styleString.split(" ");
		const resolvedParts = parts.map((part) => {
			// Check foreground
			const color = this.palette.get(part);
			if (color) return color;

			// Check background "on primary"
			if (part.startsWith("on")) {
				const bgName = part.startsWith("on_")
					? part.slice(3)
					: part.slice(2) || parts[parts.indexOf(part) + 1];
				const bgColor = this.palette.get(bgName);
				if (bgColor) return `on ${bgColor}`;
			}
			return part;
		});
		return Style.parse(resolvedParts.join(" "));
	}

	static fromPalette(palette: Palette): Theme {
		return new Theme(
			{
				danger: `bold ${palette.get("danger")}`,
				success: `bold ${palette.get("success")}`,
				warning: `bold ${palette.get("warning")}`,
				info: `${palette.get("info")}`,
			},
			palette,
		);
	}
}

export const DEFAULT_THEME = new Theme({
	none: Style.null(),
	dim: Style.parse("dim"),
	bright: Style.parse("bold"),

	// Semantic
	danger: Style.parse("bold red"),
	success: Style.parse("bold green"),
	warning: Style.parse("bold yellow"),
	info: Style.parse("cyan"),

	// Components
	"rule.line": Style.parse("green"),
	"repr.str": Style.parse("green"),
	"repr.brace": Style.parse("bold"),
});
