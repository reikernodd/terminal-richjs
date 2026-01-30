# terminal-richjs

**terminal-richjs** is a TypeScript library for writing rich text (with color and style) to the terminal, and for displaying advanced content such as tables, markdown, and syntax highlighted code. It is heavily inspired by the popular [Python Rich](https://github.com/Textualize/rich) library.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)

## 📦 Installation

```bash
npm install terminal-richjs
# or
yarn add terminal-richjs
# or
pnpm add terminal-richjs
```

## 🚀 Quick Start

```typescript
import { Console, replaceEmoji } from 'terminal-richjs';

const console = new Console();

console.print('Hello, [bold magenta]World[/bold magenta]!');
console.print(replaceEmoji('RichJS supports emojis :rocket: and styles :sparkles:'));
```

## ✨ Features

| Feature                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| **Rich Text**           | Parse markup for color and style (`[red]bold[/red]`)          |
| **Emoji Shortcodes**    | 174 emojis like `:rocket:` → 🚀, `:heart:` → ❤️               |
| **JSON Rendering**      | Pretty-printed, syntax-highlighted JSON output                |
| **Columns Layout**      | Responsive multi-column displays                              |
| **Spinners**            | 45 animated spinner styles (dots, stars, moon, hearts...)     |
| **Live Display**        | Real-time terminal updates                                    |
| **Status Indicator**    | Animated spinners with messages                               |
| **Syntax Highlighting** | Token-based highlighting (Monokai, Dracula, GitHub, One Dark) |
| **Tables**              | Auto-formatting with headers, footers, zebra striping         |
| **Progress Bars**       | Multi-bar progress with gradient colors                       |
| **Panels**              | Bordered containers with titles and subtitles                 |
| **Tree Views**          | Hierarchical data with customizable guide styles              |
| **Tracebacks**          | Beautiful error traces with code snippets                     |
| **Markdown**            | Render Markdown files to the terminal                         |
| **Layouts**             | Split terminal into flexible grids                            |
| **Logging**             | Formatted log output with `RichHandler`                       |

---

## 🎯 Emoji Shortcodes

```typescript
import { replaceEmoji, EMOJI, listEmoji } from 'terminal-richjs';

// Replace shortcodes in text
console.log(replaceEmoji('Hello :wave: World :rocket:'));
// Output: Hello 👋 World 🚀

// Access emoji directly
console.log(EMOJI['fire']); // 🔥
console.log(EMOJI['heart']); // ❤️

// List all available emojis (174 total)
console.log(listEmoji().slice(0, 10));
// ['rocket', 'star', 'fire', 'heart', 'check', 'warning', ...]
```

**Popular shortcodes:** `:rocket:` 🚀, `:fire:` 🔥, `:heart:` ❤️, `:star:` ⭐, `:check:` ✅, `:warning:` ⚠️, `:sparkles:` ✨, `:party:` 🎉, `:coffee:` ☕, `:bug:` 🐛

---

## 📋 JSON Pretty Printing

```typescript
import { Console, JSON, Panel } from 'terminal-richjs';

const data = {
  name: 'terminal-richjs',
  version: '0.2.0',
  features: ['emoji', 'json', 'columns', 'spinners'],
  config: { theme: 'dracula', colors: true },
};

new Console().print(
  new Panel(JSON.fromData(data, { sortKeys: true }), { title: 'package.json', box: 'rounded' }),
);
```

Options: `indent`, `sortKeys`, `highlight`

---

## 🎨 Columns Layout

```typescript
import { Console, Columns } from 'terminal-richjs';

const files = [
  '📁 src',
  '📁 dist',
  '📁 node_modules',
  '📄 package.json',
  '📄 tsconfig.json',
  '📄 README.md',
  '📄 LICENSE',
  '📁 examples',
];

new Console().print(new Columns(files, { padding: 2, equal: true }));
```

**Output:**

```
📁 src            📁 dist           📁 node_modules
📄 package.json   📄 tsconfig.json  📄 README.md
📄 LICENSE        📁 examples
```

Options: `width`, `padding`, `equal`, `columnFirst`, `rightToLeft`

---

## ⚙️ Spinners (45 Styles)

```typescript
import { Spinner, listSpinners, Status, sleep } from 'terminal-richjs';

// Create a spinner
const spinner = new Spinner('dots', { text: 'Loading...', style: 'green' });
console.log(spinner.getCurrentFrame());

// Available spinners
console.log(listSpinners());
// ['dots', 'dots2', 'line', 'star', 'moon', 'hearts', 'clock', 'earth', ...]

// Status indicator (animated)
const status = new Status('Processing...', { spinnerName: 'dots' });
status.start();
await sleep(2000);
status.update('Almost done...');
await sleep(1000);
status.stop();
```

---

## ⚡ Live Display

```typescript
import { Live, sleep, Style, replaceEmoji } from 'terminal-richjs';

const live = new Live();

await live.start(async (update) => {
  for (let i = 0; i <= 100; i++) {
    const filled = Math.floor(i / 5);
    const remaining = 20 - filled;
    const bar =
      Style.parse('#50fa7b').apply('━'.repeat(filled)) +
      Style.parse('#3a3a3a dim').apply('━'.repeat(remaining));

    update(replaceEmoji(`:rocket: Processing... ${bar} ${i}%`));
    await sleep(50);
  }
});
```

---

## 🎨 Color Support

```typescript
// Named colors
console.print('[red]Red text[/red]');
console.print('[bright_cyan]Bright cyan[/bright_cyan]');

// Hex colors
console.print('[#ff79c6]Dracula Pink[/#ff79c6]');

// RGB colors
console.print('[rgb(255,121,198)]Custom RGB[/rgb(255,121,198)]');

// 256-color palette
console.print('[color(196)]256-color red[/color(196)]');

// Background colors
console.print('[on #282a36]Dark background[/on #282a36]');
```

---

## 📊 Tables

```typescript
import { Console, Table } from 'terminal-richjs';

const table = new Table({
  title: 'Star Wars Movies',
  box: 'rounded',
  rowStyles: ['', 'dim'], // Zebra striping
});

table.addColumn('Released', { justify: 'left' });
table.addColumn('Title', { justify: 'left' });
table.addColumn('Box Office', { justify: 'right' });

table.addRow('1977', 'A New Hope', '$775,398,007');
table.addRow('1980', 'The Empire Strikes Back', '$538,375,067');
table.addRow('2015', 'The Force Awakens', '$2,068,223,624');

new Console().print(table);
```

---

## 💻 Syntax Highlighting

```typescript
import { Console, Syntax, Panel } from 'terminal-richjs';

const code = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

const syntax = new Syntax(code, 'typescript', {
  theme: 'monokai',
  lineNumbers: true,
  highlightLines: [3],
});

new Console().print(new Panel(syntax, { title: 'Fibonacci' }));
```

**Themes:** `monokai`, `dracula`, `github`, `one-dark`

---

## 🌳 Tree Views

```typescript
import { Console, Tree } from 'terminal-richjs';

const tree = new Tree('📁 project');
const src = tree.add('📁 src');
src.add('📄 index.ts');
src.add('📄 utils.ts');
tree.add('📄 package.json');

new Console().print(tree);
```

**Output:**

```
📁 project
├── 📁 src
│   ├── 📄 index.ts
│   └── 📄 utils.ts
└── 📄 package.json
```

---

## 📦 Panels

```typescript
import { Console, Panel } from 'terminal-richjs';

new Console().print(
  new Panel('Hello, World!', {
    title: 'Greeting',
    titleAlign: 'left',
    subtitle: 'A simple example',
    box: 'rounded',
    borderStyle: 'cyan',
  }),
);
```

---

## 🚨 Tracebacks

```typescript
import { installTracebackHandler, Console, Traceback } from 'terminal-richjs';

// Install globally
installTracebackHandler({ theme: 'monokai', extraLines: 3 });

// Or render manually
try {
  throw new Error('Something went wrong');
} catch (error) {
  new Console().print(new Traceback(error));
}
```

---

# RichJS CLI

**RichJS CLI** is a command line toolbox for fancy output in the terminal. Use the `richjs` command to syntax highlight code, render markdown, display JSON with pretty formatting, and more — directly from the command line.

## Installation

RichJS CLI is included when you install the `terminal-richjs` package:

```bash
npm install terminal-richjs
# or
npx richjs --help
```

For global installation:

```bash
npm install -g terminal-richjs
richjs --help
```

## Usage

### Syntax Highlighting

To syntax highlight a file, enter `richjs` followed by a path. Many languages are supported:

```bash
richjs src/index.ts
```

Add the `--line-numbers` or `-n` switch to enable line numbers:

```bash
richjs src/index.ts -n
```

You can specify a theme with `--theme`:

```bash
richjs src/index.ts --theme dracula
```

**Available themes:** `monokai` (default), `dracula`, `github-light`, `onedark`

If you want to override the auto-detected lexer, you can explicitly set it with `--lexer` or `-x`:

```bash
richjs myfile.txt -x javascript
```

### Markdown

You can render markdown by adding the `--markdown` or `-m` switch. If the file ends with `.md`, markdown will be auto-detected:

```bash
richjs README.md
# or explicitly
richjs README.md -m
```

### JSON

You can request JSON pretty formatting and highlighting with the `--json` or `-J` switches. If the file ends with `.json`, JSON will be auto-detected:

```bash
richjs package.json
# or explicitly
richjs data.json -J
```

### Console Markup

You can print rich markup strings directly from the command line using the `--print` or `-p` flag:

```bash
richjs "Hello [bold green]World[/bold green]!" -p
echo "Status: [red]Error[/red]" | richjs - -p
```

### Reading from stdin

Use `-` as the filename to read from standard input:

```bash
cat myfile.js | richjs - -s
echo '{"name":"RichJS"}' | richjs - -J
```

### Layout Options

Wrap output in a panel with the `--panel` or `-a` option:

```bash
richjs README.md -m --panel rounded --title "Documentation"
```

**Available box styles:** `rounded`, `heavy`, `double`, `square`, `horizontal`, `simple`, etc.

Add padding around content with `--padding` or `-d`:

```bash
richjs package.json -J --padding 2
richjs data.json -J --padding "1,2,1,2"  # top,right,bottom,left
```

Set alignment with `--left`, `--center` (`-c`), or `--right` (`-r`):

```bash
richjs package.json -J --panel heavy --title "Config" --center
```

Set output width with `--width` or `-w`:

```bash
richjs README.md -m --width 80
```

Apply custom styles to panel borders:

```bash
richjs data.json -J --panel rounded --style "cyan"
```

### CLI Options Summary

```
Usage: richjs [options] [resource]

Arguments:
  resource                 Path to file, URL, or text to render (use "-" for stdin)

Options:
  -v, --version           Display version
  -h, --help              Display help

Rendering Modes:
  -p, --print             Print console markup
  -m, --markdown          Render as markdown
  -J, --json              Render as JSON
  -s, --syntax            Force syntax highlighting

Syntax Options:
  -n, --line-numbers      Show line numbers
  --theme <name>          Syntax theme (monokai, dracula, github-light, onedark)
  -x, --lexer <name>      Specify lexer for syntax highlighting

Layout Options:
  -a, --panel <box>       Wrap output in a panel with box style
  --title <text>          Set panel title
  --caption <text>        Set panel caption
  -w, --width <size>      Set output width
  -l, --left              Align output to left
  -c, --center            Align output to center
  -r, --right             Align output to right
  -d, --padding <padding> Add padding (1, 2, or 4 comma-separated values)
  -S, --style <style>     Apply style to output
```

### CLI Examples

```bash
# Syntax highlight with line numbers and custom theme
richjs src/app.ts -n --theme dracula

# Render markdown with width constraint
richjs README.md -m -w 80

# JSON with panel and centered alignment
richjs package.json -J --panel heavy --title "Package" -c

# Multiple layout options
richjs data.json -J --panel rounded --title "Data" --padding 2 --style "cyan"

# Pipe content from other commands
cat config.json | richjs - -J --panel rounded
echo "[bold]Hello[/bold] [red]World[/red]" | richjs - -p
```

---

## 🎯 Examples

Run the demos:

```bash
# New features demo (Emoji, JSON, Columns, Spinners, Live)
npx tsx examples/new-features-demo.ts

# Full visual demo
npx tsx examples/visual-polish-demo.ts
```

---

## 📚 API Reference

### Core Exports

```typescript
import {
  // Core
  Console,
  Style,
  Segment,
  MarkupParser,

  // Renderables
  Panel,
  Table,
  Tree,
  Rule,
  Text,
  Padding,
  Align,
  Columns,
  JSON,
  Syntax,
  Markdown,

  // Progress & Status
  Progress,
  ProgressBar,
  Spinner,
  Status,
  Live,
  sleep,

  // Emoji
  replaceEmoji,
  EMOJI,
  listEmoji,
  hasEmoji,

  // Spinners
  SPINNERS,
  listSpinners,
  getSpinner,

  // Themes
  Theme,
  MONOKAI,
  DRACULA,
  GITHUB_LIGHT,
  ONE_DARK,

  // Utilities
  Color,
  getBox,
  listBoxStyles,

  // Error handling
  Traceback,
  installTracebackHandler,

  // Logging
  RichHandler,
  Logger,
} from 'terminal-richjs';
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development workflow, and how to submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
