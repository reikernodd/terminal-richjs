import { Console, Palette, Theme, Color, Panel, Table } from '../src';

const console = new Console();

// 1. Create a custom Brand Palette
const brandPalette = new Palette({
    primary: '#6200ea', // Deep Purple
    secondary: '#03dac6', // Teal
    background: '#121212',
    surface: '#1e1e1e',
    error: '#cf6679',
});

// 2. Create a Theme from it
const brandTheme = Theme.fromPalette(brandPalette);
const brandConsole = new Console({ theme: brandTheme });

console.print("[bold]1. Palette & Theme[/]");
brandConsole.print("This uses [primary]Brand Primary[/] and [secondary]Secondary[/].");
brandConsole.print("Semantic mapping: [danger]Danger[/] (mapped to error color automatically).");

// 3. Accessibility & Contrast
console.print("\n[bold]2. Accessibility Utils[/]\n");

const colors = ['#6200ea', '#03dac6', '#ffffff', '#000000', '#cf6679'];
const table = new Table({ title: "Contrast Checks" });
table.addColumn("Background");
table.addColumn("Text Color (Auto)");
table.addColumn("Sample");

for (const hex of colors) {
    const bg = new Color(hex);
    const text = bg.getContrastColor(); // Magically picks black or white
    
    // We construct a style string manually for the sample
    // Note: In real usage, you'd generate a style object.
    // Console markup doesn't support arbitrary hex in background easily via markup like [on #hex] unless we implemented it.
    // (We did implement #hex support in Style class, but MarkupParser might split on spaces)
    // Let's rely on Palette to name them or just demonstrate the logic.
    
    table.addRow(
        hex, 
        text.hex, 
        // We'll use a Panel to force the style if markup is tricky for arbitrary hex
        // Actually, let's just print the hex
        `[${text.hex} on ${hex}] READABLE TEXT [/]` 
    );
}

// Since our markup parser might not handle `on #hex` perfectly if it expects `on_hex` or similar,
// let's verify if `[#ffffff on #000000]` works. 
// Our updated Style.parse handles `on` followed by color. 
// `on #000000` -> parts: ["on", "#000000"]. Logic: `if (word === 'on') { backgroundColor = next }`.
// So `[#ffffff on #000000]` should work!

console.print(table);
