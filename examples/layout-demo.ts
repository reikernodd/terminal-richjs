import { Console, Layout, Panel, Table, Tree } from '../src';

const console = new Console();

// Create the main layout
const layout = new Layout();

// Split the main layout into two columns (Header area + Body area)
// Actually, let's do a classic Dashboard:
// Top: Header
// Middle: Split into Left (Menu) and Right (Content)
// Bottom: Footer

const header = new Panel("[bold white on blue]Dashboard Header[/]", { box: 'double', style: "blue" });
const footer = new Panel("[dim]Status: Online | v1.0.0[/]", { box: 'single', style: "dim" });

const sidebarTree = new Tree("Navigation");
sidebarTree.add("Dashboard");
sidebarTree.add("Analytics");
sidebarTree.add("Settings");
const sidebar = new Panel(sidebarTree, { title: "Menu", box: "round" });

const table = new Table({ title: "Recent Activity" });
table.addColumn("User");
table.addColumn("Action");
table.addColumn("Time");
table.addRow("Alice", "Login", "10:00 AM");
table.addRow("Bob", "Upload", "10:05 AM");
const content = new Panel(table, { title: "Main View", box: "round" });


// Construct the layout
// 1. We want a structure. 
// Root (Column) -> [Header, Body (Row), Footer]
layout.splitColumn(
    new Layout(header),
    new Layout(), // Body placeholder
    new Layout(footer)
);

// Get the body layout (index 1) and split it into Row
// Since we don't have direct access via index in public API easily, 
// let's build it bottom-up or keep references.

const bodyLayout = new Layout();
bodyLayout.splitRow(
    new Layout(sidebar), // Left
    new Layout(content)  // Right
);

// Re-do the root split with the constructed body
layout.splitColumn(
    new Layout(header),
    bodyLayout,
    new Layout(footer)
);

console.print(layout);
