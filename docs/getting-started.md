# Getting Started with RichJS

## Introduction

RichJS makes it easy to add color and style to your terminal output. It is designed to be a drop-in replacement for `console.log` for many use cases, but with superpowers.

## The Console Object

The heart of RichJS is the `Console` class.

```typescript
import { Console } from 'richjs';

const console = new Console();
```

### Printing

Use `console.print()` to output text. It automatically detects your terminal capabilities (color support, width) to format output correctly.

```typescript
console.print("Regular text");
console.print("Styled [bold red]text[/]");
```

### Inspecting Objects

RichJS provides a powerful `inspect` utility to visualize objects.

```typescript
import { inspect } from 'richjs';

const user = { name: "Dave", id: 9000, active: true };
inspect(user);
```

### Logging

Replace standard logging with `RichHandler` for beautiful log output including timestamps and log levels.

```typescript
import { RichHandler } from 'richjs';

const handler = new RichHandler();
handler.handle({ level: 'info', message: 'Server started', timestamp: new Date() });
```
