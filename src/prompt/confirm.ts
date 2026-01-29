import type { Console } from "../console/console";
import { Prompt } from "./prompt";

export class Confirm {
	static async ask(
		message: string,
		options: { default?: boolean; console?: Console } = {},
	): Promise<boolean> {
		const defaultValue = options.default ?? true;
		const choices = defaultValue ? ["Y", "n"] : ["y", "N"];

		// We handle the choice logic manually to be flexible with case
		const answer = await Prompt.ask(message, {
			...options,
			choices: choices,
			default: defaultValue ? "y" : "n",
			validate: (input) => {
				const norm = input.toLowerCase();
				return norm === "y" || norm === "yes" || norm === "n" || norm === "no";
			},
		});

		const norm = answer.toLowerCase();
		return norm === "y" || norm === "yes";
	}
}
