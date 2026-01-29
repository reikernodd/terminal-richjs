// Core
/** biome-ignore-all assist/source/organizeImports: biome-ignore assist/source/organizeImports */
import { Console } from "./console/console";
export { Console };
export { Style } from "./core/style";
export { Segment } from "./core/segment";
export { MarkupParser } from "./core/markup";

// Renderables
export { Text } from "./renderables/text";
export { Panel } from "./renderables/panel";
export { Rule } from "./renderables/rule";
export { Table } from "./renderables/table";
export { Tree } from "./renderables/tree";
export { Layout } from "./layout/layout";
export { Grid } from "./layout/grid";
export { Padding } from "./renderables/padding";
export { Align } from "./renderables/align";
export { Columns } from "./renderables/columns";
export { JSON } from "./renderables/json";

// Traceback
export { Traceback, installTracebackHandler } from "./traceback/traceback";

// Prompts
export { Prompt } from "./prompt/prompt";
export { Confirm } from "./prompt/confirm";

// Hooks
export { install } from "./hooks/install";

// Syntax Highlighting
export { Syntax } from "./syntax/syntax";
export {
	MONOKAI,
	DRACULA,
	GITHUB_LIGHT,
	ONE_DARK,
	getTheme,
	SYNTAX_THEMES,
	type SyntaxTheme,
} from "./syntax/theme";

// Markdown
export { Markdown } from "./markdown/markdown";

// Progress
export {
	ProgressBar,
	PercentageColumn,
	TimeElapsedColumn,
	TimeRemainingColumn,
} from "./progress/bar";
export { Progress } from "./progress/progress";
export { track } from "./progress/track";

// Status & Live
export { Spinner, listSpinners } from "./status/spinner";
export { Status } from "./status/status";
export { Live, sleep } from "./live/live";
export {
	SPINNERS,
	getSpinner,
	listSpinners as getSpinnerNames,
	type SpinnerData,
} from "./status/spinners";

// Themes
export { Theme, DEFAULT_THEME } from "./themes/theme";
export { Palette } from "./themes/palette";

// Utilities
export { Color } from "./utils/color";
export {
	getBox,
	listBoxStyles,
	type BoxStyle,
	type BoxData,
} from "./utils/box";
export { EMOJI, replaceEmoji, listEmoji, hasEmoji } from "./utils/emoji";

// Logging
export { RichHandler } from "./logging/handler";
export { Logger } from "./logging/logger";
export { inspect } from "./utils/inspect";

// Global Helpers
const globalConsole = new Console();
export const print = globalConsole.print.bind(globalConsole);

// Types
export * from "./types/console-options";
export * from "./types/renderable";
export * from "./types/style-types";

// Legacy exports for backwards compatibility
export { MONOKAI_THEME } from "./syntax/theme";
