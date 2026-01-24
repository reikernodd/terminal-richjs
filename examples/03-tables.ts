import { Console } from '../src/console/console';
import { Table } from '../src/renderables/table';

const console = new Console();

const table = new Table({ box: 'round', showHeader: true });
table.addColumn("Date");
table.addColumn("Title");
table.addColumn("Budget");

table.addRow("2019", "Star Wars: The Rise of Skywalker", "$275M");
table.addRow("2017", "Star Wars: The Last Jedi", "$262M");

console.print(table);
