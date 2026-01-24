export interface StackFrame {
  functionName: string;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
}

export class Trace {
  static parse(error: Error): StackFrame[] {
    if (!error.stack) return [];

    const lines = error.stack.split('\n');
    const frames: StackFrame[] = [];

    // Skip the first line (error message)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('at ')) continue;

      // Parse lines like: "at functionName (filePath:line:col)"
      // or "at filePath:line:col"

      let functionName = '';
      let location = '';

      if (line.includes('(')) {
        const parts = line.substring(3).split(' (');
        functionName = parts[0];
        location = parts[1].slice(0, -1); // remove closing paren
      } else {
        location = line.substring(3);
      }

      const locParts = location.split(':');
      const columnNumber = parseInt(locParts.pop() || '0');
      const lineNumber = parseInt(locParts.pop() || '0');
      const filePath = locParts.join(':');

      frames.push({
        functionName: functionName || '<anonymous>',
        filePath,
        lineNumber,
        columnNumber,
      });
    }

    return frames;
  }
}
