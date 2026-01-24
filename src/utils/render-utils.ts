import type { RenderResult, Renderable } from '../types/renderable';
import type { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';

export function getRenderResult(renderable: Renderable, console: Console, options: ConsoleOptions): RenderResult {
    const result = renderable.__rich_console__(console, options);
    if ('segments' in result) {
        return result;
    }
    // It's a generator
    return {
        segments: Array.from(result),
        width: options.width // approximation
    };
}
