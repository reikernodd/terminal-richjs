import readline from "readline";
import { Console } from "../console/console";

export interface PromptOptions<T> {
	console?: Console;
	password?: boolean;
	choices?: string[];
	default?: T;
	validate?: (input: string) => boolean | string;
}

export class Prompt {
	static async ask<T = string>(
		message: string,
		options: PromptOptions<T> = {},
	): Promise<T> {
		const console = options.console ?? new Console();
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: true,
		});

		const defaultStr =
			options.default !== undefined ? ` [default: ${options.default}]` : "";
		const choicesStr = options.choices ? ` [${options.choices.join("/")}]` : "";
		const query = `${message}${choicesStr}${defaultStr}: `;

		// Render query using Rich Console to support styles
		// But readline expects plain string prompt.
		// We print the query first, then use empty prompt for RL.
		console.print(query);

		return new Promise((resolve) => {
			// Handle password masking manually if needed, or simple raw mode
			// For MVP, we use standard readline.
			// Password masking is complex in pure Node readline.

			const askQuestion = () => {
				// If using console.print above, it adds newline. We might want inline.
				// Console needs a print method that doesn't add newline for prompts.
				// For now, let's just use process.stdout for the prompt line itself if we want inline
				// But wait, console.print adds newline.
				// Let's modify Console or just rely on the newline behavior.
				// Rich prompts usually are inline. "Name: "

				process.stdout.write("> ");

				rl.question("", (answer) => {
					let value = answer.trim();

					if (value === "" && options.default !== undefined) {
						value = String(options.default);
					}

					if (options.choices && !options.choices.includes(value)) {
						console.print(
							`[red]Please select one of: ${options.choices.join(", ")}[/]`,
						);
						askQuestion();
						return;
					}

					if (options.validate) {
						const validation = options.validate(value);
						if (validation !== true) {
							const msg =
								typeof validation === "string" ? validation : "Invalid input";
							console.print(`[red]${msg}[/]`);
							askQuestion();
							return;
						}
					}

					rl.close();
					resolve(value as unknown as T);
				});
			};

			askQuestion();
		});
	}
}
