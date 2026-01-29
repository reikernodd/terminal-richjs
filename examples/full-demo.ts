import { Console, Panel, ProgressBar, Rule, Tree } from "../src";
import { Live } from "../src/live/live";

const console = new Console();

console.print(new Rule("RichJS Advanced Showcase", "━", "bold cyan"));

// 1. Nested Composition (Tree inside Panel)
const tree = new Tree("📁 Project Root");
const src = tree.add("📁 src");
src.add("📄 index.ts");
src.add("📄 console.ts");
tree.add("📄 package.json");

// This previously showed "Renderable content" - now should show the tree!
console.print(
	new Panel(tree, {
		title: "Nested Structure",
		box: "round",
		borderStyle: "blue",
	}),
);

// 2. Live Updates
console.print("\n[bold]Starting Live Update Demo...[/bold]");

const progress = new ProgressBar(100, 0);
const live = new Live(progress, console);

live.start();

const total = 100;
let current = 0;

const interval = setInterval(() => {
	current += 5;
	const newBar = new ProgressBar(total, current);
	live.update(newBar);

	if (current >= total) {
		clearInterval(interval);
		live.stop();
		console.print("[green]Done![/green]");
	}
}, 100);
