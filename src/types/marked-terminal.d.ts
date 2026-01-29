declare module "marked-terminal" {
	import { Renderer } from "marked";
	export default class TerminalRenderer extends Renderer {
		// biome-ignore lint/suspicious/noExplicitAny: External library definition
		constructor(options?: any);
	}
}
