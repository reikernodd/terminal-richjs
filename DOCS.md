# RichJS Documentation

Comprehensive API documentation for RichJS - a TypeScript library for rich terminal output.

## Table of Contents

- [Console](#console)
- [Styling](#styling)
- [Renderables](#renderables)
  - [Text](#text)
  - [Panel](#panel)
  - [Table](#table)
  - [Tree](#tree)
  - [Syntax](#syntax)
  - [Progress Bar](#progress-bar)
- [Traceback](#traceback)
- [Themes](#themes)
- [Box Styles](#box-styles)

---

## Console

The `Console` class is the main entry point for rendering content to the terminal.

```typescript
import { Console } from 'terminal-richjs';

const console = new Console();
```

### Methods

#### `print(...objects: any[]): void`

Print one or more objects to the console. Strings are parsed for markup.

```typescript
console.print('Hello, [bold]World[/bold]!');
console.print(new Panel('Content'), new Table());
```

#### `log(...objects: any[]): void`

Alias for `print()`.

#### `render(renderable: Renderable): string`

Render a renderable object to a string without printing.

```typescript
const output = console.render(new Panel('Hello'));
```

### Properties

- `width: number` - Terminal width in columns

---

## Styling

RichJS supports rich markup syntax similar to Python Rich.

### Markup Syntax

```typescript
// Basic styles
'[bold]Bold text[/bold]';
'[italic]Italic text[/italic]';
'[underline]Underlined[/underline]';
'[dim]Dimmed text[/dim]';
'[strikethrough]Crossed out[/strikethrough]';

// Combined styles
'[bold italic red]Bold italic red[/bold italic red]';

// Short closing tag
'[bold]Bold[/]'; // Closes all open styles
```

### Color Formats

RichJS supports multiple color formats:

#### Named Colors

```typescript
// Standard colors
'[red]Red[/red]';
'[green]Green[/green]';
'[blue]Blue[/blue]';
'[yellow]Yellow[/yellow]';
'[magenta]Magenta[/magenta]';
'[cyan]Cyan[/cyan]';
'[white]White[/white]';
'[black]Black[/black]';

// Bright variants
'[bright_red]Bright red[/bright_red]';
'[bright_green]Bright green[/bright_green]';
'[bright_blue]Bright blue[/bright_blue]';
'[bright_yellow]Bright yellow[/bright_yellow]';
'[bright_magenta]Bright magenta[/bright_magenta]';
'[bright_cyan]Bright cyan[/bright_cyan]';
'[bright_white]Bright white[/bright_white]';
```

#### Hex Colors

```typescript
// 6-digit hex
'[#ff0000]Red[/#ff0000]';
'[#00ff00]Green[/#00ff00]';
'[#0000ff]Blue[/#0000ff]';

// 3-digit shorthand
'[#f00]Red[/#f00]';
'[#0f0]Green[/#0f0]';

// Popular theme colors
'[#ff79c6]Dracula Pink[/#ff79c6]';
'[#50fa7b]Dracula Green[/#50fa7b]';
'[#f92672]Monokai Pink[/#f92672]';
'[#a6e22e]Monokai Green[/#a6e22e]';
```

#### RGB Colors

```typescript
'[rgb(255,0,0)]Red[/rgb(255,0,0)]';
'[rgb(0,255,0)]Green[/rgb(0,255,0)]';
'[rgb(0,0,255)]Blue[/rgb(0,0,255)]';
```

#### 256-Color Palette

```typescript
'[color(196)]Color 196[/color(196)]';
'[color(46)]Color 46[/color(46)]';
'[color(21)]Color 21[/color(21)]';
```

#### Background Colors

Prefix any color format with `on` for background:

```typescript
'[on red]Red background[/on red]';
'[on #282a36]Hex background[/on #282a36]';
'[on rgb(40,42,54)]RGB background[/on rgb(40,42,54)]';
```

### Style Class

The `Style` class can be used programmatically:

```typescript
import { Style } from 'terminal-richjs';

// Parse from string
const style = Style.parse('bold red on white');

// Combine styles
const combined = style.combine(Style.parse('italic'));

// Check for null style
const nullStyle = Style.null();
```

---

## Renderables

### Text

Basic text rendering with markup support.

```typescript
import { Text } from 'terminal-richjs';

const text = new Text('Hello, [bold]World[/bold]!');
console.print(text);
```

---

### Panel

A bordered container for any content.

```typescript
import { Panel } from 'terminal-richjs';

const panel = new Panel('Content goes here', {
  title: 'Panel Title',
  titleAlign: 'left', // 'left' | 'center' | 'right'
  subtitle: 'Subtitle',
  subtitleAlign: 'right',
  box: 'rounded', // See Box Styles
  borderStyle: 'cyan',
  padding: 1, // number | [vertical, horizontal] | [top, right, bottom, left]
  expand: true, // Fill available width
});

console.print(panel);
```

#### Options

| Option          | Type                                                             | Default     | Description                         |
| --------------- | ---------------------------------------------------------------- | ----------- | ----------------------------------- |
| `title`         | `string`                                                         | -           | Title displayed in top border       |
| `titleAlign`    | `'left' \| 'center' \| 'right'`                                  | `'center'`  | Title alignment                     |
| `subtitle`      | `string`                                                         | -           | Subtitle displayed in bottom border |
| `subtitleAlign` | `'left' \| 'center' \| 'right'`                                  | `'center'`  | Subtitle alignment                  |
| `box`           | `BoxStyle`                                                       | `'rounded'` | Box drawing style                   |
| `borderStyle`   | `Style \| string`                                                | `'dim'`     | Border color/style                  |
| `padding`       | `number \| [number, number] \| [number, number, number, number]` | `1`         | Inner padding                       |
| `expand`        | `boolean`                                                        | `true`      | Expand to full width                |

#### Static Methods

```typescript
// Create a panel that fits its content
const fitted = Panel.fit('Content', { title: 'Fitted' });
```

---

### Table

Create formatted tables with headers, footers, and styling.

```typescript
import { Table } from 'terminal-richjs';

const table = new Table({
  title: 'My Table',
  box: 'rounded',
  rowStyles: ['', 'dim'], // Alternating row styles (zebra)
  showHeader: true,
  showFooter: false,
  showLines: false, // Show lines between rows
  caption: 'Table caption',
});

// Add columns
table.addColumn('Name', { justify: 'left', style: 'bold' });
table.addColumn('Age', { justify: 'right' });
table.addColumn('City', { justify: 'center' });

// Add rows
table.addRow('Alice', '30', 'New York');
table.addRow('Bob', '25', 'San Francisco');
table.addRow('Charlie', '35', 'Chicago');

// Optional footer
table.addFooter('Total', '3', '-');

console.print(table);
```

#### TableOptions

| Option         | Type              | Default        | Description                       |
| -------------- | ----------------- | -------------- | --------------------------------- |
| `title`        | `string`          | -              | Table title (above table)         |
| `caption`      | `string`          | -              | Table caption (below table)       |
| `box`          | `BoxStyle`        | `'rounded'`    | Box drawing style                 |
| `showHeader`   | `boolean`         | `true`         | Show header row                   |
| `showFooter`   | `boolean`         | `false`        | Show footer row                   |
| `showLines`    | `boolean`         | `false`        | Show separator lines between rows |
| `borderStyle`  | `Style \| string` | `'dim'`        | Border color/style                |
| `headerStyle`  | `Style \| string` | `'bold cyan'`  | Header row style                  |
| `footerStyle`  | `Style \| string` | `'bold'`       | Footer row style                  |
| `titleStyle`   | `Style \| string` | `'bold'`       | Title style                       |
| `captionStyle` | `Style \| string` | `'dim italic'` | Caption style                     |
| `rowStyles`    | `string[]`        | `[]`           | Alternating row styles            |
| `padding`      | `number`          | `1`            | Cell padding                      |

#### ColumnOptions

| Option        | Type                            | Default  | Description          |
| ------------- | ------------------------------- | -------- | -------------------- |
| `header`      | `string`                        | -        | Column header text   |
| `footer`      | `string`                        | -        | Column footer text   |
| `style`       | `Style \| string`               | -        | Column cell style    |
| `headerStyle` | `Style \| string`               | -        | Header cell style    |
| `justify`     | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment       |
| `width`       | `number`                        | -        | Fixed column width   |
| `minWidth`    | `number`                        | -        | Minimum column width |
| `maxWidth`    | `number`                        | -        | Maximum column width |

---

### Tree

Visualize hierarchical data structures.

```typescript
import { Tree } from 'terminal-richjs';

const tree = new Tree('📁 root', {
  guideStyle: '#6e7681 dim', // Color of guide lines
  hideRoot: false,
});

const folder1 = tree.add('📁 folder1');
folder1.add('📄 file1.txt');
folder1.add('📄 file2.txt');

const folder2 = tree.add('📁 folder2');
const subfolder = folder2.add('📁 subfolder');
subfolder.add('📄 file3.txt');

tree.add('📄 README.md');

console.print(tree);
```

**Output:**

```
📁 root
├── 📁 folder1
│   ├── 📄 file1.txt
│   └── 📄 file2.txt
├── 📁 folder2
│   └── 📁 subfolder
│       └── 📄 file3.txt
└── 📄 README.md
```

#### TreeOptions

| Option       | Type      | Default         | Description           |
| ------------ | --------- | --------------- | --------------------- |
| `guideStyle` | `string`  | `'#6e7681 dim'` | Style for guide lines |
| `hideRoot`   | `boolean` | `false`         | Hide the root node    |

#### Guide Styles

The tree supports different guide character sets:

- **standard** (default): `├── └── │`
- **bold**: `┣━━ ┗━━ ┃`
- **double**: `╠══ ╚══ ║`
- **ascii**: `|-- \`-- |`

---

### Syntax

Syntax-highlighted code with multiple themes.

```typescript
import { Syntax } from 'terminal-richjs';

const code = `function hello(name: string): void {
  console.log(\`Hello, \${name}!\`);
}`;

const syntax = new Syntax(code, 'typescript', {
  theme: 'monokai',
  lineNumbers: true,
  startLine: 1,
  highlightLines: [2], // Highlight specific lines
  wordWrap: false,
});

console.print(syntax);
```

#### Static Methods

```typescript
// Load from file
const syntax = Syntax.fromPath('./src/index.ts', {
  theme: 'dracula',
  lineNumbers: true,
});
```

#### SyntaxOptions

| Option           | Type       | Default     | Description                          |
| ---------------- | ---------- | ----------- | ------------------------------------ |
| `theme`          | `string`   | `'monokai'` | Syntax theme name                    |
| `lineNumbers`    | `boolean`  | `false`     | Show line numbers                    |
| `startLine`      | `number`   | `1`         | Starting line number                 |
| `highlightLines` | `number[]` | `[]`        | Lines to highlight (error indicator) |
| `wordWrap`       | `boolean`  | `false`     | Wrap long lines                      |

#### Available Themes

| Theme      | Description                    |
| ---------- | ------------------------------ |
| `monokai`  | Dark theme with vibrant colors |
| `dracula`  | Purple-tinted dark theme       |
| `github`   | Light theme matching GitHub    |
| `one-dark` | Atom One Dark theme            |

---

### Progress Bar

Visual progress indicators.

```typescript
import { ProgressBar, PercentageColumn, TimeElapsedColumn } from 'terminal-richjs';

// Simple progress bar
const bar = new ProgressBar(100, 75, {
  width: 40,
  completeStyle: '#61afef',
  finishedStyle: '#50fa7b bold',
  remainingStyle: '#3a3a3a dim',
  completeChar: '━',
  remainingChar: '━',
});

console.print(bar);

// Percentage column
const pct = new PercentageColumn(0.75); // 75%

// Time elapsed column
const elapsed = new TimeElapsedColumn(65000); // 1:05
```

#### ProgressBarOptions

| Option           | Type      | Default          | Description                     |
| ---------------- | --------- | ---------------- | ------------------------------- |
| `width`          | `number`  | `40`             | Bar width in characters         |
| `completeStyle`  | `string`  | `'#61afef'`      | Style for completed portion     |
| `finishedStyle`  | `string`  | `'#50fa7b bold'` | Style when 100% complete        |
| `remainingStyle` | `string`  | `'#3a3a3a dim'`  | Style for remaining portion     |
| `pulseStyle`     | `string`  | `'#98c379 bold'` | Style for pulse animation       |
| `pulse`          | `boolean` | `false`          | Enable pulse animation          |
| `completeChar`   | `string`  | `'━'`            | Character for completed portion |
| `remainingChar`  | `string`  | `'━'`            | Character for remaining portion |

---

## Traceback

Beautiful error tracebacks with syntax-highlighted code snippets.

```typescript
import { Traceback, installTracebackHandler } from 'terminal-richjs';

// Option 1: Install global handler
installTracebackHandler({
  theme: 'monokai',
  extraLines: 3,
  suppressInternal: true,
  maxFrames: 100,
});

// Option 2: Manual rendering
try {
  throw new Error('Something went wrong');
} catch (error) {
  const traceback = new Traceback(error as Error, {
    theme: 'dracula',
    extraLines: 2,
  });
  new Console().print(traceback);
}
```

#### TracebackOptions

| Option             | Type      | Default     | Description                                |
| ------------------ | --------- | ----------- | ------------------------------------------ |
| `showLocals`       | `boolean` | `false`     | Show local variables (not yet implemented) |
| `extraLines`       | `number`  | `3`         | Number of context lines around error       |
| `theme`            | `string`  | `'monokai'` | Syntax highlighting theme                  |
| `suppressInternal` | `boolean` | `true`      | Hide node_modules and internal frames      |
| `maxFrames`        | `number`  | `100`       | Maximum number of frames to show           |

---

## Themes

### Syntax Themes

```typescript
import { getTheme, MONOKAI, DRACULA, GITHUB_LIGHT, ONE_DARK } from 'terminal-richjs';

// Get theme by name
const theme = getTheme('monokai');

// Access theme directly
const { styles, baseStyle, lineNumberStyle } = MONOKAI;
```

### Creating Custom Themes

```typescript
import { type SyntaxTheme, Style } from 'terminal-richjs';

const myTheme: SyntaxTheme = {
  name: 'my-theme',
  baseStyle: Style.parse('#f8f8f2'),
  lineNumberStyle: Style.parse('#6e7681 dim'),
  styles: {
    keyword: Style.parse('#ff79c6 bold'),
    string: Style.parse('#f1fa8c'),
    comment: Style.parse('#6272a4 italic'),
    function: Style.parse('#50fa7b'),
    number: Style.parse('#bd93f9'),
    // ... more token types
  },
};
```

---

## Box Styles

RichJS supports multiple box drawing styles for panels and tables.

### Available Styles

| Style               | Corners | Description                 |
| ------------------- | ------- | --------------------------- |
| `rounded`           | `╭╮╰╯`  | Rounded corners (default)   |
| `single` / `square` | `┌┐└┘`  | Single line, square corners |
| `double`            | `╔╗╚╝`  | Double lines                |
| `heavy` / `bold`    | `┏┓┗┛`  | Heavy/bold lines            |
| `ascii`             | `++++`  | ASCII-safe characters       |
| `minimal`           | `    `  | No visible borders          |
| `simple`            | `────`  | Horizontal lines only       |
| `markdown`          | `\|---` | Markdown table style        |

### Usage

```typescript
import { Panel, Table, getBox, listBoxStyles } from 'terminal-richjs';

// Use in Panel
new Panel('Content', { box: 'rounded' });

// Use in Table
new Table({ box: 'double' });

// Get box characters directly
const box = getBox('heavy');
console.log(box.topLeft); // ┏

// List all available styles
const styles = listBoxStyles();
```

---

## Examples

### Full Demo

```bash
npx tsx examples/visual-polish-demo.ts
```

### Quick Examples

```typescript
import { Console, Panel, Table, Tree, Syntax, Traceback } from 'terminal-richjs';

const console = new Console();

// Styled text
console.print('[bold cyan]Welcome to RichJS![/bold cyan]');
console.print('[#ff79c6]Hex colors[/#ff79c6] and [rgb(80,250,123)]RGB[/rgb(80,250,123)] work too!');

// Panel with title
console.print(
  new Panel('Hello, World!', {
    title: 'Greeting',
    titleAlign: 'left',
    box: 'rounded',
  }),
);

// Simple table
const table = new Table({ box: 'rounded' });
table.addColumn('Name');
table.addColumn('Value');
table.addRow('foo', 'bar');
table.addRow('baz', 'qux');
console.print(table);

// File tree
const tree = new Tree('📁 src');
tree.add('📄 index.ts');
tree.add('📄 utils.ts');
console.print(tree);
```

---

## API Reference

### Exports

```typescript
// Core
export { Console } from './console/console';
export { Style } from './core/style';
export { Segment } from './core/segment';

// Renderables
export { Text } from './renderables/text';
export { Panel } from './renderables/panel';
export { Table } from './renderables/table';
export { Tree } from './renderables/tree';
export { Rule } from './renderables/rule';
export { Padding } from './renderables/padding';
export { Align } from './renderables/align';

// Syntax Highlighting
export { Syntax } from './syntax/syntax';
export { MONOKAI, DRACULA, GITHUB_LIGHT, ONE_DARK, getTheme } from './syntax/theme';

// Traceback
export { Traceback, installTracebackHandler } from './traceback/traceback';

// Progress
export {
  ProgressBar,
  PercentageColumn,
  TimeElapsedColumn,
  TimeRemainingColumn,
} from './progress/bar';
export { Progress } from './progress/progress';

// Utilities
export { getBox, listBoxStyles } from './utils/box';
export { inspect } from './utils/inspect';
```

---

## License

MIT
