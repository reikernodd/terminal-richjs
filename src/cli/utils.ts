import { readFileSync } from 'node:fs';

export interface ResourceResult {
  content: string;
  detectedType?: string;
}

/**
 * Read a resource from a file path, URL, or stdin
 */
export async function readResource(path: string): Promise<ResourceResult> {
  // Handle stdin
  if (path === '-') {
    const content = await readStdin();
    return { content };
  }

  // Handle URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    const content = await readUrl(path);
    const detectedType = detectTypeFromExtension(path);
    return { content, detectedType };
  }

  // Handle local files
  try {
    const content = readFileSync(path, 'utf-8');
    const detectedType = detectTypeFromExtension(path);
    return { content, detectedType };
  } catch (error) {
    throw new Error(`Unable to read file: ${path}. ${error}`);
  }
}

/**
 * Read from stdin
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', (error) => {
      reject(new Error(`Failed to read from stdin: ${error}`));
    });
  });
}

/**
 * Read from URL
 */
async function readUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Unable to fetch URL: ${url}. ${error}`);
  }
}

/**
 * Detect content type from file extension
 */
export function detectTypeFromExtension(path: string): string | undefined {
  const extensionMap: Record<string, string> = {
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.json': 'json',
    '.csv': 'csv',
    '.tsv': 'csv',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.html': 'html',
    '.css': 'css',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
  };

  const extension = path.toLowerCase().match(/\.[^.]+$/)?.[0];
  return extension ? extensionMap[extension] : undefined;
}

/**
 * Detect if content is JSON
 */
export function isJsonContent(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}
