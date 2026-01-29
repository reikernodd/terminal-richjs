import type { Console } from "../console/console";
import { type LogLevel, type LogRecord, RichHandler } from "./handler";

export class Logger {
	private handler: RichHandler;

	constructor(console?: Console) {
		this.handler = new RichHandler(console);
	}

	debug(message: string, context?: Record<string, any>): void {
		this.log("debug", message, context);
	}

	info(message: string, context?: Record<string, any>): void {
		this.log("info", message, context);
	}

	warn(message: string, context?: Record<string, any>): void {
		this.log("warn", message, context);
	}

	error(message: string, context?: Record<string, any>): void {
		this.log("error", message, context);
	}

	private log(
		level: LogLevel,
		message: string,
		context?: Record<string, any>,
	): void {
		const record: LogRecord = {
			level,
			message,
			timestamp: new Date(),
			context,
		};
		this.handler.handle(record);
	}
}
