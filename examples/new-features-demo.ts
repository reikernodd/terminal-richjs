/**
 * Demo of new Rich-like features: Emoji, JSON, Columns, Spinner, Live
 */
/** biome-ignore-all assist/source/organizeImports: false */
/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: false */

import {
	Console,
	Panel,
	Table,
	Rule,
	Spinner,
	Status,
	Live,
	sleep,
	replaceEmoji,
	EMOJI,
	listEmoji,
	listSpinners,
	Columns,
	JSON,
	Style,
} from "../src";

const console = new Console();

async function main() {
	// ═══════════════════════════════════════════════════════════════
	// EMOJI SUPPORT
	// ═══════════════════════════════════════════════════════════════
	console.print(new Rule("Emoji Shortcodes"));

	const emojiText = replaceEmoji(
		"Hello :wave: World! :rocket: Ready to :code: with :heart:",
	);
	console.print(emojiText);

	console.print("\n[bold]Available emoji shortcodes:[/]");
	const sampleEmojis = [
		"rocket",
		"star",
		"fire",
		"heart",
		"check",
		"warning",
		"coffee",
		"party",
	];
	console.print(sampleEmojis.map((e) => `:${e}: = ${EMOJI[e]}`).join("  "));

	console.print(`\n[dim]Total available emojis: ${listEmoji().length}[/dim]`);

	// ═══════════════════════════════════════════════════════════════
	// JSON PRETTY PRINTING
	// ═══════════════════════════════════════════════════════════════
	console.print(new Rule("JSON Pretty Printing"));

	const sampleData = {
		name: "terminal-richjs",
		version: "0.2.0",
		features: ["emoji", "json", "columns", "spinners", "live"],
		config: {
			theme: "dracula",
			colors: true,
			emoji: true,
		},
		stats: {
			downloads: 12345,
			stars: 678,
			active: true,
		},
	};

	console.print(
		new Panel(JSON.fromData(sampleData, { sortKeys: true }), {
			title: "package.json",
			titleAlign: "left",
		}),
	);

	// ═══════════════════════════════════════════════════════════════
	// COLUMNS LAYOUT
	// ═══════════════════════════════════════════════════════════════
	console.print(new Rule("Columns Layout"));

	const files = [
		"📁 src",
		"📁 dist",
		"📁 node_modules",
		"📄 package.json",
		"📄 tsconfig.json",
		"📄 README.md",
		"📄 LICENSE",
		"📁 examples",
		"📁 tests",
		"📄 .gitignore",
		"📄 .npmrc",
		"📁 .github",
	];

	console.print(new Columns(files, { padding: 2, equal: true }));

	// ═══════════════════════════════════════════════════════════════
	// SPINNERS
	// ═══════════════════════════════════════════════════════════════
	console.print(new Rule("Available Spinners"));

	const spinnerNames = listSpinners().slice(0, 12);
	const spinnerTable = new Table({
		title: "Spinner Animations",
		showHeader: true,
	});
	spinnerTable.addColumn("Name", { style: "cyan" });
	spinnerTable.addColumn("Preview", { style: "green" });

	for (const name of spinnerNames) {
		const spinner = new Spinner(name);
		spinnerTable.addRow(name, spinner.getCurrentFrame());
	}

	console.print(spinnerTable);
	console.print(
		`[dim]Total spinners available: ${listSpinners().length}[/dim]`,
	);

	// ═══════════════════════════════════════════════════════════════
	// LIVE DISPLAY DEMO
	// ═══════════════════════════════════════════════════════════════
	console.print(new Rule("Live Display Demo"));
	console.print("[dim]Watch the progress update in real-time:[/dim]\n");

	const live = new Live({ transient: false });

	await live.start(async (update) => {
		for (let i = 0; i <= 20; i++) {
			const percent = i * 5;
			const filled = Math.floor(percent / 5);
			const remaining = 20 - filled;
			const bar =
				Style.parse("#50fa7b").apply("━".repeat(filled)) +
				Style.parse("#3a3a3a dim").apply("━".repeat(remaining));

			update(`${replaceEmoji(":rocket:")} Processing... ${bar} ${percent}%`);
			await sleep(100);
		}
	});

	console.print(replaceEmoji(":check: Complete!"));

	// ═══════════════════════════════════════════════════════════════
	// STATUS SPINNER DEMO
	// ═══════════════════════════════════════════════════════════════
	console.print(new Rule("Status Spinner Demo"));
	console.print("[dim]Animated status indicator:[/dim]\n");

	const status = new Status("Loading dependencies...", { spinnerName: "dots" });
	status.start();

	await sleep(1000);
	status.update("Compiling TypeScript...");
	await sleep(1000);
	status.update("Running tests...");
	await sleep(1000);

	status.stop();
	console.print(replaceEmoji(":check: All tasks complete!\n"));

	// ═══════════════════════════════════════════════════════════════
	// SUMMARY
	// ═══════════════════════════════════════════════════════════════
	console.print(new Rule("Features Summary"));

	const summaryTable = new Table({ box: "rounded" });
	summaryTable.addColumn("Feature", { style: "bold cyan" });
	summaryTable.addColumn("Description");
	summaryTable.addRow(
		replaceEmoji(":sparkles: Emoji"),
		"200+ shortcodes like :rocket: :heart:",
	);
	summaryTable.addRow(
		replaceEmoji(":package: JSON"),
		"Pretty-printed, syntax-highlighted JSON",
	);
	summaryTable.addRow(
		replaceEmoji(":art: Columns"),
		"Responsive multi-column layouts",
	);
	summaryTable.addRow(
		replaceEmoji(":gear: Spinner"),
		"40+ animated spinner styles",
	);
	summaryTable.addRow(replaceEmoji(":zap: Live"), "Real-time display updates");
	summaryTable.addRow(
		replaceEmoji(":bulb: Status"),
		"Animated status indicators",
	);

	console.print(summaryTable);
}

main().catch(console.error);
