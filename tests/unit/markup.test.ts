import chalk from "chalk";
import { beforeAll, describe, expect, it } from "vitest";
import { MarkupParser } from "../../src/core/markup";

describe("MarkupParser", () => {
	beforeAll(() => {
		chalk.level = 3;
	});

	it("should parse simple tags", () => {
		const parser = new MarkupParser();
		const segments = parser.parse("[red]Hello[/red]");
		expect(segments.length).toBe(1);
		expect(segments[0].text).toBe("Hello");
		expect(segments[0].render()).toContain("Hello");
		expect(segments[0].render()).not.toBe("Hello");
	});

	it("should handle nested tags", () => {
		const parser = new MarkupParser();
		const segments = parser.parse("[bold][red]Hello[/red][/bold]");
		expect(segments.length).toBe(1);
		expect(segments[0].text).toBe("Hello");
		// It should have both bold and red styles applied
	});

	it("should handle multiple segments", () => {
		const parser = new MarkupParser();
		const segments = parser.parse("[red]Red[/red] [blue]Blue[/blue]");
		expect(segments.length).toBe(3); // Red, space, Blue
		expect(segments[0].text).toBe("Red");
		expect(segments[1].text).toBe(" ");
		expect(segments[2].text).toBe("Blue");
	});
});
