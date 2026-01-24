# Styling Guide

RichJS uses a markup syntax similar to BBCode or Python Rich.

## Basic Syntax

Tags are enclosed in brackets `[]`.

- `[bold]Text[/bold]` or `[bold]Text[/]` (auto-close)
- `[red]Red Text[/red]`
- `[bold red on blue]Mixed Styles[/]`

## Available Styles

### Colors
- `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`
- `bright_red`, `bright_green`, etc.

### Modifiers
- `bold`
- `italic`
- `dim`
- `underline`
- `reverse`
- `strikethrough`
- `blink`

### Backgrounds
Prefix a color with `on`.
- `on red`
- `on blue`

## Parsing Rules

1. **Nesting**: Styles nest and combine. `[bold]Bold [red]and red[/] still bold[/]`.
2. **Closing**: `[/]` closes the most recent tag. `[/tag]` closes a specific tag.
