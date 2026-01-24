/**
 * RichJS Visual Polish Demo
 * Demonstrates the new Rich-like features: syntax highlighting, tables, tracebacks, etc.
 */
/** biome-ignore-all assist/source/organizeImports: false */

import { Console, Panel, Table, Tree, Syntax, Traceback, ProgressBar } from '../src/index';

const console = new Console();

// ═══════════════════════════════════════════════════════════════════════════
// 1. SYNTAX HIGHLIGHTING DEMO
// ═══════════════════════════════════════════════════════════════════════════

console.print('\n[bold cyan]1. Syntax Highlighting with Token Colors[/bold cyan]\n');

const codeExample = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 fibonacci numbers
const results = Array.from({ length: 10 }, (_, i) => fibonacci(i));
console.log("Fibonacci:", results);`;

const syntax = new Syntax(codeExample, 'typescript', {
  theme: 'monokai',
  lineNumbers: true,
  highlightLines: [3], // Highlight the recursive line
});

console.print(
  new Panel(syntax, {
    title: 'TypeScript Example',
    titleAlign: 'left',
    subtitle: 'Fibonacci Implementation',
    box: 'rounded',
  }),
);

// ═══════════════════════════════════════════════════════════════════════════
// 2. TABLE WITH ZEBRA STRIPES
// ═══════════════════════════════════════════════════════════════════════════

console.print('\n[bold cyan]2. Table with Row Styles (Zebra Striping)[/bold cyan]\n');

const table = new Table({
  title: 'Star Wars Movies',
  box: 'rounded',
  rowStyles: ['', 'dim'], // Alternating rows
  showHeader: true,
  caption: 'Box office data (USD)',
});

table.addColumn('Date', { style: 'dim', justify: 'left' });
table.addColumn('Title', { justify: 'left' });
table.addColumn('Budget', { justify: 'right' });
table.addColumn('Box Office', { justify: 'right' });

table.addRow('Dec 20, 2019', 'Star Wars: The Rise of Skywalker', '$275,000,000', '$1,074,144,248');
table.addRow('May 25, 2018', '[red]Solo[/red]: A Star Wars Story', '$275,000,000', '$393,151,347');
table.addRow('Dec 15, 2017', 'Star Wars Ep. VIII: The Last Jedi', '$262,000,000', '$1,332,539,889');
table.addRow('Dec 16, 2016', 'Rogue One: A Star Wars Story', '$200,000,000', '$1,056,057,273');
table.addRow(
  'Dec 18, 2015',
  'Star Wars Ep. VII: The Force Awakens',
  '$245,000,000',
  '$2,068,223,624',
);

console.print(table);

// ═══════════════════════════════════════════════════════════════════════════
// 3. TREE WITH NESTED RENDERABLES
// ═══════════════════════════════════════════════════════════════════════════

console.print('\n[bold cyan]3. Tree Structure[/bold cyan]\n');

const tree = new Tree('[bold magenta]📁 richjs[/bold magenta]');

const srcNode = tree.add('📁 src');
srcNode.add('📄 index.ts');
srcNode.add('📁 core').add('📄 style.ts');
srcNode.add('📁 renderables').add('📄 table.ts');

tree.add('📄 package.json');
tree.add('📄 README.md');

console.print(tree);

// ═══════════════════════════════════════════════════════════════════════════
// 4. PROGRESS BAR VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

console.print('\n[bold cyan]4. Progress Bars[/bold cyan]\n');

console.print('  Processing: ');
const bar1 = new ProgressBar(100, 75);
console.print(bar1);

console.print('  Completed:  ');
const bar2 = new ProgressBar(100, 100, { finishedStyle: '#50fa7b bold' });
console.print(bar2);

console.print('  Starting:   ');
const bar3 = new ProgressBar(100, 15, { completeStyle: '#e5c07b' });
console.print(bar3);

// ═══════════════════════════════════════════════════════════════════════════
// 5. PANEL WITH TITLE ALIGNMENT
// ═══════════════════════════════════════════════════════════════════════════

console.print('\n[bold cyan]5. Panels with Title Alignment[/bold cyan]\n');

console.print(
  new Panel('[green]✓ Deployment completed successfully![/green]', {
    title: 'SUCCESS',
    titleAlign: 'left',
    box: 'rounded',
    borderStyle: 'green',
  }),
);

console.print(
  new Panel('[red]✗ Connection timeout after 30 seconds[/red]', {
    title: 'ERROR',
    titleAlign: 'left',
    subtitle: 'retry in 5s...',
    subtitleAlign: 'right',
    box: 'rounded',
    borderStyle: 'red',
  }),
);

// ═══════════════════════════════════════════════════════════════════════════
// 6. STYLED TEXT WITH HEX COLORS
// ═══════════════════════════════════════════════════════════════════════════

console.print('\n[bold cyan]6. Hex and RGB Colors[/bold cyan]\n');

console.print(
  '  [#ff79c6]Dracula Pink[/#ff79c6] | [#50fa7b]Dracula Green[/#50fa7b] | [#bd93f9]Dracula Purple[/#bd93f9]',
);
console.print(
  '  [#f92672]Monokai Pink[/#f92672] | [#a6e22e]Monokai Green[/#a6e22e] | [#66d9ef]Monokai Cyan[/#66d9ef]',
);

// ═══════════════════════════════════════════════════════════════════════════
// 7. TRACEBACK DEMO (simulated)
// ═══════════════════════════════════════════════════════════════════════════

console.print('\n[bold cyan]7. Rich Traceback (simulated)[/bold cyan]\n');

// Create a sample error for demonstration
try {
  throw new Error('Division by zero');
} catch (error) {
  const traceback = new Traceback(error as Error, {
    theme: 'monokai',
    extraLines: 2,
    suppressInternal: true,
  });
  console.print(traceback);
}

console.print('\n[dim]Demo complete! ✨[/dim]\n');
