import { Console, print, track } from "../src";

const console = new Console();

// 1. Entry Points
print("1. [bold magenta]Global print works![/]");

// 2. Markup Control
console.print("2. Safe print: [red]This is safe[/]", { markup: false });

// 3. Status
console.print("3. Status Spinner");
// Using the callback wrapper which mimics 'with' context
await console.withStatus("Processing...", async () => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
});
print("[green]Done[/]");

// 4. Track
console.print("4. Tracking Progress");
const items = [1, 2, 3, 4, 5];
for (const item of track(items, "Downloading...")) {
	await new Promise((resolve) => setTimeout(resolve, 200));
}
print("[green]Finished[/]");
