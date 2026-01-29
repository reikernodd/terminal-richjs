#!/usr/bin/env node

import { Command } from 'commander';
import { Console } from './index.js';

const VERSION = '0.2.1';

const program = new Command();

program
  .name('richjs')
  .description('Rich terminal rendering for Node.js - CLI toolbox for fancy terminal output')
  .version(VERSION, '-v, --version', 'Display version')
  .argument('[resource]', 'Path to file, URL, or text to render (use "-" for stdin)', '')
  .helpOption('-h, --help', 'Display help');

// Basic command setup - will expand with rendering logic in next phases
program.action((resource: string) => {
  const console = new Console();

  if (!resource) {
    console.print('[yellow]No resource provided. Use --help for usage information.[/]');
    process.exit(0);
  }

  console.print(`[green]Resource received:[/] ${resource}`);
  console.print('[dim]Full CLI implementation coming in next phases...[/]');
});

program.parse();
