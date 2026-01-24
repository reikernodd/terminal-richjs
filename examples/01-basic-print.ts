import { Console } from '../src/console/console';
import { Panel } from '../src/renderables/panel';
import { Rule } from '../src/renderables/rule';

const console = new Console();

console.print("Hello, [bold magenta]RichJS[/bold magenta]!");
console.print(new Rule("Welcome"));
console.print(new Panel("This is a panel", { title: "Panel Title", box: "round" }));
