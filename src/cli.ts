#!/usr/bin/env node

import { Command } from 'commander';
import {
  Console,
  Syntax,
  Markdown,
  JSON as RichJSON,
  Text,
  Panel,
  Padding,
  Align,
} from './index.js';
import { readResource } from './cli/utils.js';
import type { Renderable } from './types/renderable.js';

const VERSION = '0.2.1';

type AlignMethod = 'left' | 'center' | 'right';

const program = new Command();

program
  .name('richjs')
  .description('Rich terminal rendering for Node.js - CLI toolbox for fancy terminal output')
  .version(VERSION, '-v, --version', 'Display version')
  .argument('[resource]', 'Path to file, URL, or text to render (use "-" for stdin)', '')
  .option('-p, --print', 'Print console markup')
  .option('-m, --markdown', 'Render as markdown')
  .option('-J, --json', 'Render as JSON')
  .option('-s, --syntax', 'Force syntax highlighting')
  .option('-n, --line-numbers', 'Show line numbers (for syntax highlighting)')
  .option('--theme <name>', 'Syntax theme (monokai, dracula, github-light, onedark)', 'monokai')
  .option('-x, --lexer <name>', 'Specify lexer for syntax highlighting')
  .option(
    '-a, --panel <box>',
    'Wrap output in a panel with box style (rounded, heavy, double, square, etc.)',
  )
  .option('--title <text>', 'Set panel title')
  .option('--caption <text>', 'Set panel caption')
  .option('-w, --width <size>', 'Set output width', parseInt)
  .option('-l, --left', 'Align output to left')
  .option('-c, --center', 'Align output to center')
  .option('-r, --right', 'Align output to right')
  .option('-d, --padding <padding>', 'Add padding (single number or top,right,bottom,left)')
  .option('-S, --style <style>', 'Apply style to output')
  .helpOption('-h, --help', 'Display help');

interface CliOptions {
  print?: boolean;
  markdown?: boolean;
  json?: boolean;
  syntax?: boolean;
  lineNumbers?: boolean;
  theme?: string;
  lexer?: string;
  panel?: string;
  title?: string;
  caption?: string;
  width?: number;
  left?: boolean;
  center?: boolean;
  right?: boolean;
  padding?: string;
  style?: string;
}

program.action(async (resource: string, options: CliOptions) => {
  const console = new Console();

  if (!resource) {
    console.print('[yellow]No resource provided. Use --help for usage information.[/]');
    process.exit(0);
  }

  try {
    const { content, detectedType } = await readResource(resource);

    // Determine rendering mode
    let mode: 'print' | 'markdown' | 'json' | 'syntax' = 'syntax';

    if (options.print) {
      mode = 'print';
    } else if (options.markdown) {
      mode = 'markdown';
    } else if (options.json) {
      mode = 'json';
    } else if (options.syntax) {
      mode = 'syntax';
    } else {
      // Auto-detect based on file type
      if (detectedType === 'markdown') {
        mode = 'markdown';
      } else if (detectedType === 'json') {
        mode = 'json';
      } else {
        mode = 'syntax';
      }
    }

    // Create base renderable based on mode
    let renderable: Renderable;

    switch (mode) {
      case 'print': {
        renderable = new Text(content);
        break;
      }

      case 'markdown': {
        renderable = new Markdown(content);
        break;
      }

      case 'json': {
        renderable = new RichJSON(content);
        break;
      }

      case 'syntax':
      default: {
        const lexer = options.lexer || detectedType || 'text';
        renderable = new Syntax(content, lexer, {
          theme: options.theme as any,
          lineNumbers: options.lineNumbers,
        });
        break;
      }
    }

    // Apply layout transformations (order matters: padding -> panel -> align)

    // 1. Apply padding if specified
    if (options.padding) {
      const paddingValues = options.padding.split(',').map((v) => parseInt(v.trim()));

      if (paddingValues.length === 1) {
        renderable = new Padding(renderable, paddingValues[0]);
      } else if (paddingValues.length === 2) {
        renderable = new Padding(renderable, [paddingValues[0], paddingValues[1]]);
      } else if (paddingValues.length === 4) {
        renderable = new Padding(renderable, [
          paddingValues[0],
          paddingValues[1],
          paddingValues[2],
          paddingValues[3],
        ]);
      } else {
        console.print('[red]Error:[/] Padding should be 1, 2, or 4 comma-separated values');
        process.exit(1);
      }
    }

    // 2. Wrap in panel if specified
    if (options.panel) {
      renderable = new Panel(renderable, {
        box: options.panel as any,
        title: options.title,
        subtitle: options.caption,
        borderStyle: options.style,
      });
    }

    // 3. Apply alignment if specified
    if (options.left || options.center || options.right) {
      let align: AlignMethod = 'left';
      if (options.center) align = 'center';
      if (options.right) align = 'right';
      renderable = new Align(renderable, align);
    }

    // Print with optional width constraint
    if (options.width) {
      console.print(renderable, { width: options.width });
    } else {
      console.print(renderable);
    }
  } catch (error) {
    console.print(`[red]Error:[/] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
});

program.parse();
