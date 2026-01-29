import { describe, expect, it } from "vitest";
import { Style } from "../../src/core/style";

describe("Style", () => {
	describe("parse", () => {
		it("should parse simple color", () => {
			const style = Style.parse("red");
			expect(style.color).toBe("red");
		});

		it("should parse bold modifier", () => {
			const style = Style.parse("bold");
			expect(style.bold).toBe(true);
		});

		it("should parse combined styles", () => {
			const style = Style.parse("bold red");
			expect(style.bold).toBe(true);
			expect(style.color).toBe("red");
		});

		it("should parse background color", () => {
			const style = Style.parse("on blue");
			expect(style.backgroundColor).toBe("blue");
		});
	});

	describe("combine", () => {
		it("should merge two styles", () => {
			const s1 = new Style({ bold: true });
			const s2 = new Style({ color: "red" });
			const combined = s1.combine(s2);

			expect(combined.bold).toBe(true);
			expect(combined.color).toBe("red");
		});

		it("should override conflicting properties", () => {
			const s1 = new Style({ color: "red" });
			const s2 = new Style({ color: "blue" });
			const combined = s1.combine(s2);

			expect(combined.color).toBe("blue");
		});
	});
});
