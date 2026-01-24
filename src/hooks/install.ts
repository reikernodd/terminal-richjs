import { RichHandler } from '../logging/handler';
import { Console } from '../console/console';

export function install(consoleOptions = {}): void {
    if ((global as any).__rich_installed__) return;

    const richConsole = new Console(consoleOptions);
    const handler = new RichHandler(richConsole);

    const originalLog = global.console.log;
    const originalWarn = global.console.warn;
    const originalError = global.console.error;

    // Monkey patch
    global.console.log = (...args: any[]) => {
        // If first arg is a string, we might want to let Rich format it?
        // Or strictly treat as log record?
        // Rich's install() replaces tracebacks and logging.
        // Here we can simply map console.log -> richConsole.print
        richConsole.print(...args);
    };

    global.console.warn = (...args: any[]) => {
        handler.handle({
            level: 'warn',
            message: args.map(String).join(' '),
            timestamp: new Date()
        });
    };

    global.console.error = (...args: any[]) => {
        handler.handle({
            level: 'error',
            message: args.map(String).join(' '),
            timestamp: new Date()
        });
    };

    (global as any).__rich_installed__ = true;
    (global as any).__rich_original_console__ = {
        log: originalLog,
        warn: originalWarn,
        error: originalError
    };
}
