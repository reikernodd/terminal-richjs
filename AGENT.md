# AGENT.md - RichJS Implementation Guide

## Project Context

You are implementing **RichJS**, a TypeScript library that brings Python's Rich terminal rendering capabilities to Node.js. This library provides beautiful, structured console output including styled text, tables, progress bars, syntax highlighting, markdown rendering, and more.

### Target Developer
- **Primary Language**: JavaScript/TypeScript (Next.js developer)
- **Environment**: Kali Linux (KDE Plasma)
- **Coding Style**: Modern TypeScript with clear, maintainable code

### Project Goals
1. Create a comprehensive terminal rendering library for Node.js
2. Match Python Rich's functionality with JavaScript-idiomatic APIs
3. Full TypeScript support with excellent type safety
4. Modular architecture allowing tree-shaking
5. Leverage existing npm packages where appropriate

---

## Implementation Phases

### Phase 1: Foundation (CURRENT PHASE)
**Goal**: Set up project infrastructure and core rendering primitives

### Phase 2: Core Renderables
**Goal**: Implement basic UI components (text, panels, tables)

### Phase 3: Progress & Status
**Goal**: Add progress bars, spinners, and live updates

### Phase 4: Advanced Features
**Goal**: Syntax highlighting, markdown, tree structures

### Phase 5: Logging & Utilities
**Goal**: Logging integration, object inspection

### Phase 6: Polish & Testing
**Goal**: Complete test coverage, documentation, publish to npm

---

## Current Phase Tasks

### PHASE 1: Foundation Setup

#### Task 1.1: Initialize Project Structure

```bash
# Create project directory
mkdir richjs && cd richjs

# Initialize npm project
npm init -y

# Install TypeScript and build tools
npm install -D typescript @types/node tsup vitest tsx eslint prettier

# Install core dependencies
npm install chalk@5 terminal-size@4 string-width@7 strip-ansi@7 ansi-escapes@6 wrap-ansi@9

# Initialize TypeScript
npx tsc --init
```

**Create this exact folder structure:**

```
richjs/
├── src/
│   ├── index.ts
│   ├── console/
│   ├── core/
│   ├── terminal/
│   ├── renderables/
│   ├── types/
│   └── utils/
├── tests/
│   ├── unit/
│   └── fixtures/
├── examples/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── README.md
```

#### Task 1.2: Configure TypeScript

**File: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### Task 1.3: Configure Build Tool

**File: `tsup.config.ts`**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    logging: 'src/logging/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  external: [
    'chalk',
    'terminal-size',
    'string-width',
    'strip-ansi',
    'ansi-escapes',
    'wrap-ansi'
  ],
});
```

#### Task 1.4: Configure Testing

**File: `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
    },
  },
});
```

#### Task 1.5: Update package.json

**File: `package.json`**

```json
{
  "name": "richjs",
  "version": "0.1.0",
  "description": "Rich terminal rendering for Node.js - inspired by Python's Rich",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.cjs",
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./logging": {
      "require": "./dist/logging.cjs",
      "import": "./dist/logging.js",
      "types": "./dist/logging.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write 'src/**/*.ts'",
    "typecheck": "tsc --noEmit",
    "example": "tsx examples"
  },
  "keywords": [
    "terminal",
    "console",
    "cli",
    "rich",
    "formatting",
    "colors",
    "table",
    "progress",
    "syntax-highlighting"
  ],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Core Implementation Guidelines

### Code Style Requirements

1. **Use TypeScript strictly**
   - Enable all strict mode flags
   - No `any` types (use `unknown` if needed)
   - Provide comprehensive JSDoc comments
   - Export all public types

2. **Naming Conventions**
   - Classes: PascalCase (e.g., `Console`, `Style`, `Table`)
   - Interfaces: PascalCase (e.g., `Renderable`, `ConsoleOptions`)
   - Functions/methods: camelCase (e.g., `print`, `addColumn`)
   - Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_WIDTH`)
   - Private members: prefix with `_` (e.g., `_buffer`)

3. **File Organization**
   - One class per file (except small helper types)
   - Index files for public exports
   - Types in separate `types/` directory when shared

4. **Error Handling**
   - Throw descriptive errors with Error classes
   - Validate input parameters
   - Provide helpful error messages

5. **Documentation**
   - JSDoc for all public APIs
   - Include `@example` blocks
   - Document parameters and return types
   - Add `@throws` for error conditions

### Example Code Pattern

```typescript
/**
 * Represents a styled segment of text for terminal output.
 * 
 * @example
 * ```typescript
 * const segment = new Segment("Hello", new Style({ color: "red", bold: true }));
 * console.log(segment.render());
 * ```
 */
export class Segment {
  /**
   * Creates a new text segment.
   * 
   * @param text - The text content
   * @param style - The style to apply
   * @param isControl - Whether this is a control sequence
   * @throws {TypeError} If text is not a string
   */
  constructor(
    public readonly text: string,
    public readonly style: Style = Style.null(),
    public readonly isControl: boolean = false
  ) {
    if (typeof text !== 'string') {
      throw new TypeError('Segment text must be a string');
    }
  }

  /**
   * Renders the segment with ANSI codes.
   * 
   * @returns The styled text with ANSI escape codes
   */
  render(): string {
    if (this.isControl) {
      return this.text;
    }
    return this.style.render(this.text);
  }
}
```

---

## Implementation Sequence

### Step 1: Core Types and Interfaces

**File: `src/types/renderable.ts`**

Create the foundational interfaces that all components will implement.

```typescript
/**
 * Result of rendering a Renderable object.
 */
export interface RenderResult {
  /** The rendered text segments */
  segments: Segment[];
  /** The width in characters */
  width: number;
  /** The height in lines */
  height: number;
}

/**
 * Protocol for objects that can be rendered to the console.
 */
export interface Renderable {
  /**
   * Renders the object to segments.
   * 
   * @param console - The console instance
   * @param options - Rendering options
   * @returns The render result
   */
  __rich_console__(
    console: Console,
    options: ConsoleOptions
  ): RenderResult;
}

/**
 * Type guard to check if an object is renderable.
 */
export function isRenderable(obj: unknown): obj is Renderable {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '__rich_console__' in obj &&
    typeof obj.__rich_console__ === 'function'
  );
}
```

**File: `src/types/style-types.ts`**

```typescript
export type ColorType = 
  | 'black' | 'red' | 'green' | 'yellow'
  | 'blue' | 'magenta' | 'cyan' | 'white'
  | 'bright_black' | 'bright_red' | 'bright_green' | 'bright_yellow'
  | 'bright_blue' | 'bright_magenta' | 'bright_cyan' | 'bright_white';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type Color = ColorType | RGB | string;

export interface StyleOptions {
  color?: Color;
  backgroundColor?: Color;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dim?: boolean;
  reverse?: boolean;
  blink?: boolean;
  hidden?: boolean;
}
```

### Step 2: Implement Core Classes

**File: `src/core/style.ts`**

Implement the Style class that handles all text styling.

**Requirements:**
- Parse style strings like "bold red on blue"
- Support RGB colors via `rgb(255, 0, 0)` syntax
- Combine styles (merge multiple Style objects)
- Render text with ANSI codes using chalk
- Implement null style (no formatting)

**Key Methods:**
```typescript
class Style {
  static parse(styleString: string): Style;
  static null(): Style;
  combine(other: Style): Style;
  render(text: string): string;
}
```

**File: `src/core/segment.ts`**

Implement the Segment class (minimal text unit with style).

**File: `src/terminal/terminal.ts`**

Detect terminal capabilities.

**Requirements:**
- Detect color support (standard, 256, truecolor)
- Get terminal dimensions using terminal-size
- Detect if output is a TTY
- Handle Windows legacy console

**File: `src/console/console.ts`**

The main Console class - this is the core API.

**Requirements:**
- Constructor accepts ConsoleOptions
- `print(...objects)` method
- `render(renderable)` method
- Track terminal width/height
- Handle markup parsing
- Word wrapping support

### Step 3: Implement Markup Parser

**File: `src/core/markup.ts`**

Parse Rich markup syntax like `[bold red]text[/bold red]`.

**Requirements:**
- Support nested tags
- Parse style attributes
- Convert to Segment array
- Handle escaping with `\[`
- Validate tag matching

**Example:**
```typescript
const parser = new MarkupParser();
const segments = parser.parse("[bold]Hello[/bold] [red]World[/red]");
// Returns: [
//   { text: "Hello", style: Style({ bold: true }) },
//   { text: " ", style: Style.null() },
//   { text: "World", style: Style({ color: "red" }) }
// ]
```

### Step 4: Basic Text Rendering

**File: `src/renderables/text.ts`**

Implement the Text renderable.

**Requirements:**
- Support alignment (left, center, right, justify)
- Word wrapping
- Overflow handling (crop, ellipsis, fold)
- No-wrap option

### Step 5: Write Tests

For each component, write comprehensive tests.

**File: `tests/unit/style.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { Style } from '../../src/core/style';

describe('Style', () => {
  describe('parse', () => {
    it('should parse simple color', () => {
      const style = Style.parse('red');
      expect(style.color).toBe('red');
    });

    it('should parse bold modifier', () => {
      const style = Style.parse('bold');
      expect(style.bold).toBe(true);
    });

    it('should parse combined styles', () => {
      const style = Style.parse('bold red');
      expect(style.bold).toBe(true);
      expect(style.color).toBe('red');
    });

    it('should parse background color', () => {
      const style = Style.parse('red on blue');
      expect(style.color).toBe('red');
      expect(style.backgroundColor).toBe('blue');
    });
  });

  describe('combine', () => {
    it('should merge two styles', () => {
      const s1 = new Style({ bold: true });
      const s2 = new Style({ color: 'red' });
      const combined = s1.combine(s2);
      
      expect(combined.bold).toBe(true);
      expect(combined.color).toBe('red');
    });

    it('should override conflicting properties', () => {
      const s1 = new Style({ color: 'red' });
      const s2 = new Style({ color: 'blue' });
      const combined = s1.combine(s2);
      
      expect(combined.color).toBe('blue');
    });
  });
});
```

### Step 6: Create Examples

**File: `examples/01-basic-print.ts`**

```typescript
import { Console } from '../src';

const console = new Console();

console.print("Hello, World!");
console.print("Hello, [bold magenta]World[/bold magenta]!");
console.print("Multiple", "arguments", "work", "too!");
```

Run with: `npm run example 01-basic-print.ts`

---

## Testing Checklist

Before moving to the next phase, ensure:

- [ ] All TypeScript compiles without errors (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] Code coverage > 80% for core modules
- [ ] Examples run without errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Build succeeds (`npm run build`)
- [ ] Generated `.d.ts` files are valid

---

## Common Patterns to Follow

### 1. Immutable Objects

Prefer immutable objects for styles and configurations:

```typescript
class Style {
  // Store as readonly
  readonly color?: Color;
  readonly bold?: boolean;
  
  // Return new instances on modification
  combine(other: Style): Style {
    return new Style({
      ...this,
      ...other
    });
  }
}
```

### 2. Fluent Interfaces (Method Chaining)

Allow chaining where it makes sense:

```typescript
class Table {
  addColumn(name: string, options?: ColumnOptions): this {
    this.columns.push(new Column(name, options));
    return this;
  }
  
  addRow(...values: any[]): this {
    this.rows.push(values);
    return this;
  }
}

// Usage:
table
  .addColumn("Name")
  .addColumn("Age")
  .addRow("Alice", 30)
  .addRow("Bob", 25);
```

### 3. Options Objects

Use options objects for flexibility:

```typescript
interface ConsoleOptions {
  width?: number;
  height?: number;
  colorSystem?: ColorSystem;
  theme?: Theme;
  forceTerminal?: boolean;
}

class Console {
  constructor(options: ConsoleOptions = {}) {
    this.width = options.width ?? this.detectWidth();
    this.height = options.height ?? this.detectHeight();
    // ...
  }
}
```

### 4. Factory Methods

Provide convenient factory methods:

```typescript
class Style {
  static parse(str: string): Style {
    // Parse and return new Style
  }
  
  static null(): Style {
    return new Style({});
  }
  
  static bold(): Style {
    return new Style({ bold: true });
  }
}
```

---

## Error Handling Patterns

### Input Validation

```typescript
class Table {
  addRow(...values: any[]): this {
    if (values.length !== this.columns.length) {
      throw new Error(
        `Row has ${values.length} values but table has ${this.columns.length} columns`
      );
    }
    this.rows.push(values);
    return this;
  }
}
```

### Type Guards

```typescript
function isRGB(color: unknown): color is RGB {
  return (
    typeof color === 'object' &&
    color !== null &&
    'r' in color &&
    'g' in color &&
    'b' in color
  );
}
```

---

## Dependencies Reference

### When to Use Each Dependency

**chalk** - ANSI color/style rendering
```typescript
import chalk from 'chalk';
const styled = chalk.bold.red('Error');
```

**terminal-size** - Get terminal dimensions
```typescript
import terminalSize from 'terminal-size';
const { columns, rows } = terminalSize();
```

**string-width** - Accurate character width (handles emoji, double-width chars)
```typescript
import stringWidth from 'string-width';
const width = stringWidth('Hello 🌍'); // Returns 7, not 8
```

**strip-ansi** - Remove ANSI codes from strings
```typescript
import stripAnsi from 'strip-ansi';
const plain = stripAnsi('\x1b[31mRed\x1b[0m'); // Returns "Red"
```

**wrap-ansi** - Word wrap with ANSI code support
```typescript
import wrapAnsi from 'wrap-ansi';
const wrapped = wrapAnsi(longText, 80);
```

**ansi-escapes** - ANSI escape sequences
```typescript
import ansiEscapes from 'ansi-escapes';
process.stdout.write(ansiEscapes.clearScreen);
```

---

## Quality Gates

Before committing any phase:

1. **Code Quality**
   - No TypeScript errors
   - No linter warnings
   - All functions documented
   - No `any` types

2. **Testing**
   - All tests pass
   - Coverage > 80%
   - Edge cases covered
   - Integration tests for complex features

3. **Examples**
   - Each feature has an example
   - Examples are documented
   - Examples run successfully

4. **Documentation**
   - JSDoc on all public APIs
   - README updated
   - CHANGELOG updated

---

## Next Phase Trigger

Move to **Phase 2: Core Renderables** when:

- [ ] Console class fully implemented
- [ ] Style system working
- [ ] Markup parser complete
- [ ] Basic text rendering works
- [ ] Terminal detection functional
- [ ] All Phase 1 tests passing
- [ ] At least 2 working examples

---

## Reference Implementation Hints

### Console.print() Implementation Hint

```typescript
print(...objects: any[], options?: PrintOptions): void {
  // 1. Convert objects to strings
  const strings = objects.map(obj => {
    if (typeof obj === 'string') return obj;
    if (isRenderable(obj)) return this.render(obj);
    return JSON.stringify(obj);
  });
  
  // 2. Join with separator
  const text = strings.join(options?.separator ?? ' ');
  
  // 3. Parse markup
  const segments = this.parseMarkup(text);
  
  // 4. Apply word wrapping if needed
  const wrapped = this.wrapSegments(segments, this.width);
  
  // 5. Render to ANSI
  const output = wrapped.map(seg => seg.render()).join('');
  
  // 6. Write to output
  this.write(output + '\n');
}
```

### Style.render() Implementation Hint

```typescript
render(text: string): string {
  let result = chalk;
  
  if (this.bold) result = result.bold;
  if (this.italic) result = result.italic;
  if (this.underline) result = result.underline;
  if (this.dim) result = result.dim;
  
  if (this.color) {
    if (typeof this.color === 'string') {
      result = result[this.color];
    } else if (isRGB(this.color)) {
      result = result.rgb(this.color.r, this.color.g, this.color.b);
    }
  }
  
  if (this.backgroundColor) {
    // Similar logic for background
  }
  
  return result(text);
}
```

---

## Communication Protocol

### When Asking for Clarification

Ask about:
- Ambiguous requirements
- Design decisions with tradeoffs
- Missing specifications
- Performance vs. readability tradeoffs

Don't ask about:
- Standard TypeScript patterns
- Common npm package usage
- File organization (follow the structure above)
- Naming conventions (follow the guidelines above)

### Progress Reporting

After completing each major component, report:
1. What was implemented
2. Test coverage achieved
3. Any deviations from the plan
4. Blockers or concerns
5. Ready for next task confirmation

---

## Emergency Procedures

### If You Get Stuck

1. **Check the plan** - Re-read relevant sections
2. **Review examples** - Look at similar implementations
3. **Simplify** - Implement a minimal version first
4. **Ask** - Request clarification with specific context

### If Dependencies Don't Work

1. Check version compatibility
2. Look for alternative packages
3. Consider implementing from scratch (for simple utilities)
4. Document the issue and ask for guidance

---

## Success Criteria

**Phase 1 Complete When:**
- Project builds successfully
- Console can print basic text
- Style system works with colors and formatting
- Markup parser handles nested tags
- Terminal detection works
- Test suite passes with >80% coverage
- 3+ working examples

**Ready for Production When:**
- All 6 phases complete
- Full test coverage (>90%)
- Documentation complete
- Performance benchmarked
- Published to npm
- CI/CD pipeline working

---

## Quick Command Reference

```bash
# Development
npm run dev              # Watch mode build
npm run build            # Production build
npm run typecheck        # Check types
npm run lint             # Lint code
npm run format           # Format code

# Testing
npm test                 # Run tests
npm run test:ui          # Test with UI
npm run test:coverage    # Coverage report

# Examples
npm run example 01-basic-print.ts

# Publishing
npm version patch        # Bump version
npm publish             # Publish to npm
```

---

## Remember

- **Quality over speed** - Write clean, maintainable code
- **Test as you go** - Don't defer testing
- **Document everything** - Your future self will thank you
- **Follow the patterns** - Consistency is key
- **Ask when uncertain** - Clarification prevents rework

---

## Start Here

Begin with Task 1.1: Initialize Project Structure

Run these commands in order:
```bash
mkdir richjs && cd richjs
npm init -y
npm install -D typescript @types/node tsup vitest tsx eslint prettier
npm install chalk@5 terminal-size@4 string-width@7 strip-ansi@7 ansi-escapes@6 wrap-ansi@9
npx tsc --init
```

Then create the configuration files listed in Task 1.2-1.5.

Good luck! 🚀
