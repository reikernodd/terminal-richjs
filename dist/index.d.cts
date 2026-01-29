import { SpinnerName } from 'cli-spinners';
import boxes from 'cli-boxes';
import tinycolor from 'tinycolor2';

type StandardColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "bright_black" | "bright_red" | "bright_green" | "bright_yellow" | "bright_blue" | "bright_magenta" | "bright_cyan" | "bright_white";
interface RGB {
    r: number;
    g: number;
    b: number;
}
type Color$1 = StandardColor | RGB | string | number;
interface StyleOptions {
    color?: Color$1;
    backgroundColor?: Color$1;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    dim?: boolean;
    reverse?: boolean;
    blink?: boolean;
    hidden?: boolean;
}

declare class Style {
    /**
     * Apply this style to text (alias for render).
     */
    apply(text: string): string;
    readonly color?: Color$1;
    readonly backgroundColor?: Color$1;
    readonly bold?: boolean;
    readonly italic?: boolean;
    readonly underline?: boolean;
    readonly strikethrough?: boolean;
    readonly dim?: boolean;
    readonly reverse?: boolean;
    readonly blink?: boolean;
    readonly hidden?: boolean;
    constructor(options?: StyleOptions);
    static null(): Style;
    /**
     * Parse a style string into a Style object.
     * Supports:
     * - Modifiers: bold, italic, underline, dim, strike, reverse, blink, hidden
     * - Named colors: red, green, blue, cyan, magenta, yellow, white, black
     * - Bright colors: bright_red, bright_green, etc.
     * - Hex colors: #ff0000
     * - RGB colors: rgb(255,0,0)
     * - 256 colors: color(196)
     * - Background: on red, on #ff0000, on rgb(255,0,0)
     */
    static parse(styleString: string): Style;
    /**
     * Parse a single color value.
     * Supports hex (#ff0000), RGB (rgb(255,0,0)), 256-color (color(196)), and named colors.
     */
    private static parseColor;
    combine(other: Style): Style;
    render(text: string): string;
    /**
     * Apply a color to a chalk instance.
     */
    private applyColor;
    private isRGB;
}

declare class Palette {
    colors: Record<string, string>;
    constructor(colors?: Record<string, string>);
    get(name: string): string | undefined;
    /**
     * Generates a simple palette from a primary color.
     */
    static fromPrimary(primary: string): Palette;
}

declare class Theme {
    styles: Record<string, Style | string>;
    palette: Palette;
    constructor(styles?: Record<string, Style | string>, palette?: Palette);
    get(name: string): Style;
    /**
     * Parses a style string replacing palette references.
     * e.g. "bold primary" -> "bold #007bff"
     */
    private parseWithPalette;
    static fromPalette(palette: Palette): Theme;
}
declare const DEFAULT_THEME: Theme;

type ColorSystem = "standard" | "256" | "truecolor" | "none";
interface ConsoleOptions {
    /**
     * The width of the console in characters.
     * If not provided, it will be detected automatically.
     */
    width?: number;
    /**
     * The height of the console in lines.
     * If not provided, it will be detected automatically.
     */
    height?: number;
    /**
     * The color system to use.
     * If not provided, it will be detected automatically.
     */
    colorSystem?: ColorSystem;
    /**
     * Whether to force terminal output even if not a TTY.
     */
    forceTerminal?: boolean;
    /**
     * Theme configuration.
     */
    theme?: Theme;
    /**
     * Whether to record output for later export.
     */
    record?: boolean;
}

/**
 * A segment of text with a specific style.
 */
declare class Segment implements Renderable {
    readonly text: string;
    readonly style: Style;
    readonly isControl: boolean;
    constructor(text: string, style?: Style, isControl?: boolean);
    /**
     * Implementation of Renderable protocol.
     */
    __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult;
    /**
     * Calculates the cell length of the text.
     */
    cellLength(): number;
    /**
     * Renders the segment to an ANSI string.
     */
    render(): string;
    /**
     * Splits the segment into lines.
     */
    splitLines(_allowEmpty?: boolean): Segment[][];
    /**
     * Creates a new Segment with modified properties.
     */
    clone(text?: string, style?: Style, isControl?: boolean): Segment;
}

/**
 * Result of rendering a Renderable object.
 */
interface RenderResult {
    /** The rendered text segments */
    segments: Segment[];
    /** The width in characters */
    width?: number;
    /** The height in lines */
    height?: number;
}
/**
 * Protocol for objects that can be rendered to the console.
 */
interface Renderable {
    /**
     * Renders the object to segments.
     *
     * @param console - The console instance
     * @param options - Rendering options
     * @returns The render result
     */
    __rich_console__(console: Console, options: ConsoleOptions): RenderResult | Generator<Segment>;
}
/**
 * Type guard to check if an object is renderable.
 */
declare function isRenderable(obj: unknown): obj is Renderable;

interface StatusOptions {
    spinnerName?: string;
}
declare class Status {
    private spinner;
    private message;
    private interval;
    private started;
    private lastRenderedLines;
    constructor(message: string, options?: StatusOptions);
    start(): void;
    stop(): void;
    update(message: string): void;
    private refresh;
}

declare class Console {
    error(message: any): void;
    private readonly terminal;
    private readonly markupParser;
    private readonly options;
    theme: Theme;
    constructor(options?: ConsoleOptions);
    get width(): number;
    get height(): number;
    /**
     * Prints objects to the console.
     */
    print(...objects: any[]): void;
    /**
     * Prints a formatted exception.
     */
    printException(error: Error): void;
    /**
     * Displays a status spinner.
     */
    status(message: string, options?: {
        spinner?: SpinnerName;
    }): {
        start: () => void;
        stop: () => void;
        update: (msg: string) => void;
    } & Promise<void>;
    /**
     * Run a task with a status spinner.
     */
    withStatus<T>(message: string, task: (status: Status) => Promise<T>, options?: {
        spinner?: SpinnerName;
    }): Promise<T>;
    /**
     * Renders a renderable object to a string.
     */
    render(renderable: Renderable): string;
    /**
     * Internal string rendering with markup and wrapping.
     */
    private renderString;
    /**
     * Low-level write to stdout.
     */
    private write;
}

/**
 * Parses Rich markup into segments.
 * Example: "[bold red]Hello[/bold red] [green]World[/green]"
 */
declare class MarkupParser {
    private static readonly TAG_REGEX;
    private theme;
    constructor(theme?: Theme);
    parse(markup: string): Segment[];
}

type JustifyMethod = "left" | "center" | "right" | "full";
type OverflowMethod = "fold" | "crop" | "ellipsis";
declare class Text implements Renderable {
    readonly style: Style;
    readonly justify: JustifyMethod;
    readonly overflow: OverflowMethod;
    readonly noWrap: boolean;
    private readonly segments;
    constructor(content: string | Segment[], style?: Style, justify?: JustifyMethod, overflow?: OverflowMethod, noWrap?: boolean);
    __rich_console__(console: Console, options: ConsoleOptions): RenderResult;
}

interface BoxData {
    topLeft: string;
    top: string;
    topRight: string;
    right: string;
    bottomRight: string;
    bottom: string;
    bottomLeft: string;
    left: string;
    topMid?: string;
    midMid?: string;
    bottomMid?: string;
    leftMid?: string;
    rightMid?: string;
    mid?: string;
    verticalMid?: string;
    [key: string]: string | undefined;
}
type BoxStyle = "none" | "rounded" | "round" | "heavy" | "bold" | "double" | "single" | "square" | "ascii" | "minimal" | "simple" | "markdown" | keyof typeof boxes;
/**
 * Get box drawing characters for a given style.
 */
declare function getBox(style: BoxStyle): BoxData | null;
/**
 * List all available box styles.
 */
declare function listBoxStyles(): string[];

/** biome-ignore-all assist/source/organizeImports: biome-ignore assist/source/organizeImports */
/** biome-ignore-all lint/suspicious/noExplicitAny: biome-ignore lint/suspicious/noExplicitAny */

interface PanelOptions {
    title?: string;
    titleAlign?: "left" | "center" | "right";
    subtitle?: string;
    subtitleAlign?: "left" | "center" | "right";
    box?: BoxStyle;
    style?: Style | string;
    borderStyle?: Style | string;
    padding?: number | [number, number] | [number, number, number, number];
    width?: number;
    height?: number;
    expand?: boolean;
    highlight?: boolean;
}
/**
 * A bordered panel container for any renderable content.
 * Supports titles, subtitles, various box styles, and padding.
 */
declare class Panel implements Renderable {
    readonly renderable: Renderable | string;
    readonly options: PanelOptions;
    constructor(renderable: Renderable | string, options?: PanelOptions);
    /**
     * Create a panel that fits its content (expand=false).
     */
    static fit(renderable: Renderable | string, options?: PanelOptions): Panel;
    __rich_console__(console: Console, consoleOptions: ConsoleOptions): RenderResult;
    /**
     * Normalize padding to [top, right, bottom, left] format.
     */
    private normalizePadding;
    /**
     * Render top border with optional title.
     */
    private renderTopBorder;
    /**
     * Render bottom border with optional subtitle.
     */
    private renderBottomBorder;
}

declare class Rule implements Renderable {
    readonly title: string;
    readonly characters: string;
    readonly style: Style;
    constructor(title?: string, characters?: string, style?: Style);
    __rich_console__(console: Console, options: ConsoleOptions): RenderResult;
}

/** biome-ignore-all assist/source/organizeImports: biome-ignore assist/source/organizeImports */

interface ColumnOptions {
    header?: string;
    footer?: string;
    style?: Style | string;
    headerStyle?: Style | string;
    footerStyle?: Style | string;
    justify?: "left" | "center" | "right";
    vertical?: "top" | "middle" | "bottom";
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    ratio?: number;
    noWrap?: boolean;
    overflow?: "fold" | "crop" | "ellipsis";
}
interface TableOptions {
    title?: string;
    caption?: string;
    box?: BoxStyle;
    showHeader?: boolean;
    showFooter?: boolean;
    showEdge?: boolean;
    showLines?: boolean;
    expand?: boolean;
    borderStyle?: Style | string;
    headerStyle?: Style | string;
    footerStyle?: Style | string;
    titleStyle?: Style | string;
    captionStyle?: Style | string;
    rowStyles?: string[];
    padding?: number;
    highlight?: boolean;
}
declare class Table implements Renderable {
    readonly options: TableOptions;
    private columns;
    private rows;
    private footerRow;
    constructor(options?: TableOptions);
    addColumn(header: string | ColumnOptions, options?: ColumnOptions): this;
    addRow(...cells: (Renderable | string)[]): this;
    addFooter(...cells: (Renderable | string)[]): this;
    private alignText;
    __rich_console__(console: Console, consoleOptions: ConsoleOptions): RenderResult;
}

/** biome-ignore-all assist/source/organizeImports: false */

interface TreeOptions {
    guideStyle?: string;
    hideRoot?: boolean;
}
/**
 * Hierarchical tree structure for displaying nested data.
 * Supports any renderable as node content, including Panels, Syntax, and Tables.
 */
declare class Tree implements Renderable {
    readonly label: string | Renderable;
    readonly options: TreeOptions;
    private children;
    private guideStyle;
    private guides;
    constructor(label: string | Renderable, options?: TreeOptions);
    /**
     * Add a child node to the tree.
     * Returns the added Tree node for method chaining.
     */
    add(label: string | Renderable | Tree): Tree;
    __rich_console__(console: Console, options: ConsoleOptions): RenderResult;
    /**
     * Render a label (string or renderable) and add segments.
     */
    private renderLabel;
    /**
     * Render child nodes with appropriate prefixes.
     */
    private renderChildren;
}

interface LayoutOptions {
    size?: number;
    ratio?: number;
    minimumSize?: number;
    visible?: boolean;
}
declare class Layout implements Renderable {
    private _renderable;
    private _children;
    private _direction;
    size: number | undefined;
    ratio: number;
    minimumSize: number;
    visible: boolean;
    constructor(renderable?: Renderable, options?: LayoutOptions);
    /**
     * Split the layout into a row (horizontal split).
     */
    splitRow(...layouts: (Layout | Renderable)[]): void;
    /**
     * Split the layout into a column (vertical split).
     */
    splitColumn(...layouts: (Layout | Renderable)[]): void;
    get renderable(): Renderable | null;
    update(renderable: Renderable): void;
    __rich_console__(console: Console, options: ConsoleOptions): RenderResult;
    /**
     * Calculates the size (width for rows, height for columns) for each child
     * based on constraints.
     */
    private calculateSizes;
}

declare class Grid extends Layout {
    constructor();
    /**
     * Adds a row to the grid with optional constraints.
     */
    addRow(content: Layout | any, options?: LayoutOptions): void;
}

type PaddingValue = number | [number, number] | [number, number, number, number];
declare class Padding implements Renderable {
    renderable: Renderable | string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    constructor(renderable: Renderable | string, padding: PaddingValue);
    __rich_console__(console: Console, options: ConsoleOptions): RenderResult;
}

type AlignMethod = "left" | "center" | "right";
declare class Align implements Renderable {
    renderable: Renderable | string;
    align: AlignMethod;
    style?: any | undefined;
    constructor(renderable: Renderable | string, align: AlignMethod, style?: any | undefined);
    static left(renderable: Renderable | string): Align;
    static center(renderable: Renderable | string): Align;
    static right(renderable: Renderable | string): Align;
    __rich_console__(console: Console, options: ConsoleOptions): RenderResult;
}

/**
 * Columns layout - display renderables in responsive columns
 */
/** biome-ignore-all lint/suspicious/noControlCharactersInRegex: false */
/** biome-ignore-all assist/source/organizeImports: false */

interface ColumnsOptions {
    width?: number;
    padding?: number;
    expand?: boolean;
    equal?: boolean;
    columnFirst?: boolean;
    rightToLeft?: boolean;
    title?: string;
}
/**
 * Display renderables in neat columns that adapt to terminal width.
 */
declare class Columns implements Renderable {
    private renderables;
    private options;
    constructor(renderables?: Iterable<string | Renderable>, options?: ColumnsOptions);
    /**
     * Add a renderable to the columns.
     */
    add(renderable: string | Renderable): this;
    __rich_console__(console: Console, consoleOptions: ConsoleOptions): RenderResult;
    /**
     * Get the display width of a string (accounting for ANSI codes).
     */
    private getDisplayWidth;
    /**
     * Pad an item to the specified width.
     */
    private padItem;
}

/**
 * JSON renderable - pretty-printed and syntax-highlighted JSON
 */
/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: false */
/** biome-ignore-all assist/source/organizeImports: false */

interface JSONOptions {
    indent?: number | string;
    highlight?: boolean;
    sortKeys?: boolean;
}
/**
 * A renderable which pretty prints JSON with syntax highlighting.
 */
declare class JSON implements Renderable {
    private readonly text;
    private readonly highlight;
    constructor(json: string, options?: JSONOptions);
    /**
     * Create JSON from any data object.
     */
    static fromData(data: unknown, options?: JSONOptions): JSON;
    private sortObject;
    /**
     * Apply JSON syntax highlighting.
     */
    private highlightJSON;
    __rich_console__(_console: Console, _consoleOptions: ConsoleOptions): RenderResult;
}

interface TracebackOptions {
    showLocals?: boolean;
    extraLines?: number;
    theme?: string;
    suppressInternal?: boolean;
    maxFrames?: number;
}
/**
 * Beautiful error traceback rendering.
 * Displays syntax-highlighted stack traces with optional local variables.
 */
declare class Traceback implements Renderable {
    readonly error: Error;
    readonly options: TracebackOptions;
    private frames;
    constructor(error: Error, options?: TracebackOptions);
    __rich_console__(console: Console, consoleOptions: ConsoleOptions): RenderResult;
}
/**
 * Install Rich traceback handler as the default for uncaught exceptions.
 */
declare function installTracebackHandler(options?: TracebackOptions): void;

interface PromptOptions<T> {
    console?: Console;
    password?: boolean;
    choices?: string[];
    default?: T;
    validate?: (input: string) => boolean | string;
}
declare class Prompt {
    static ask<T = string>(message: string, options?: PromptOptions<T>): Promise<T>;
}

declare class Confirm {
    static ask(message: string, options?: {
        default?: boolean;
        console?: Console;
    }): Promise<boolean>;
}

declare function install(consoleOptions?: {}): void;

interface SyntaxOptions {
    theme?: string;
    lineNumbers?: boolean;
    startLine?: number;
    highlightLines?: number[];
    wordWrap?: boolean;
}
/**
 * Syntax highlighted code renderable.
 * Uses highlight.js for tokenization and applies Rich-style themes.
 */
declare class Syntax implements Renderable {
    readonly code: string;
    readonly lexer: string;
    readonly options: SyntaxOptions;
    private readonly syntaxTheme;
    constructor(code: string, lexer: string, options?: SyntaxOptions);
    /**
     * Create Syntax from a file path (convenience method).
     */
    static fromPath(filePath: string, options?: SyntaxOptions): Syntax;
    __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult;
    /**
     * Parse highlight.js HTML output into styled tokens.
     */
    private parseHighlightedHtml;
    /**
     * Decode HTML entities to their character equivalents.
     */
    private decodeHtmlEntities;
    /**
     * Get style for a highlight.js scope/class.
     */
    private getStyleForScope;
    /**
     * Group tokens by line (split on newlines).
     */
    private groupTokensByLine;
}

interface SyntaxTheme {
    name: string;
    styles: Record<string, Style>;
    background?: string;
}
declare const MONOKAI: SyntaxTheme;
declare const DRACULA: SyntaxTheme;
declare const GITHUB_LIGHT: SyntaxTheme;
declare const ONE_DARK: SyntaxTheme;
declare const SYNTAX_THEMES: Record<string, SyntaxTheme>;
declare function getTheme(name: string): SyntaxTheme;
declare const MONOKAI_THEME: {
    keyword: Style;
    string: Style;
    number: Style;
    comment: Style;
    operator: Style;
    function: Style;
    class: Style;
    title: Style;
};

declare class Markdown implements Renderable {
    readonly markup: string;
    constructor(markup: string);
    __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult;
}

/** biome-ignore-all assist/source/organizeImports: false */

interface ProgressBarOptions {
    width?: number;
    completeStyle?: string;
    finishedStyle?: string;
    remainingStyle?: string;
    pulseStyle?: string;
    pulse?: boolean;
    completeChar?: string;
    remainingChar?: string;
}
/**
 * Visual progress bar component.
 * Supports customizable styles, pulse animation, and gradient colors.
 */
declare class ProgressBar implements Renderable {
    readonly total: number;
    readonly completed: number;
    readonly options: ProgressBarOptions;
    render(_arg0: number): void;
    private pulseOffset;
    private lastPulseTime;
    constructor(total?: number, completed?: number, options?: ProgressBarOptions);
    __rich_console__(console: Console, consoleOptions: ConsoleOptions): RenderResult;
}
/**
 * Compact progress indicator showing percentage.
 */
declare class PercentageColumn implements Renderable {
    readonly percentage: number;
    readonly style?: string | undefined;
    constructor(percentage: number, style?: string | undefined);
    __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult;
}
/**
 * Time elapsed display for progress tracking.
 */
declare class TimeElapsedColumn implements Renderable {
    readonly elapsedMs: number;
    readonly style?: string | undefined;
    constructor(elapsedMs: number, style?: string | undefined);
    __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult;
}
/**
 * Estimated time remaining display.
 */
declare class TimeRemainingColumn implements Renderable {
    readonly percentage: number;
    readonly elapsedMs: number;
    readonly style?: string | undefined;
    constructor(percentage: number, elapsedMs: number, style?: string | undefined);
    __rich_console__(_console: Console, _options: ConsoleOptions): RenderResult;
}

declare class Progress {
    private tasks;
    private taskIdCounter;
    private started;
    private refreshInterval;
    private lastRenderedLines;
    addTask(description: string, options?: {
        total?: number;
        completed?: number;
    }): number;
    update(taskId: number, options: {
        completed?: number;
        description?: string;
    }): void;
    start(): void;
    stop(): void;
    private refresh;
    private renderSimpleBar;
}

/**
 * Track progress of an iterable.
 */
declare function track<T>(sequence: Iterable<T> | T[], description?: string): Generator<T>;

/**
 * Spinner renderable - animated spinners for status display
 */
/** biome-ignore-all assist/source/organizeImports: false */

interface SpinnerOptions {
    text?: string;
    style?: string;
    speed?: number;
}
/**
 * A spinner animation that can be rendered with Live updates.
 */
declare class Spinner implements Renderable {
    readonly name: string;
    readonly frames: string[];
    readonly interval: number;
    text: string;
    style: string;
    speed: number;
    private startTime;
    private frameNoOffset;
    constructor(name?: string, options?: SpinnerOptions);
    /**
     * Render the spinner for a given time.
     */
    render(time: number): string;
    /**
     * Get the current frame without time advancement (for static rendering).
     */
    getCurrentFrame(): string;
    /**
     * Update spinner properties.
     */
    update(options: Partial<SpinnerOptions>): void;
    __rich_console__(_console: Console, _consoleOptions: ConsoleOptions): RenderResult;
}
/**
 * List all available spinner names.
 */
declare function listSpinners$1(): string[];

/**
 * Live display - updates content in place
 */
interface LiveOptions {
    refreshPerSecond?: number;
    transient?: boolean;
}
/**
 * Renders an auto-updating live display.
 *
 * @example
 * ```typescript
 * const live = new Live();
 *
 * await live.start(async (update) => {
 *   for (let i = 0; i <= 100; i++) {
 *     update(`Progress: ${i}%`);
 *     await sleep(50);
 *   }
 * });
 * ```
 */
declare class Live {
    private transient;
    private started;
    private refreshThread;
    private lastRenderedLines;
    private currentContent;
    constructor(options?: LiveOptions);
    /**
     * Check if live display is currently running.
     */
    get isStarted(): boolean;
    /**
     * Update the displayed content.
     */
    update(content: string): void;
    /**
     * Refresh the display with current content.
     */
    private refresh;
    /**
     * Start live display with a callback function.
     * The callback receives an update function to change the displayed content.
     */
    start(callback: (update: (content: string) => void) => Promise<void> | void): Promise<void>;
    /**
     * Stop live display.
     */
    stop(): void;
}
/**
 * Helper function to sleep for a given number of milliseconds.
 */
declare function sleep(ms: number): Promise<void>;

/**
 * Spinner animation definitions
 * Ported from Python Rich / cli-spinners
 */
interface SpinnerData {
    interval: number;
    frames: string[] | string;
}
declare const SPINNERS: Record<string, SpinnerData>;
/**
 * Get spinner data by name
 */
declare function getSpinner(name: string): SpinnerData | undefined;
/**
 * List all available spinner names
 */
declare function listSpinners(): string[];

declare class Color {
    private tc;
    constructor(color: string | tinycolor.ColorInput);
    static parse(color: string): Color;
    get hex(): string;
    get rgb(): {
        r: number;
        g: number;
        b: number;
    };
    get isDark(): boolean;
    get isLight(): boolean;
    contrast(other: Color): number;
    lighten(amount?: number): Color;
    darken(amount?: number): Color;
    /**
     * Returns a readable foreground color (black or white) for this background color.
     */
    getContrastColor(): Color;
}

/**
 * Emoji codes database - common emoji shortcodes
 * Subset of Python Rich's emoji database for practical use
 */
declare const EMOJI: Record<string, string>;
/**
 * Replace emoji shortcodes in text with actual emoji characters.
 * Shortcodes are in the format :emoji_name:
 */
declare function replaceEmoji(text: string): string;
/**
 * Get all available emoji names
 */
declare function listEmoji(): string[];
/**
 * Check if an emoji shortcode exists
 */
declare function hasEmoji(name: string): boolean;

type LogLevel = "debug" | "info" | "warn" | "error";
interface LogRecord {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
}
declare class RichHandler {
    private console;
    constructor(console?: Console);
    handle(record: LogRecord): void;
    private getLevelStyle;
}

declare class Logger {
    private handler;
    constructor(console?: Console);
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, context?: Record<string, any>): void;
    private log;
}

interface InspectOptions {
    title?: string;
    depth?: number;
    private?: boolean;
}
/**
 * Inspects an object and prints a formatted representation.
 */
declare function inspect(obj: any, options?: InspectOptions): void;

/** biome-ignore-all assist/source/organizeImports: biome-ignore assist/source/organizeImports */

declare const print: (...objects: any[]) => void;

export { Align, type BoxData, type BoxStyle, Color, type ColorSystem, Columns, Confirm, Console, type ConsoleOptions, DEFAULT_THEME, DRACULA, EMOJI, GITHUB_LIGHT, Grid, JSON, Layout, Live, Logger, MONOKAI, MONOKAI_THEME, Markdown, MarkupParser, ONE_DARK, Padding, Palette, Panel, PercentageColumn, Progress, ProgressBar, Prompt, type RGB, type RenderResult, type Renderable, RichHandler, Rule, SPINNERS, SYNTAX_THEMES, Segment, Spinner, type SpinnerData, type StandardColor, Status, Style, type StyleOptions, Syntax, type SyntaxTheme, Table, Text, Theme, TimeElapsedColumn, TimeRemainingColumn, Traceback, Tree, getBox, getSpinner, listSpinners as getSpinnerNames, getTheme, hasEmoji, inspect, install, installTracebackHandler, isRenderable, listBoxStyles, listEmoji, listSpinners$1 as listSpinners, print, replaceEmoji, sleep, track };
