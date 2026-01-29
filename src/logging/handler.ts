import { Console } from "../console/console";
import { Segment } from "../core/segment";
import { Style } from "../core/style";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogRecord {
	level: LogLevel;
	message: string;
	timestamp: Date;
	context?: Record<string, any>;
}

export class RichHandler {
	private console: Console;

	constructor(console?: Console) {
		this.console = console ?? new Console();
	}

	handle(record: LogRecord): void {
		const time = record.timestamp.toLocaleTimeString();
		const levelStyle = this.getLevelStyle(record.level);

		// Format: [TIME] [LEVEL] Message {context}
		const parts: any[] = [
			`[dim]${time}[/dim]`,
			// Pad level to align messages
			new Segment(` ${record.level.toUpperCase()} `.padEnd(7), levelStyle),
			record.message,
		];

		if (record.context && Object.keys(record.context).length > 0) {
			parts.push(`[dim]${JSON.stringify(record.context)}[/dim]`);
		}

		this.console.print(...parts);
	}

	private getLevelStyle(level: LogLevel): Style {
		switch (level) {
			case "debug":
				return Style.parse("dim cyan");
			case "info":
				return Style.parse("green");
			case "warn":
				return Style.parse("yellow");
			case "error":
				return Style.parse("bold red");
			default:
				return Style.null();
		}
	}
}
