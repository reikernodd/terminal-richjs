import { Console, Theme } from '../src';

// 1. Define a custom theme
const myTheme = new Theme({
    'headline': 'bold underline cyan',
    'alert': 'bold white on red',
    'cool': 'italic blue'
});

const console = new Console({ theme: myTheme });

console.print("[headline]Welcome to the Themed Console[/]");
console.print("This is [alert] DANGEROUS [/] and this is [cool]cool[/].");
console.print("[warning]Standard themes[/] (like 'warning') are not loaded if you replace the theme object entirely, unless you merge.");

// 2. Merging with default
import { DEFAULT_THEME } from '../src';
const mergedTheme = new Theme({
    ...DEFAULT_THEME.styles,
    'custom': 'magenta'
});
const console2 = new Console({ theme: mergedTheme });
console2.print("\n[success]Success![/] (from default) and [custom]Custom[/] (from new).");
