import { Console } from '../console/console';
import { Panel } from '../renderables/panel';
import { Syntax } from '../syntax/syntax';
import { Table } from '../renderables/table';

export interface InspectOptions {
  title?: string;
  depth?: number;
  private?: boolean;
}

/**
 * Inspects an object and prints a formatted representation.
 */
export function inspect(obj: any, options: InspectOptions = {}): void {
  const console = new Console();
  const title = options.title ?? `Inspect: ${obj?.constructor?.name ?? typeof obj}`;
  
  // 1. Basic properties table
  const table = new Table({ box: 'single', showHeader: true });
  table.addColumn("Property", { style: "cyan" });
  table.addColumn("Type", { style: "magenta" });
  table.addColumn("Value");

  const props = Object.getOwnPropertyNames(obj);
  
  // Sort props?
  props.sort();

  for (const prop of props) {
      const value = obj[prop];
      let type: string = typeof value;
      let valueStr = String(value);

      if (value === null) type = 'null';
      else if (Array.isArray(value)) type = 'Array';
      
      // Truncate long values
      if (valueStr.length > 50) valueStr = valueStr.substring(0, 47) + '...';

      table.addRow(prop, type, valueStr);
  }

  // 2. Syntax highlight the raw JSON representation for detail
  let json = '';
  try {
      json = JSON.stringify(obj, null, 2);
  } catch {
      json = '[Circular]';
  }

  const syntax = new Syntax(json, 'json');
  void syntax; 
  
  // Render
  console.print(new Panel(table, { title: title, box: 'round', borderStyle: undefined }));
}
