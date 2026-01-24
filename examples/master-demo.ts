import { Console, Table, Tree, Panel, Syntax, ProgressBar, Rule, print } from '../src';

const console = new Console();

// 1. Rule with styling
print(new Rule("RichJS Master Demo", "━", "bold cyan"));

// 2. Advanced Tables (Image 1 Parity)
const table = new Table({
    title: "Project Metrics",
    box: 'double',
    borderStyle: 'blue'
});
table.addColumn("Feature", { justify: 'left', style: 'cyan' });
table.addColumn("Status", { justify: 'center' });
table.addColumn("Complexity", { justify: 'right', style: 'magenta' });

table.addRow("Markup Parsing", "[green]Done[/]", "Medium");
table.addRow("Nested Layouts", "[green]Done[/]", "High");
table.addRow("Tracebacks", "[green]Done[/]", "High");
table.addRow("Interactive Prompts", "[yellow]Pending[/]", "Low");

console.print(table);

// 3. Complex Nested Tree (Image 3 Parity)
const tree = new Tree("[bold green]RichJS Components[/]");
const renderables = tree.add("📁 Renderables");
renderables.add(new Panel("Simple Panel", { box: 'round', title: "Box" }));

const dataNode = tree.add("📁 Data Display");
const miniTable = new Table({ box: 'simple' });
miniTable.addColumn("K");
miniTable.addColumn("V");
miniTable.addRow("ID", "9001");
miniTable.addRow("Type", "Component");
dataNode.add(miniTable);

const codeNode = tree.add("📁 Code Highlighting");
codeNode.add(new Syntax("const x = 42;\nconsole.log(x);", "typescript", { lineNumbers: true }));

console.print(new Panel(tree, { title: "Composition Example", padding: 1 }));

// 4. Traceback (Image 2 Parity)
console.print("\n[bold red]Testing Advanced Traceback...[/]");
try {
    const error = new Error("Demo Error for Traceback parity");
    console.printException(error);
} catch (e) {
    // Already handled in try block
}

print(new Rule("End of Demo", "─", "dim"));
