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

Contributions are welcome! Please read our contributing guide.

## 📄 License

MIT
