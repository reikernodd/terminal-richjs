import process2 from 'process';
import wrapAnsi from 'wrap-ansi';
import terminalSize from 'terminal-size';
import os from 'os';
import stringWidth3 from 'string-width';
import chalk from 'chalk';
import tinycolor from 'tinycolor2';
import fs from 'fs';
import hljs from 'highlight.js';
import boxes from 'cli-boxes';
import readline from 'readline';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var Terminal = class {
  constructor() {
  }
  get width() {
    return terminalSize().columns;
  }
  get height() {
    return terminalSize().rows;
  }
  get isInteractive() {
    return !!process2.stdout.isTTY;
  }
  get isLegacyWindows() {
    return os.platform() === "win32" && !process2.env.WT_SESSION;
  }
  get colorSystem() {
    const env = process2.env;
    if (env.NO_COLOR) return "none";
    if (env.COLORTERM === "truecolor" || env.COLORTERM === "24bit") {
      return "truecolor";
    }
    if (this.isLegacyWindows) {
      return "standard";
    }
    if (env.TERM && env.TERM.includes("256")) {
      return "256";
    }
    return "standard";
  }
};
var Style = class _Style {
  /**
   * Apply this style to text (alias for render).
   */
  apply(text) {
    return this.render(text);
  }
  color;
  backgroundColor;
  bold;
  italic;
  underline;
  strikethrough;
  dim;
  reverse;
  blink;
  hidden;
  constructor(options = {}) {
    this.color = options.color;
    this.backgroundColor = options.backgroundColor;
    this.bold = options.bold;
    this.italic = options.italic;
    this.underline = options.underline;
    this.strikethrough = options.strikethrough;
    this.dim = options.dim;
    this.reverse = options.reverse;
    this.blink = options.blink;
    this.hidden = options.hidden;
  }
  static null() {
    return new _Style({});
  }
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
  static parse(styleString) {
    if (!styleString.trim()) return _Style.null();
    const options = {};
    const words = styleString.trim().split(/\s+/);
    let i = 0;
    while (i < words.length) {
      const word = words[i];
      if (word === "bold") {
        options.bold = true;
        i++;
        continue;
      }
      if (word === "italic") {
        options.italic = true;
        i++;
        continue;
      }
      if (word === "underline") {
        options.underline = true;
        i++;
        continue;
      }
      if (word === "strike" || word === "strikethrough") {
        options.strikethrough = true;
        i++;
        continue;
      }
      if (word === "dim") {
        options.dim = true;
        i++;
        continue;
      }
      if (word === "reverse") {
        options.reverse = true;
        i++;
        continue;
      }
      if (word === "blink") {
        options.blink = true;
        i++;
        continue;
      }
      if (word === "hidden") {
        options.hidden = true;
        i++;
        continue;
      }
      if (word === "on") {
        if (i + 1 < words.length) {
          const bgColor = _Style.parseColor(words[i + 1]);
          if (bgColor !== null) {
            options.backgroundColor = bgColor;
            i += 2;
            continue;
          }
        }
        i++;
        continue;
      }
      const color = _Style.parseColor(word);
      if (color !== null) {
        options.color = color;
        i++;
        continue;
      }
      i++;
    }
    return new _Style(options);
  }
  /**
   * Parse a single color value.
   * Supports hex (#ff0000), RGB (rgb(255,0,0)), 256-color (color(196)), and named colors.
   */
  static parseColor(word) {
    if (word.startsWith("#")) {
      if (/^#[0-9a-fA-F]{6}$/.test(word) || /^#[0-9a-fA-F]{3}$/.test(word)) {
        return word;
      }
      return null;
    }
    const rgbMatch = word.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgbMatch) {
      return {
        r: Math.min(255, parseInt(rgbMatch[1], 10)),
        g: Math.min(255, parseInt(rgbMatch[2], 10)),
        b: Math.min(255, parseInt(rgbMatch[3], 10))
      };
    }
    const color256Match = word.match(/^color\(\s*(\d+)\s*\)$/i);
    if (color256Match) {
      return Math.min(255, parseInt(color256Match[1], 10));
    }
    const namedColors = [
      "black",
      "red",
      "green",
      "yellow",
      "blue",
      "magenta",
      "cyan",
      "white",
      "gray",
      "grey",
      "blackBright",
      "redBright",
      "greenBright",
      "yellowBright",
      "blueBright",
      "magentaBright",
      "cyanBright",
      "whiteBright",
      // Underscore variants commonly used
      "bright_black",
      "bright_red",
      "bright_green",
      "bright_yellow",
      "bright_blue",
      "bright_magenta",
      "bright_cyan",
      "bright_white"
    ];
    let normalizedWord = word;
    if (word.startsWith("bright_")) {
      const base = word.slice(7);
      normalizedWord = `${base}Bright`;
    }
    if (namedColors.includes(word) || namedColors.includes(normalizedWord)) {
      return word;
    }
    if (/^[a-zA-Z]+$/.test(word)) {
      return word;
    }
    return null;
  }
  combine(other) {
    return new _Style({
      color: other.color ?? this.color,
      backgroundColor: other.backgroundColor ?? this.backgroundColor,
      bold: other.bold ?? this.bold,
      italic: other.italic ?? this.italic,
      underline: other.underline ?? this.underline,
      strikethrough: other.strikethrough ?? this.strikethrough,
      dim: other.dim ?? this.dim,
      reverse: other.reverse ?? this.reverse,
      blink: other.blink ?? this.blink,
      hidden: other.hidden ?? this.hidden
    });
  }
  render(text) {
    let result = chalk;
    if (this.color) {
      result = this.applyColor(result, this.color, false);
    }
    if (this.backgroundColor) {
      result = this.applyColor(result, this.backgroundColor, true);
    }
    if (this.bold) result = result.bold;
    if (this.italic) result = result.italic;
    if (this.underline) result = result.underline;
    if (this.strikethrough) result = result.strikethrough;
    if (this.dim) result = result.dim;
    if (this.reverse) result = result.inverse;
    if (this.blink) result = result.blink;
    if (this.hidden) result = result.hidden;
    return result(text);
  }
  /**
   * Apply a color to a chalk instance.
   */
  applyColor(chalkInstance, color, isBackground) {
    if (typeof color === "string") {
      if (color.startsWith("#")) {
        return isBackground ? chalkInstance.bgHex(color) : chalkInstance.hex(color);
      }
      let colorName = color;
      if (color.startsWith("bright_")) {
        const base = color.slice(7);
        colorName = `${base}Bright`;
      }
      if (isBackground) {
        const bgMethod = `bg${colorName.charAt(0).toUpperCase()}${colorName.slice(1)}`;
        if (bgMethod in chalkInstance) {
          return chalkInstance[bgMethod];
        }
        const altMethod = `bg${color.charAt(0).toUpperCase()}${color.slice(1)}`;
        if (altMethod in chalkInstance) {
          return chalkInstance[altMethod];
        }
      } else {
        if (colorName in chalkInstance) {
          return chalkInstance[colorName];
        }
        if (color in chalkInstance) {
          return chalkInstance[color];
        }
      }
      return chalkInstance;
    }
    if (this.isRGB(color)) {
      return isBackground ? chalkInstance.bgRgb(color.r, color.g, color.b) : chalkInstance.rgb(color.r, color.g, color.b);
    }
    if (typeof color === "number") {
      return isBackground ? chalkInstance.bgAnsi256(color) : chalkInstance.ansi256(color);
    }
    return chalkInstance;
  }
  isRGB(color) {
    return typeof color === "object" && color !== null && "r" in color && "g" in color && "b" in color;
  }
};

// src/core/segment.ts
var Segment = class _Segment {
  constructor(text, style = Style.null(), isControl = false) {
    this.text = text;
    this.style = style;
    this.isControl = isControl;
  }
  /**
   * Implementation of Renderable protocol.
   */
  __rich_console__(_console, _options) {
    return {
      segments: [this],
      width: this.cellLength()
    };
  }
  /**
   * Calculates the cell length of the text.
   */
  cellLength() {
    if (this.isControl) return 0;
    return stringWidth3(this.text);
  }
  /**
   * Renders the segment to an ANSI string.
   */
  render() {
    if (this.isControl) return this.text;
    if (typeof this.style?.render === "function") {
      return this.style.render(this.text);
    }
    return this.text;
  }
  /**
   * Splits the segment into lines.
   */
  splitLines(_allowEmpty = false) {
    const lines = this.text.split("\n");
    return lines.map((line) => {
      return [new _Segment(line, this.style, this.isControl)];
    });
  }
  /**
   * Creates a new Segment with modified properties.
   */
  clone(text, style, isControl) {
    return new _Segment(text ?? this.text, style ?? this.style, isControl ?? this.isControl);
  }
};
var Color = class _Color {
  tc;
  constructor(color) {
    this.tc = tinycolor(color);
  }
  static parse(color) {
    return new _Color(color);
  }
  get hex() {
    return this.tc.toHexString();
  }
  get rgb() {
    return this.tc.toRgb();
  }
  get isDark() {
    return this.tc.isDark();
  }
  get isLight() {
    return this.tc.isLight();
  }
  contrast(other) {
    return tinycolor.readability(this.tc, other.tc);
  }
  lighten(amount = 10) {
    return new _Color(this.tc.lighten(amount));
  }
  darken(amount = 10) {
    return new _Color(this.tc.darken(amount));
  }
  /**
   * Returns a readable foreground color (black or white) for this background color.
   */
  getContrastColor() {
    return this.isDark ? new _Color("#ffffff") : new _Color("#000000");
  }
};

// src/themes/palette.ts
var Palette = class _Palette {
  constructor(colors = {}) {
    this.colors = colors;
  }
  get(name) {
    return this.colors[name];
  }
  /**
   * Generates a simple palette from a primary color.
   */
  static fromPrimary(primary) {
    const p = new Color(primary);
    return new _Palette({
      primary: p.hex,
      secondary: p.lighten(20).hex,
      background: "#121212",
      surface: "#1e1e1e",
      text: "#ffffff",
      error: "#cf6679",
      success: "#03dac6",
      warning: "#bb86fc"
    });
  }
};
var DEFAULT_PALETTE = new Palette({
  primary: "#007bff",
  secondary: "#6c757d",
  success: "#28a745",
  info: "#17a2b8",
  warning: "#ffc107",
  danger: "#dc3545",
  light: "#f8f9fa",
  dark: "#343a40"
});

// src/themes/theme.ts
var Theme = class _Theme {
  constructor(styles = {}, palette) {
    this.styles = styles;
    this.palette = palette ?? DEFAULT_PALETTE;
  }
  palette;
  get(name) {
    const style = this.styles[name];
    if (style) {
      return typeof style === "string" ? this.parseWithPalette(style) : style;
    }
    const paletteColor = this.palette.get(name);
    if (paletteColor) {
      return new Style({ color: paletteColor });
    }
    return Style.null();
  }
  /**
   * Parses a style string replacing palette references.
   * e.g. "bold primary" -> "bold #007bff"
   */
  parseWithPalette(styleString) {
    const parts = styleString.split(" ");
    const resolvedParts = parts.map((part) => {
      const color = this.palette.get(part);
      if (color) return color;
      if (part.startsWith("on")) {
        const bgName = part.startsWith("on_") ? part.slice(3) : part.slice(2) || parts[parts.indexOf(part) + 1];
        const bgColor = this.palette.get(bgName);
        if (bgColor) return `on ${bgColor}`;
      }
      return part;
    });
    return Style.parse(resolvedParts.join(" "));
  }
  static fromPalette(palette) {
    return new _Theme({
      "danger": `bold ${palette.get("danger")}`,
      "success": `bold ${palette.get("success")}`,
      "warning": `bold ${palette.get("warning")}`,
      "info": `${palette.get("info")}`
    }, palette);
  }
};
var DEFAULT_THEME = new Theme({
  "none": Style.null(),
  "dim": Style.parse("dim"),
  "bright": Style.parse("bold"),
  // Semantic
  "danger": Style.parse("bold red"),
  "success": Style.parse("bold green"),
  "warning": Style.parse("bold yellow"),
  "info": Style.parse("cyan"),
  // Components
  "rule.line": Style.parse("green"),
  "repr.str": Style.parse("green"),
  "repr.brace": Style.parse("bold")
});

// src/core/markup.ts
var MarkupParser = class _MarkupParser {
  // Regex that matches standard tags [tag] and closing tags [/] or [/tag]
  // We use a non-greedy match for content inside brackets
  static TAG_REGEX = /\[(\/)?([\w\s#.,()]*?)\]/g;
  theme;
  constructor(theme) {
    this.theme = theme ?? DEFAULT_THEME;
  }
  parse(markup) {
    const segments = [];
    const styleStack = [Style.null()];
    let lastIndex = 0;
    let match;
    _MarkupParser.TAG_REGEX.lastIndex = 0;
    while ((match = _MarkupParser.TAG_REGEX.exec(markup)) !== null) {
      const fullMatch = match[0];
      const isClosing = !!match[1];
      const tagContent = match[2];
      const index = match.index;
      if (!isClosing && !tagContent) {
        continue;
      }
      if (index > lastIndex) {
        const text = markup.substring(lastIndex, index);
        segments.push(new Segment(text, styleStack[styleStack.length - 1]));
      }
      if (isClosing) {
        if (styleStack.length > 1) {
          styleStack.pop();
        }
      } else {
        const currentStyle = styleStack[styleStack.length - 1];
        let nextStyle = this.theme.get(tagContent);
        if (nextStyle === Style.null() && !this.theme.styles[tagContent]) {
          nextStyle = Style.parse(tagContent);
        } else if (this.theme.styles[tagContent]) ;
        if (tagContent.includes(" ")) {
          nextStyle = Style.parse(tagContent);
        } else {
          const themeStyle = this.theme.styles[tagContent];
          if (themeStyle) {
            nextStyle = typeof themeStyle === "string" ? Style.parse(themeStyle) : themeStyle;
          } else {
            nextStyle = Style.parse(tagContent);
          }
        }
        const newStyle = currentStyle.combine(nextStyle);
        styleStack.push(newStyle);
      }
      lastIndex = index + fullMatch.length;
    }
    if (lastIndex < markup.length) {
      const text = markup.substring(lastIndex);
      segments.push(new Segment(text, styleStack[styleStack.length - 1]));
    }
    return segments.filter((s) => s.text.length > 0);
  }
};

// src/types/renderable.ts
function isRenderable(obj) {
  return typeof obj === "object" && obj !== null && "__rich_console__" in obj && typeof obj.__rich_console__ === "function";
}

// src/traceback/trace.ts
var Trace = class {
  static parse(error) {
    if (!error.stack) return [];
    const lines = error.stack.split("\n");
    const frames = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith("at ")) continue;
      let functionName = "";
      let location = "";
      if (line.includes("(")) {
        const parts = line.substring(3).split(" (");
        functionName = parts[0];
        location = parts[1].slice(0, -1);
      } else {
        location = line.substring(3);
      }
      const locParts = location.split(":");
      const columnNumber = parseInt(locParts.pop() || "0");
      const lineNumber = parseInt(locParts.pop() || "0");
      const filePath = locParts.join(":");
      frames.push({
        functionName: functionName || "<anonymous>",
        filePath,
        lineNumber,
        columnNumber
      });
    }
    return frames;
  }
};

// src/syntax/theme.ts
var MONOKAI = {
  name: "monokai",
  background: "#272822",
  styles: {
    // Keywords and control flow
    keyword: Style.parse("#f92672 bold"),
    built_in: Style.parse("#66d9ef"),
    type: Style.parse("#66d9ef italic"),
    literal: Style.parse("#ae81ff"),
    // Values
    number: Style.parse("#ae81ff"),
    string: Style.parse("#e6db74"),
    regexp: Style.parse("#e6db74"),
    symbol: Style.parse("#ae81ff"),
    // Comments and docs
    comment: Style.parse("#75715e dim"),
    doctag: Style.parse("#75715e"),
    meta: Style.parse("#75715e"),
    // Functions and classes
    function: Style.parse("#a6e22e"),
    title: Style.parse("#a6e22e"),
    "title.function": Style.parse("#a6e22e"),
    "title.class": Style.parse("#a6e22e italic"),
    "title.class.inherited": Style.parse("#a6e22e"),
    // Variables and parameters
    params: Style.parse("#fd971f italic"),
    variable: Style.parse("#f8f8f2"),
    "variable.language": Style.parse("#fd971f"),
    "variable.constant": Style.parse("#ae81ff"),
    // Properties and attributes
    property: Style.parse("#66d9ef"),
    attr: Style.parse("#a6e22e"),
    attribute: Style.parse("#a6e22e"),
    // Operators and punctuation
    operator: Style.parse("#f92672"),
    punctuation: Style.parse("#f8f8f2"),
    // Misc
    tag: Style.parse("#f92672"),
    name: Style.parse("#a6e22e"),
    "selector-tag": Style.parse("#f92672"),
    "selector-class": Style.parse("#a6e22e"),
    "selector-id": Style.parse("#a6e22e"),
    // Template literals
    "template-variable": Style.parse("#e6db74"),
    "template-tag": Style.parse("#f92672"),
    subst: Style.parse("#f8f8f2")
  }
};
var DRACULA = {
  name: "dracula",
  background: "#282a36",
  styles: {
    keyword: Style.parse("#ff79c6 bold"),
    built_in: Style.parse("#8be9fd"),
    type: Style.parse("#8be9fd italic"),
    literal: Style.parse("#bd93f9"),
    number: Style.parse("#bd93f9"),
    string: Style.parse("#f1fa8c"),
    regexp: Style.parse("#f1fa8c"),
    comment: Style.parse("#6272a4 dim"),
    function: Style.parse("#50fa7b"),
    title: Style.parse("#50fa7b"),
    "title.function": Style.parse("#50fa7b"),
    "title.class": Style.parse("#50fa7b italic"),
    params: Style.parse("#ffb86c italic"),
    variable: Style.parse("#f8f8f2"),
    property: Style.parse("#8be9fd"),
    attr: Style.parse("#50fa7b"),
    operator: Style.parse("#ff79c6"),
    tag: Style.parse("#ff79c6")
  }
};
var GITHUB_LIGHT = {
  name: "github",
  styles: {
    keyword: Style.parse("#d73a49 bold"),
    built_in: Style.parse("#005cc5"),
    type: Style.parse("#005cc5"),
    literal: Style.parse("#005cc5"),
    number: Style.parse("#005cc5"),
    string: Style.parse("#032f62"),
    regexp: Style.parse("#032f62"),
    comment: Style.parse("#6a737d dim"),
    function: Style.parse("#6f42c1"),
    title: Style.parse("#6f42c1"),
    "title.function": Style.parse("#6f42c1"),
    "title.class": Style.parse("#6f42c1 bold"),
    params: Style.parse("#24292e"),
    variable: Style.parse("#24292e"),
    property: Style.parse("#005cc5"),
    attr: Style.parse("#6f42c1"),
    operator: Style.parse("#d73a49"),
    tag: Style.parse("#22863a")
  }
};
var ONE_DARK = {
  name: "one-dark",
  background: "#282c34",
  styles: {
    keyword: Style.parse("#c678dd bold"),
    built_in: Style.parse("#e5c07b"),
    type: Style.parse("#e5c07b italic"),
    literal: Style.parse("#d19a66"),
    number: Style.parse("#d19a66"),
    string: Style.parse("#98c379"),
    regexp: Style.parse("#98c379"),
    comment: Style.parse("#5c6370 dim"),
    function: Style.parse("#61afef"),
    title: Style.parse("#61afef"),
    "title.function": Style.parse("#61afef"),
    "title.class": Style.parse("#e5c07b bold"),
    params: Style.parse("#abb2bf italic"),
    variable: Style.parse("#e06c75"),
    property: Style.parse("#e06c75"),
    attr: Style.parse("#d19a66"),
    operator: Style.parse("#56b6c2"),
    tag: Style.parse("#e06c75")
  }
};
var SYNTAX_THEMES = {
  monokai: MONOKAI,
  dracula: DRACULA,
  github: GITHUB_LIGHT,
  "github-light": GITHUB_LIGHT,
  "one-dark": ONE_DARK,
  atom: ONE_DARK
};
function getTheme(name) {
  return SYNTAX_THEMES[name] ?? MONOKAI;
}
var MONOKAI_THEME = {
  keyword: Style.parse("bold magenta"),
  string: Style.parse("yellow"),
  number: Style.parse("magenta"),
  comment: Style.parse("dim white"),
  operator: Style.parse("bold white"),
  function: Style.parse("green"),
  class: Style.parse("bold blue"),
  title: Style.parse("bold white")
};
var Syntax = class _Syntax {
  constructor(code, lexer, options = {}) {
    this.code = code;
    this.lexer = lexer;
    this.options = options;
    this.syntaxTheme = getTheme(options.theme ?? "monokai");
  }
  syntaxTheme;
  /**
   * Create Syntax from a file path (convenience method).
   */
  static fromPath(filePath, options = {}) {
    const fs2 = __require("fs");
    const path = __require("path");
    const code = fs2.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath).slice(1);
    const lexerMap = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      rb: "ruby",
      rs: "rust",
      go: "go",
      java: "java",
      cpp: "cpp",
      c: "c",
      h: "c",
      hpp: "cpp",
      cs: "csharp",
      php: "php",
      sh: "bash",
      bash: "bash",
      zsh: "bash",
      md: "markdown",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      toml: "ini",
      css: "css",
      scss: "scss",
      html: "html",
      xml: "xml",
      sql: "sql"
    };
    const lexer = lexerMap[ext] ?? ext;
    return new _Syntax(code, lexer, options);
  }
  __rich_console__(_console, _options) {
    const segments = [];
    const startLine = this.options.startLine ?? 1;
    const showLineNumbers = this.options.lineNumbers ?? false;
    const highlightLines = new Set(this.options.highlightLines ?? []);
    let highlighted;
    try {
      highlighted = hljs.highlight(this.code, { language: this.lexer });
    } catch {
      highlighted = hljs.highlightAuto(this.code);
    }
    const tokens = this.parseHighlightedHtml(highlighted.value);
    const lines = this.groupTokensByLine(tokens);
    const lastLineNumber = startLine + lines.length - 1;
    const lineNumberWidth = showLineNumbers ? String(lastLineNumber).length + 1 : 0;
    let maxWidth = 0;
    lines.forEach((lineTokens, i) => {
      const lineNumber = startLine + i;
      const isHighlighted = highlightLines.has(lineNumber);
      if (isHighlighted) {
        segments.push(new Segment("\u2771 ", Style.parse("#ff5555 bold")));
      } else if (showLineNumbers) {
        segments.push(new Segment("  ", Style.null()));
      }
      if (showLineNumbers) {
        const lineNumStr = String(lineNumber).padStart(lineNumberWidth - 1);
        const lineNumStyle = isHighlighted ? Style.parse("#ff5555 bold") : Style.parse("#6e7681 dim");
        segments.push(new Segment(`${lineNumStr} \u2502 `, lineNumStyle));
      }
      let lineWidth = 0;
      for (const token of lineTokens) {
        let style = token.style;
        if (isHighlighted) {
          style = style.combine(Style.parse("on #3a1d1d"));
        }
        segments.push(new Segment(token.text, style));
        lineWidth += stringWidth3(token.text);
      }
      segments.push(new Segment("\n", Style.null(), true));
      const totalLineWidth = lineWidth + (showLineNumbers ? lineNumberWidth + 5 : 0);
      if (totalLineWidth > maxWidth) maxWidth = totalLineWidth;
    });
    return {
      segments,
      width: maxWidth
    };
  }
  /**
   * Parse highlight.js HTML output into styled tokens.
   */
  parseHighlightedHtml(html) {
    const tokens = [];
    const processHtml = (input, inheritedScope = []) => {
      let remaining = input;
      while (remaining.length > 0) {
        const openMatch = remaining.match(/^<span class="hljs-([^"]+)">/);
        if (openMatch) {
          remaining = remaining.slice(openMatch[0].length);
          const scope = openMatch[1];
          let depth = 1;
          let innerEnd = 0;
          for (let i = 0; i < remaining.length; i++) {
            if (remaining.slice(i).startsWith("<span")) {
              depth++;
            } else if (remaining.slice(i).startsWith("</span>")) {
              depth--;
              if (depth === 0) {
                innerEnd = i;
                break;
              }
            }
          }
          const innerContent = remaining.slice(0, innerEnd);
          remaining = remaining.slice(innerEnd + "</span>".length);
          const newScope = [...inheritedScope, scope];
          processHtml(innerContent, newScope);
          continue;
        }
        const textMatch = remaining.match(/^([^<]+)/);
        if (textMatch) {
          const text = this.decodeHtmlEntities(textMatch[1]);
          const scope = inheritedScope[inheritedScope.length - 1] ?? "";
          const style = this.getStyleForScope(scope);
          tokens.push({ text, style });
          remaining = remaining.slice(textMatch[0].length);
          continue;
        }
        const tagMatch = remaining.match(/^<[^>]+>/);
        if (tagMatch) {
          remaining = remaining.slice(tagMatch[0].length);
          continue;
        }
        if (remaining.length > 0) {
          tokens.push({ text: remaining[0], style: Style.null() });
          remaining = remaining.slice(1);
        }
      }
    };
    processHtml(html);
    return tokens;
  }
  /**
   * Decode HTML entities to their character equivalents.
   */
  decodeHtmlEntities(text) {
    return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
  }
  /**
   * Get style for a highlight.js scope/class.
   */
  getStyleForScope(scope) {
    if (!scope) return Style.null();
    if (this.syntaxTheme.styles[scope]) {
      return this.syntaxTheme.styles[scope];
    }
    const parts = scope.split(".");
    for (let i = parts.length - 1; i >= 0; i--) {
      const partialScope = parts.slice(0, i + 1).join(".");
      if (this.syntaxTheme.styles[partialScope]) {
        return this.syntaxTheme.styles[partialScope];
      }
    }
    if (this.syntaxTheme.styles[parts[0]]) {
      return this.syntaxTheme.styles[parts[0]];
    }
    return Style.null();
  }
  /**
   * Group tokens by line (split on newlines).
   */
  groupTokensByLine(tokens) {
    const lines = [[]];
    for (const token of tokens) {
      const parts = token.text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          lines.push([]);
        }
        if (parts[i]) {
          lines[lines.length - 1].push({ text: parts[i], style: token.style });
        }
      }
    }
    return lines;
  }
};

// src/traceback/traceback.ts
var Traceback = class {
  constructor(error, options = {}) {
    this.error = error;
    this.options = options;
    this.frames = Trace.parse(error);
  }
  frames;
  __rich_console__(console, consoleOptions) {
    const segments = [];
    const extraLines = this.options.extraLines ?? 3;
    const theme = this.options.theme ?? "monokai";
    const suppressInternal = this.options.suppressInternal ?? true;
    const maxFrames = this.options.maxFrames ?? 100;
    const width = consoleOptions.width ?? console.width;
    segments.push(new Segment("\n", Style.null(), true));
    const headerStyle = Style.parse("#ff5555 bold");
    segments.push(new Segment("Traceback", headerStyle));
    segments.push(new Segment(" (most recent call last)\n", Style.parse("dim")));
    segments.push(new Segment("\n", Style.null(), true));
    let filteredFrames = this.frames;
    if (suppressInternal) {
      filteredFrames = filteredFrames.filter(
        (f) => !f.filePath.startsWith("node:") && !f.filePath.includes("node_modules")
      );
    }
    filteredFrames = filteredFrames.slice(0, maxFrames);
    for (const frame of filteredFrames) {
      const frameHeaderStyle = Style.parse("#6e7681");
      segments.push(new Segment("  File ", frameHeaderStyle));
      segments.push(new Segment(`"${frame.filePath}"`, Style.parse("#61afef")));
      segments.push(new Segment(", line ", frameHeaderStyle));
      segments.push(new Segment(String(frame.lineNumber), Style.parse("#e5c07b bold")));
      segments.push(new Segment(", in ", frameHeaderStyle));
      segments.push(new Segment(frame.functionName, Style.parse("#98c379 italic")));
      segments.push(new Segment("\n", Style.null(), true));
      let codeSnippet = "";
      try {
        if (fs.existsSync(frame.filePath)) {
          const content = fs.readFileSync(frame.filePath, "utf-8");
          const lines = content.split("\n");
          const start = Math.max(0, frame.lineNumber - extraLines - 1);
          const end = Math.min(lines.length, frame.lineNumber + extraLines);
          codeSnippet = lines.slice(start, end).join("\n");
          const ext = frame.filePath.split(".").pop() ?? "txt";
          const lexerMap = {
            ts: "typescript",
            tsx: "typescript",
            js: "javascript",
            jsx: "javascript",
            py: "python",
            rb: "ruby",
            rs: "rust",
            go: "go"
          };
          const lexer = lexerMap[ext] ?? ext;
          const syntax = new Syntax(codeSnippet, lexer, {
            theme,
            lineNumbers: true,
            startLine: start + 1,
            highlightLines: [frame.lineNumber]
          });
          const syntaxResult = syntax.__rich_console__(console, {
            ...consoleOptions,
            width: width - 4
          });
          segments.push(new Segment("\n", Style.null(), true));
          for (const seg of syntaxResult.segments) {
            if (seg.isControl && seg.text === "\n") {
              segments.push(seg);
              segments.push(new Segment("    "));
            } else {
              segments.push(seg);
            }
          }
        }
      } catch {
        segments.push(new Segment("    ", Style.null()));
        segments.push(new Segment("[source not available]", Style.parse("dim italic")));
        segments.push(new Segment("\n", Style.null(), true));
      }
      segments.push(new Segment("\n", Style.null(), true));
    }
    const errorNameStyle = Style.parse("#ff5555 bold");
    const errorMsgStyle = Style.parse("#ff5555");
    segments.push(new Segment(this.error.name, errorNameStyle));
    segments.push(new Segment(": ", Style.parse("dim")));
    segments.push(new Segment(this.error.message, errorMsgStyle));
    segments.push(new Segment("\n", Style.null(), true));
    return { segments, width };
  }
};
function installTracebackHandler(options = {}) {
  const console = new Console();
  process.on("uncaughtException", (error) => {
    const traceback = new Traceback(error, options);
    console.print(traceback);
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const traceback = new Traceback(error, options);
    console.print(traceback);
    process.exit(1);
  });
}

// src/utils/render-utils.ts
function getRenderResult(renderable, console, options) {
  const result = renderable.__rich_console__(console, options);
  if ("segments" in result) {
    return result;
  }
  return {
    segments: Array.from(result),
    width: options.width
    // approximation
  };
}

// src/status/spinners.ts
var SPINNERS = {
  dots: {
    interval: 80,
    frames: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F"
  },
  dots2: {
    interval: 80,
    frames: "\u28FE\u28FD\u28FB\u28BF\u287F\u28DF\u28EF\u28F7"
  },
  dots3: {
    interval: 80,
    frames: "\u280B\u2819\u281A\u281E\u2816\u2826\u2834\u2832\u2833\u2813"
  },
  line: {
    interval: 130,
    frames: ["-", "\\", "|", "/"]
  },
  line2: {
    interval: 100,
    frames: "\u2802-\u2013\u2014\u2013-"
  },
  pipe: {
    interval: 100,
    frames: "\u2524\u2518\u2534\u2514\u251C\u250C\u252C\u2510"
  },
  simpleDots: {
    interval: 400,
    frames: [".  ", ".. ", "...", "   "]
  },
  simpleDotsScrolling: {
    interval: 200,
    frames: [".  ", ".. ", "...", " ..", "  .", "   "]
  },
  star: {
    interval: 70,
    frames: "\u2736\u2738\u2739\u273A\u2739\u2737"
  },
  star2: {
    interval: 80,
    frames: "+x*"
  },
  flip: {
    interval: 70,
    frames: "___-``'\xB4-___"
  },
  hamburger: {
    interval: 100,
    frames: "\u2631\u2632\u2634"
  },
  growVertical: {
    interval: 120,
    frames: "\u2581\u2583\u2584\u2585\u2586\u2587\u2586\u2585\u2584\u2583"
  },
  growHorizontal: {
    interval: 120,
    frames: "\u258F\u258E\u258D\u258C\u258B\u258A\u2589\u258A\u258B\u258C\u258D\u258E"
  },
  balloon: {
    interval: 140,
    frames: " .oO@* "
  },
  balloon2: {
    interval: 120,
    frames: ".oO\xB0Oo."
  },
  noise: {
    interval: 100,
    frames: "\u2593\u2592\u2591"
  },
  bounce: {
    interval: 120,
    frames: "\u2801\u2802\u2804\u2802"
  },
  boxBounce: {
    interval: 120,
    frames: "\u2596\u2598\u259D\u2597"
  },
  boxBounce2: {
    interval: 100,
    frames: "\u258C\u2580\u2590\u2584"
  },
  triangle: {
    interval: 50,
    frames: "\u25E2\u25E3\u25E4\u25E5"
  },
  arc: {
    interval: 100,
    frames: "\u25DC\u25E0\u25DD\u25DE\u25E1\u25DF"
  },
  circle: {
    interval: 120,
    frames: "\u25E1\u2299\u25E0"
  },
  squareCorners: {
    interval: 180,
    frames: "\u25F0\u25F3\u25F2\u25F1"
  },
  circleQuarters: {
    interval: 120,
    frames: "\u25F4\u25F7\u25F6\u25F5"
  },
  circleHalves: {
    interval: 50,
    frames: "\u25D0\u25D3\u25D1\u25D2"
  },
  toggle: {
    interval: 250,
    frames: "\u22B6\u22B7"
  },
  toggle2: {
    interval: 80,
    frames: "\u25AB\u25AA"
  },
  toggle3: {
    interval: 120,
    frames: "\u25A1\u25A0"
  },
  arrow: {
    interval: 100,
    frames: "\u2190\u2196\u2191\u2197\u2192\u2198\u2193\u2199"
  },
  arrow3: {
    interval: 120,
    frames: ["\u25B9\u25B9\u25B9\u25B9\u25B9", "\u25B8\u25B9\u25B9\u25B9\u25B9", "\u25B9\u25B8\u25B9\u25B9\u25B9", "\u25B9\u25B9\u25B8\u25B9\u25B9", "\u25B9\u25B9\u25B9\u25B8\u25B9", "\u25B9\u25B9\u25B9\u25B9\u25B8"]
  },
  bouncingBar: {
    interval: 80,
    frames: [
      "[    ]",
      "[=   ]",
      "[==  ]",
      "[=== ]",
      "[ ===]",
      "[  ==]",
      "[   =]",
      "[    ]",
      "[   =]",
      "[  ==]",
      "[ ===]",
      "[====]",
      "[=== ]",
      "[==  ]",
      "[=   ]"
    ]
  },
  bouncingBall: {
    interval: 80,
    frames: [
      "( \u25CF    )",
      "(  \u25CF   )",
      "(   \u25CF  )",
      "(    \u25CF )",
      "(     \u25CF)",
      "(    \u25CF )",
      "(   \u25CF  )",
      "(  \u25CF   )",
      "( \u25CF    )",
      "(\u25CF     )"
    ]
  },
  smiley: {
    interval: 200,
    frames: ["\u{1F604} ", "\u{1F61D} "]
  },
  monkey: {
    interval: 300,
    frames: ["\u{1F648} ", "\u{1F648} ", "\u{1F649} ", "\u{1F64A} "]
  },
  hearts: {
    interval: 100,
    frames: ["\u{1F49B} ", "\u{1F499} ", "\u{1F49C} ", "\u{1F49A} ", "\u2764\uFE0F "]
  },
  clock: {
    interval: 100,
    frames: ["\u{1F55B} ", "\u{1F550} ", "\u{1F551} ", "\u{1F552} ", "\u{1F553} ", "\u{1F554} ", "\u{1F555} ", "\u{1F556} ", "\u{1F557} ", "\u{1F558} ", "\u{1F559} ", "\u{1F55A} "]
  },
  earth: {
    interval: 180,
    frames: ["\u{1F30D} ", "\u{1F30E} ", "\u{1F30F} "]
  },
  moon: {
    interval: 80,
    frames: ["\u{1F311} ", "\u{1F312} ", "\u{1F313} ", "\u{1F314} ", "\u{1F315} ", "\u{1F316} ", "\u{1F317} ", "\u{1F318} "]
  },
  runner: {
    interval: 140,
    frames: ["\u{1F6B6} ", "\u{1F3C3} "]
  },
  weather: {
    interval: 100,
    frames: [
      "\u2600\uFE0F ",
      "\u{1F324} ",
      "\u26C5\uFE0F ",
      "\u{1F325} ",
      "\u2601\uFE0F ",
      "\u{1F327} ",
      "\u{1F328} ",
      "\u26C8 ",
      "\u{1F327} ",
      "\u2601\uFE0F ",
      "\u{1F325} ",
      "\u26C5\uFE0F ",
      "\u{1F324} ",
      "\u2600\uFE0F "
    ]
  },
  christmas: {
    interval: 400,
    frames: "\u{1F332}\u{1F384}"
  },
  point: {
    interval: 125,
    frames: ["\u2219\u2219\u2219", "\u25CF\u2219\u2219", "\u2219\u25CF\u2219", "\u2219\u2219\u25CF", "\u2219\u2219\u2219"]
  },
  layer: {
    interval: 150,
    frames: "-=\u2261"
  },
  aesthetic: {
    interval: 80,
    frames: [
      "\u25B0\u25B1\u25B1\u25B1\u25B1\u25B1\u25B1",
      "\u25B0\u25B0\u25B1\u25B1\u25B1\u25B1\u25B1",
      "\u25B0\u25B0\u25B0\u25B1\u25B1\u25B1\u25B1",
      "\u25B0\u25B0\u25B0\u25B0\u25B1\u25B1\u25B1",
      "\u25B0\u25B0\u25B0\u25B0\u25B0\u25B1\u25B1",
      "\u25B0\u25B0\u25B0\u25B0\u25B0\u25B0\u25B1",
      "\u25B0\u25B0\u25B0\u25B0\u25B0\u25B0\u25B0",
      "\u25B0\u25B1\u25B1\u25B1\u25B1\u25B1\u25B1"
    ]
  }
};
function getSpinner(name) {
  return SPINNERS[name];
}
function listSpinners() {
  return Object.keys(SPINNERS);
}

// src/status/spinner.ts
var Spinner = class {
  name;
  frames;
  interval;
  text;
  style;
  speed;
  startTime = null;
  frameNoOffset = 0;
  constructor(name = "dots", options = {}) {
    const spinner = SPINNERS[name];
    if (!spinner) {
      throw new Error(`No spinner called '${name}'. Use listSpinners() to see available spinners.`);
    }
    this.name = name;
    this.frames = typeof spinner.frames === "string" ? [...spinner.frames] : [...spinner.frames];
    this.interval = spinner.interval;
    this.text = options.text ?? "";
    this.style = options.style ?? "green";
    this.speed = options.speed ?? 1;
  }
  /**
   * Render the spinner for a given time.
   */
  render(time) {
    if (this.startTime === null) {
      this.startTime = time;
    }
    const frameNo = (time - this.startTime) * this.speed / (this.interval / 1e3) + this.frameNoOffset;
    const frame = this.frames[Math.floor(frameNo) % this.frames.length];
    const styledFrame = Style.parse(this.style).apply(frame);
    if (this.text) {
      return `${styledFrame} ${this.text}`;
    }
    return styledFrame;
  }
  /**
   * Get the current frame without time advancement (for static rendering).
   */
  getCurrentFrame() {
    const now = Date.now() / 1e3;
    return this.render(now);
  }
  /**
   * Update spinner properties.
   */
  update(options) {
    if (options.text !== void 0) this.text = options.text;
    if (options.style !== void 0) this.style = options.style;
    if (options.speed !== void 0) {
      this.frameNoOffset = this.startTime !== null ? (Date.now() / 1e3 - this.startTime) * this.speed / (this.interval / 1e3) + this.frameNoOffset : 0;
      this.startTime = Date.now() / 1e3;
      this.speed = options.speed;
    }
  }
  __rich_console__(_console, _consoleOptions) {
    const frame = this.getCurrentFrame();
    return {
      segments: [new Segment(`${frame}
`, Style.null())],
      width: frame.length
    };
  }
};
function listSpinners2() {
  return Object.keys(SPINNERS);
}

// src/status/status.ts
var Status = class {
  spinner;
  message;
  interval = null;
  started = false;
  lastRenderedLines = 0;
  constructor(message, options = {}) {
    this.message = message;
    this.spinner = new Spinner(options.spinnerName ?? "dots");
  }
  start() {
    if (this.started) return;
    this.started = true;
    process.stdout.write("\x1B[?25l");
    this.interval = setInterval(() => {
      this.refresh();
    }, this.spinner.interval);
    this.refresh();
  }
  stop() {
    if (!this.started) return;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write("\x1B[2K\n");
      }
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
    }
    process.stdout.write("\x1B[?25h");
    this.started = false;
  }
  update(message) {
    this.message = message;
    if (this.started) {
      this.refresh();
    }
  }
  refresh() {
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write("\x1B[2K\n");
      }
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
    }
    const frame = this.spinner.getCurrentFrame();
    const output = `${frame} ${this.message}
`;
    this.lastRenderedLines = 1;
    process.stdout.write(output);
  }
};

// src/console/console.ts
var Console = class {
  error(message) {
    const text = String(message);
    process2.stderr.write(`\x1B[31m${text}\x1B[0m
`);
  }
  terminal;
  markupParser;
  options;
  theme;
  constructor(options = {}) {
    this.options = options;
    this.terminal = new Terminal();
    this.theme = options.theme ?? DEFAULT_THEME;
    this.markupParser = new MarkupParser(this.theme);
  }
  get width() {
    return this.options.width ?? this.terminal.width;
  }
  get height() {
    return this.options.height ?? this.terminal.height;
  }
  /**
   * Prints objects to the console.
   */
  print(...objects) {
    const lastObj = objects[objects.length - 1];
    let printObjects = objects;
    let options = {};
    if (objects.length > 1 && typeof lastObj === "object" && lastObj !== null && !isRenderable(lastObj) && ("style" in lastObj || "markup" in lastObj)) {
      options = objects.pop();
      printObjects = objects;
    }
    const output = printObjects.map((obj) => {
      if (typeof obj === "string") {
        return this.renderString(obj, options.markup ?? true);
      }
      if (isRenderable(obj)) {
        return this.render(obj);
      }
      return String(obj);
    }).join(" ");
    this.write(`${output}
`);
  }
  /**
   * Prints a formatted exception.
   */
  printException(error) {
    const traceback = new Traceback(error);
    this.print(traceback);
  }
  /**
   * Displays a status spinner.
   */
  status(message, options = {}) {
    return new Status(message, { spinnerName: options.spinner, ...options });
  }
  /**
   * Run a task with a status spinner.
   */
  async withStatus(message, task, options = {}) {
    const status = new Status(message, { spinnerName: options.spinner });
    status.start();
    try {
      return await task(status);
    } finally {
      status.stop();
    }
  }
  /**
   * Renders a renderable object to a string.
   */
  render(renderable) {
    const result = getRenderResult(renderable, this, this.options);
    return result.segments.map((s) => s.render()).join("");
  }
  /**
   * Internal string rendering with markup and wrapping.
   */
  renderString(text, markup = true) {
    const segments = markup ? this.markupParser.parse(text) : [new Segment(text)];
    const rendered = segments.map((s) => s.render()).join("");
    return wrapAnsi(rendered, this.width, { hard: true });
  }
  /**
   * Low-level write to stdout.
   */
  write(text) {
    process2.stdout.write(text);
  }
};
var Text = class {
  constructor(content, style = Style.null(), justify = "left", overflow = "fold", noWrap = false) {
    this.style = style;
    this.justify = justify;
    this.overflow = overflow;
    this.noWrap = noWrap;
    if (typeof content === "string") {
      const parser = new MarkupParser();
      this.segments = parser.parse(content);
    } else {
      this.segments = content;
    }
  }
  segments;
  __rich_console__(console, options) {
    const width = options.width ?? console.width;
    const text = this.segments.map((s) => s.render()).join("");
    let wrapped = text;
    if (!this.noWrap) {
      wrapped = wrapAnsi(text, width, { hard: true, trim: false });
    }
    const resultSegments = wrapped.split("\n").flatMap((line) => {
      return [new Segment(line), new Segment("\n", Style.null(), true)];
    });
    return {
      segments: resultSegments,
      width
    };
  }
};
var CUSTOM_BOXES = {
  // Rounded corners (may not be in all versions of cli-boxes)
  rounded: {
    topLeft: "\u256D",
    top: "\u2500",
    topRight: "\u256E",
    right: "\u2502",
    bottomRight: "\u256F",
    bottom: "\u2500",
    bottomLeft: "\u2570",
    left: "\u2502",
    topMid: "\u252C",
    midMid: "\u253C",
    bottomMid: "\u2534",
    leftMid: "\u251C",
    rightMid: "\u2524",
    mid: "\u2500",
    verticalMid: "\u2502"
  },
  round: {
    topLeft: "\u256D",
    top: "\u2500",
    topRight: "\u256E",
    right: "\u2502",
    bottomRight: "\u256F",
    bottom: "\u2500",
    bottomLeft: "\u2570",
    left: "\u2502",
    topMid: "\u252C",
    midMid: "\u253C",
    bottomMid: "\u2534",
    leftMid: "\u251C",
    rightMid: "\u2524",
    mid: "\u2500",
    verticalMid: "\u2502"
  },
  // Heavy/bold lines
  heavy: {
    topLeft: "\u250F",
    top: "\u2501",
    topRight: "\u2513",
    right: "\u2503",
    bottomRight: "\u251B",
    bottom: "\u2501",
    bottomLeft: "\u2517",
    left: "\u2503",
    topMid: "\u2533",
    midMid: "\u254B",
    bottomMid: "\u253B",
    leftMid: "\u2523",
    rightMid: "\u252B",
    mid: "\u2501",
    verticalMid: "\u2503"
  },
  // Double lines
  double: {
    topLeft: "\u2554",
    top: "\u2550",
    topRight: "\u2557",
    right: "\u2551",
    bottomRight: "\u255D",
    bottom: "\u2550",
    bottomLeft: "\u255A",
    left: "\u2551",
    topMid: "\u2566",
    midMid: "\u256C",
    bottomMid: "\u2569",
    leftMid: "\u2560",
    rightMid: "\u2563",
    mid: "\u2550",
    verticalMid: "\u2551"
  },
  // Single/square lines
  single: {
    topLeft: "\u250C",
    top: "\u2500",
    topRight: "\u2510",
    right: "\u2502",
    bottomRight: "\u2518",
    bottom: "\u2500",
    bottomLeft: "\u2514",
    left: "\u2502",
    topMid: "\u252C",
    midMid: "\u253C",
    bottomMid: "\u2534",
    leftMid: "\u251C",
    rightMid: "\u2524",
    mid: "\u2500",
    verticalMid: "\u2502"
  },
  square: {
    topLeft: "\u250C",
    top: "\u2500",
    topRight: "\u2510",
    right: "\u2502",
    bottomRight: "\u2518",
    bottom: "\u2500",
    bottomLeft: "\u2514",
    left: "\u2502",
    topMid: "\u252C",
    midMid: "\u253C",
    bottomMid: "\u2534",
    leftMid: "\u251C",
    rightMid: "\u2524",
    mid: "\u2500",
    verticalMid: "\u2502"
  },
  // ASCII-safe
  ascii: {
    topLeft: "+",
    top: "-",
    topRight: "+",
    right: "|",
    bottomRight: "+",
    bottom: "-",
    bottomLeft: "+",
    left: "|",
    topMid: "+",
    midMid: "+",
    bottomMid: "+",
    leftMid: "+",
    rightMid: "+",
    mid: "-",
    verticalMid: "|"
  },
  // Minimal - no borders
  minimal: {
    topLeft: " ",
    top: " ",
    topRight: " ",
    right: " ",
    bottomRight: " ",
    bottom: " ",
    bottomLeft: " ",
    left: " ",
    topMid: " ",
    midMid: " ",
    bottomMid: " ",
    leftMid: " ",
    rightMid: " ",
    mid: "\u2500",
    verticalMid: " "
  },
  // Simple - just horizontal lines
  simple: {
    topLeft: " ",
    top: "\u2500",
    topRight: " ",
    right: " ",
    bottomRight: " ",
    bottom: "\u2500",
    bottomLeft: " ",
    left: " ",
    topMid: " ",
    midMid: "\u2500",
    bottomMid: " ",
    leftMid: " ",
    rightMid: " ",
    mid: "\u2500",
    verticalMid: " "
  },
  // Markdown style
  markdown: {
    topLeft: " ",
    top: " ",
    topRight: " ",
    right: "|",
    bottomRight: " ",
    bottom: " ",
    bottomLeft: " ",
    left: "|",
    topMid: " ",
    midMid: "|",
    bottomMid: " ",
    leftMid: "|",
    rightMid: "|",
    mid: "-",
    verticalMid: "|"
  }
};
function getBox(style) {
  if (style === "none") return null;
  if (style in CUSTOM_BOXES) {
    return CUSTOM_BOXES[style];
  }
  if (style === "bold") {
    return CUSTOM_BOXES.heavy;
  }
  const cliBox = boxes[style];
  if (cliBox) {
    return {
      ...cliBox,
      topMid: cliBox.topMid ?? "\u252C",
      midMid: cliBox.midMid ?? "\u253C",
      bottomMid: cliBox.bottomMid ?? "\u2534",
      leftMid: cliBox.leftMid ?? "\u251C",
      rightMid: cliBox.rightMid ?? "\u2524",
      mid: cliBox.mid ?? "\u2500",
      verticalMid: cliBox.verticalMid ?? "\u2502"
    };
  }
  return CUSTOM_BOXES.rounded;
}
function listBoxStyles() {
  const customStyles = Object.keys(CUSTOM_BOXES);
  const cliBoxStyles = Object.keys(boxes);
  return [.../* @__PURE__ */ new Set([...customStyles, ...cliBoxStyles])];
}

// src/core/lines.ts
function splitLines(segments) {
  const lines = [];
  let currentLine = [];
  for (const segment of segments) {
    if (segment.text.includes("\n")) {
      const parts = segment.text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part) {
          currentLine.push(new Segment(part, segment.style, segment.isControl));
        }
        if (i < parts.length - 1) {
          lines.push(currentLine);
          currentLine = [];
        }
      }
    } else {
      currentLine.push(segment);
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}
function padLine(line, width, style = Style.null()) {
  const currentWidth = line.reduce((acc, s) => acc + s.cellLength(), 0);
  if (currentWidth >= width) return line;
  const padding = width - currentWidth;
  return [...line, new Segment(" ".repeat(padding), style)];
}
var Panel = class _Panel {
  constructor(renderable, options = {}) {
    this.renderable = renderable;
    this.options = options;
  }
  /**
   * Create a panel that fits its content (expand=false).
   */
  static fit(renderable, options = {}) {
    return new _Panel(renderable, { ...options, expand: false });
  }
  __rich_console__(console, consoleOptions) {
    const box = getBox(this.options.box ?? "rounded");
    const expand = this.options.expand ?? true;
    const maxWidth = this.options.width ?? consoleOptions.width ?? console.width;
    const borderStyle = typeof this.options.borderStyle === "string" ? Style.parse(this.options.borderStyle) : this.options.borderStyle ?? Style.parse("dim");
    const titleAlign = this.options.titleAlign ?? "center";
    const subtitleAlign = this.options.subtitleAlign ?? "center";
    const padding = this.normalizePadding(this.options.padding ?? 1);
    const segments = [];
    if (!box) {
      return { segments: [], width: 0 };
    }
    let contentSegments = [];
    if (typeof this.renderable === "string") {
      contentSegments = [new Segment(this.renderable)];
    } else if (isRenderable(this.renderable)) {
      const contentWidth = maxWidth - 2 - padding[1] - padding[3];
      const result = this.renderable.__rich_console__(console, {
        ...consoleOptions,
        width: contentWidth
      });
      if ("segments" in result) {
        contentSegments = Array.from(result.segments);
      }
    }
    const lines = splitLines(contentSegments);
    let maxContentWidth = 0;
    for (const line of lines) {
      const lineWidth = line.reduce((w, seg) => w + stringWidth3(seg.text), 0);
      if (lineWidth > maxContentWidth) maxContentWidth = lineWidth;
    }
    const titleWidth = this.options.title ? stringWidth3(this.options.title) + 4 : 0;
    const subtitleWidth = this.options.subtitle ? stringWidth3(this.options.subtitle) + 4 : 0;
    let panelWidth;
    if (expand) {
      panelWidth = maxWidth;
    } else {
      panelWidth = Math.min(
        maxWidth,
        Math.max(maxContentWidth + 2 + padding[1] + padding[3], titleWidth + 2, subtitleWidth + 2)
      );
    }
    const innerWidth = panelWidth - 2;
    segments.push(...this.renderTopBorder(box, innerWidth, borderStyle, titleAlign));
    segments.push(new Segment("\n", Style.null(), true));
    for (let i = 0; i < padding[0]; i++) {
      segments.push(new Segment(box.left, borderStyle));
      segments.push(new Segment(" ".repeat(innerWidth)));
      segments.push(new Segment(box.right, borderStyle));
      segments.push(new Segment("\n", Style.null(), true));
    }
    for (const line of lines) {
      segments.push(new Segment(box.left, borderStyle));
      segments.push(new Segment(" ".repeat(padding[3])));
      const contentPaddedWidth = innerWidth - padding[1] - padding[3];
      const paddedLine = padLine(line, contentPaddedWidth);
      segments.push(...paddedLine);
      segments.push(new Segment(" ".repeat(padding[1])));
      segments.push(new Segment(box.right, borderStyle));
      segments.push(new Segment("\n", Style.null(), true));
    }
    if (lines.length === 0) {
      segments.push(new Segment(box.left, borderStyle));
      segments.push(new Segment(" ".repeat(innerWidth)));
      segments.push(new Segment(box.right, borderStyle));
      segments.push(new Segment("\n", Style.null(), true));
    }
    for (let i = 0; i < padding[2]; i++) {
      segments.push(new Segment(box.left, borderStyle));
      segments.push(new Segment(" ".repeat(innerWidth)));
      segments.push(new Segment(box.right, borderStyle));
      segments.push(new Segment("\n", Style.null(), true));
    }
    segments.push(...this.renderBottomBorder(box, innerWidth, borderStyle, subtitleAlign));
    segments.push(new Segment("\n", Style.null(), true));
    return {
      segments,
      width: panelWidth
    };
  }
  /**
   * Normalize padding to [top, right, bottom, left] format.
   */
  normalizePadding(padding) {
    if (typeof padding === "number") {
      return [padding, padding, padding, padding];
    }
    if (padding.length === 2) {
      return [padding[0], padding[1], padding[0], padding[1]];
    }
    return padding;
  }
  /**
   * Render top border with optional title.
   */
  renderTopBorder(box, innerWidth, borderStyle, align) {
    const segments = [];
    if (this.options.title) {
      const title = ` ${this.options.title} `;
      const titleWidth = stringWidth3(title);
      const remainingWidth = Math.max(0, innerWidth - titleWidth);
      let leftLine;
      let rightLine;
      switch (align) {
        case "left":
          leftLine = "";
          rightLine = box.top.repeat(remainingWidth);
          break;
        case "right":
          leftLine = box.top.repeat(remainingWidth);
          rightLine = "";
          break;
        case "center":
        default: {
          const leftWidth = Math.floor(remainingWidth / 2);
          leftLine = box.top.repeat(leftWidth);
          rightLine = box.top.repeat(remainingWidth - leftWidth);
          break;
        }
      }
      segments.push(new Segment(box.topLeft, borderStyle));
      segments.push(new Segment(leftLine, borderStyle));
      segments.push(new Segment(title, Style.parse("bold")));
      segments.push(new Segment(rightLine, borderStyle));
      segments.push(new Segment(box.topRight, borderStyle));
    } else {
      segments.push(
        new Segment(box.topLeft + box.top.repeat(innerWidth) + box.topRight, borderStyle)
      );
    }
    return segments;
  }
  /**
   * Render bottom border with optional subtitle.
   */
  renderBottomBorder(box, innerWidth, borderStyle, align) {
    const segments = [];
    if (this.options.subtitle) {
      const subtitle = ` ${this.options.subtitle} `;
      const subtitleWidth = stringWidth3(subtitle);
      const remainingWidth = Math.max(0, innerWidth - subtitleWidth);
      let leftLine;
      let rightLine;
      switch (align) {
        case "left":
          leftLine = "";
          rightLine = box.bottom.repeat(remainingWidth);
          break;
        case "right":
          leftLine = box.bottom.repeat(remainingWidth);
          rightLine = "";
          break;
        case "center":
        default: {
          const leftWidth = Math.floor(remainingWidth / 2);
          leftLine = box.bottom.repeat(leftWidth);
          rightLine = box.bottom.repeat(remainingWidth - leftWidth);
          break;
        }
      }
      segments.push(new Segment(box.bottomLeft, borderStyle));
      segments.push(new Segment(leftLine, borderStyle));
      segments.push(new Segment(subtitle, Style.parse("dim italic")));
      segments.push(new Segment(rightLine, borderStyle));
      segments.push(new Segment(box.bottomRight, borderStyle));
    } else {
      segments.push(
        new Segment(box.bottomLeft + box.bottom.repeat(innerWidth) + box.bottomRight, borderStyle)
      );
    }
    return segments;
  }
};
var Rule = class {
  constructor(title = "", characters = "\u2500", style = Style.null()) {
    this.title = title;
    this.characters = characters;
    this.style = style;
  }
  __rich_console__(console, options) {
    const width = options.width ?? console.width;
    let line = "";
    if (this.title) {
      const titleText = ` ${this.title} `;
      const titleWidth = stringWidth3(titleText);
      const sideWidth = Math.floor((width - titleWidth) / 2);
      line = this.characters.repeat(sideWidth) + titleText + this.characters.repeat(width - titleWidth - sideWidth);
    } else {
      line = this.characters.repeat(width);
    }
    return {
      segments: [new Segment(line, this.style), new Segment("\n", Style.null(), true)],
      width
    };
  }
};
var Column = class {
  constructor(options) {
    this.options = options;
  }
  get header() {
    return this.options.header ?? "";
  }
  get footer() {
    return this.options.footer ?? "";
  }
  get justify() {
    return this.options.justify ?? "left";
  }
  get style() {
    return typeof this.options.style === "string" ? Style.parse(this.options.style) : this.options.style ?? Style.null();
  }
  get headerStyle() {
    return typeof this.options.headerStyle === "string" ? Style.parse(this.options.headerStyle) : this.options.headerStyle ?? Style.null();
  }
};
var Table = class {
  constructor(options = {}) {
    this.options = options;
  }
  columns = [];
  rows = [];
  footerRow = [];
  addColumn(header, options) {
    if (typeof header === "string") {
      this.columns.push(new Column({ header, ...options }));
    } else {
      this.columns.push(new Column(header));
    }
    return this;
  }
  addRow(...cells) {
    this.rows.push(cells);
    return this;
  }
  addFooter(...cells) {
    this.footerRow = cells;
    return this;
  }
  alignText(text, width, justify) {
    const textWidth = stringWidth3(text);
    const space = Math.max(0, width - textWidth);
    if (justify === "left") return text + " ".repeat(space);
    if (justify === "right") return " ".repeat(space) + text;
    const leftSpace = Math.floor(space / 2);
    const rightSpace = space - leftSpace;
    return " ".repeat(leftSpace) + text + " ".repeat(rightSpace);
  }
  __rich_console__(console, consoleOptions) {
    const width = consoleOptions.width ?? console.width;
    const box = getBox(this.options.box ?? "rounded");
    const segments = [];
    const borderStyle = typeof this.options.borderStyle === "string" ? Style.parse(this.options.borderStyle) : this.options.borderStyle ?? Style.parse("dim");
    const headerStyle = typeof this.options.headerStyle === "string" ? Style.parse(this.options.headerStyle) : this.options.headerStyle ?? Style.parse("bold cyan");
    const titleStyle = typeof this.options.titleStyle === "string" ? Style.parse(this.options.titleStyle) : this.options.titleStyle ?? Style.parse("bold");
    const showLines = this.options.showLines ?? false;
    const rowStyles = this.options.rowStyles ?? [];
    const padding = this.options.padding ?? 1;
    if (!box) return { segments: [], width: 0 };
    const totalBorderWidth = this.columns.length + 1;
    const paddingWidth = padding * 2 * this.columns.length;
    const availableWidth = width - totalBorderWidth - paddingWidth;
    const colWidth = Math.max(1, Math.floor(availableWidth / this.columns.length));
    const paddingStr = " ".repeat(padding);
    if (this.options.title) {
      const titleLine = this.alignText(this.options.title, width, "center");
      segments.push(new Segment(titleLine, titleStyle), new Segment("\n", Style.null(), true));
    }
    if (this.options.showHeader !== false) {
      segments.push(
        new Segment(
          box.topLeft + this.columns.map(() => (box.top || "\u2500").repeat(colWidth + padding * 2)).join(box.topMid || "\u252C") + box.topRight,
          borderStyle
        ),
        new Segment("\n", Style.null(), true)
      );
      segments.push(new Segment(box.left, borderStyle));
      this.columns.forEach((col, i) => {
        const text = this.alignText(col.header, colWidth, col.justify);
        const cellStyle = col.headerStyle.combine(headerStyle);
        segments.push(new Segment(paddingStr + text + paddingStr, cellStyle));
        segments.push(
          new Segment(
            i === this.columns.length - 1 ? box.right : box.verticalMid || "\u2502",
            borderStyle
          )
        );
      });
      segments.push(new Segment("\n", Style.null(), true));
      segments.push(
        new Segment(
          (box.leftMid || "\u251C") + this.columns.map(() => (box.mid || "\u2500").repeat(colWidth + padding * 2)).join(box.midMid || "\u253C") + (box.rightMid || "\u2524"),
          borderStyle
        ),
        new Segment("\n", Style.null(), true)
      );
    }
    this.rows.forEach((row, rowIndex) => {
      let rowStyle = Style.null();
      if (rowStyles.length > 0) {
        const styleStr = rowStyles[rowIndex % rowStyles.length];
        if (styleStr) {
          rowStyle = Style.parse(styleStr);
        }
      }
      segments.push(new Segment(box.left, borderStyle));
      this.columns.forEach((col, i) => {
        const cell = row[i];
        let cellSegments = [];
        if (typeof cell === "string") {
          const text = this.alignText(cell, colWidth, col.justify);
          const cellStyle = col.style.combine(rowStyle);
          cellSegments = [new Segment(paddingStr + text + paddingStr, cellStyle)];
        } else if (isRenderable(cell)) {
          const result = getRenderResult(cell, console, { ...consoleOptions, width: colWidth });
          segments.push(new Segment(paddingStr));
          cellSegments = result.segments.map((s) => {
            return new Segment(s.text, s.style.combine(rowStyle), s.isControl);
          });
          const contentWidth = result.width ?? 0;
          const space = Math.max(0, colWidth - contentWidth);
          if (space > 0) {
            cellSegments.push(new Segment(" ".repeat(space), rowStyle));
          }
          cellSegments.push(new Segment(paddingStr));
        }
        segments.push(...cellSegments);
        segments.push(
          new Segment(
            i === this.columns.length - 1 ? box.right : box.verticalMid || "\u2502",
            borderStyle
          )
        );
      });
      segments.push(new Segment("\n", Style.null(), true));
      if (showLines && rowIndex < this.rows.length - 1) {
        segments.push(
          new Segment(
            (box.leftMid || "\u251C") + this.columns.map(() => (box.mid || "\u2500").repeat(colWidth + padding * 2)).join(box.midMid || "\u253C") + (box.rightMid || "\u2524"),
            borderStyle
          ),
          new Segment("\n", Style.null(), true)
        );
      }
    });
    if (this.options.showFooter && this.footerRow.length > 0) {
      const footerStyle = typeof this.options.footerStyle === "string" ? Style.parse(this.options.footerStyle) : this.options.footerStyle ?? Style.parse("bold");
      segments.push(
        new Segment(
          (box.leftMid || "\u251C") + this.columns.map(() => (box.mid || "\u2500").repeat(colWidth + padding * 2)).join(box.midMid || "\u253C") + (box.rightMid || "\u2524"),
          borderStyle
        ),
        new Segment("\n", Style.null(), true)
      );
      segments.push(new Segment(box.left, borderStyle));
      this.columns.forEach((col, i) => {
        const cell = this.footerRow[i];
        const text = typeof cell === "string" ? cell : "";
        const alignedText = this.alignText(text, colWidth, col.justify);
        segments.push(new Segment(paddingStr + alignedText + paddingStr, footerStyle));
        segments.push(
          new Segment(
            i === this.columns.length - 1 ? box.right : box.verticalMid || "\u2502",
            borderStyle
          )
        );
      });
      segments.push(new Segment("\n", Style.null(), true));
    }
    segments.push(
      new Segment(
        box.bottomLeft + this.columns.map(() => (box.bottom || "\u2500").repeat(colWidth + padding * 2)).join(box.bottomMid || "\u2534") + box.bottomRight,
        borderStyle
      ),
      new Segment("\n", Style.null(), true)
    );
    if (this.options.caption) {
      const captionStyle = typeof this.options.captionStyle === "string" ? Style.parse(this.options.captionStyle) : this.options.captionStyle ?? Style.parse("dim italic");
      const captionLine = this.alignText(this.options.caption, width, "center");
      segments.push(new Segment(captionLine, captionStyle), new Segment("\n", Style.null(), true));
    }
    return { segments, width };
  }
};

// src/renderables/tree.ts
var TREE_GUIDES = {
  standard: {
    branch: "\u251C\u2500\u2500 ",
    last: "\u2514\u2500\u2500 ",
    vertical: "\u2502   ",
    space: "    "
  },
  bold: {
    branch: "\u2523\u2501\u2501 ",
    last: "\u2517\u2501\u2501 ",
    vertical: "\u2503   ",
    space: "    "
  },
  double: {
    branch: "\u2560\u2550\u2550 ",
    last: "\u255A\u2550\u2550 ",
    vertical: "\u2551   ",
    space: "    "
  },
  ascii: {
    branch: "|-- ",
    last: "`-- ",
    vertical: "|   ",
    space: "    "
  }
};
var Tree = class _Tree {
  constructor(label, options = {}) {
    this.label = label;
    this.options = options;
    this.guideStyle = Style.parse(options.guideStyle ?? "#6e7681 dim");
    if (options.guideStyle === "bold") {
      this.guides = TREE_GUIDES.bold;
    } else if (options.guideStyle === "double") {
      this.guides = TREE_GUIDES.double;
    } else if (options.guideStyle === "ascii") {
      this.guides = TREE_GUIDES.ascii;
    } else {
      this.guides = TREE_GUIDES.standard;
    }
  }
  children = [];
  guideStyle;
  guides;
  /**
   * Add a child node to the tree.
   * Returns the added Tree node for method chaining.
   */
  add(label) {
    if (label instanceof _Tree) {
      this.children.push(label);
      return label;
    }
    const node = new _Tree(label, this.options);
    this.children.push(node);
    return node;
  }
  __rich_console__(console, options) {
    const segments = [];
    if (!this.options.hideRoot) {
      this.renderLabel(this.label, segments, console, options);
      segments.push(new Segment("\n", Style.null(), true));
    }
    this.renderChildren(this.children, "", segments, console, options);
    return { segments, width: 0 };
  }
  /**
   * Render a label (string or renderable) and add segments.
   */
  renderLabel(label, segments, console, options) {
    if (typeof label === "string") {
      segments.push(new Segment(label));
    } else if (isRenderable(label)) {
      const result = label.__rich_console__(console, options);
      if ("segments" in result) {
        const labelSegments = result.segments.filter((s) => !s.isControl || s.text !== "\n");
        segments.push(...labelSegments);
      }
    }
  }
  /**
   * Render child nodes with appropriate prefixes.
   */
  renderChildren(children, prefix, segments, console, options) {
    children.forEach((child, index) => {
      const isLast = index === children.length - 1;
      const connector = isLast ? this.guides.last : this.guides.branch;
      const continuation = isLast ? this.guides.space : this.guides.vertical;
      const labelSegments = [];
      if (typeof child.label === "string") {
        labelSegments.push(new Segment(child.label));
      } else if (isRenderable(child.label)) {
        const result = child.label.__rich_console__(console, options);
        if ("segments" in result) {
          labelSegments.push(...result.segments);
        }
      }
      const labelLines = splitLines(labelSegments);
      if (labelLines.length > 0) {
        segments.push(new Segment(prefix, this.guideStyle));
        segments.push(new Segment(connector, this.guideStyle));
        segments.push(...labelLines[0]);
        segments.push(new Segment("\n", Style.null(), true));
      }
      for (let i = 1; i < labelLines.length; i++) {
        segments.push(new Segment(prefix, this.guideStyle));
        segments.push(new Segment(continuation, this.guideStyle));
        segments.push(...labelLines[i]);
        segments.push(new Segment("\n", Style.null(), true));
      }
      const newPrefix = prefix + continuation;
      this.renderChildren(child.children, newPrefix, segments, console, options);
    });
  }
};

// src/layout/layout.ts
var Layout = class _Layout {
  _renderable = null;
  _children = [];
  _direction = "column";
  size;
  ratio = 1;
  minimumSize = 0;
  visible = true;
  constructor(renderable, options = {}) {
    if (renderable) this._renderable = renderable;
    this.size = options.size;
    this.ratio = options.ratio ?? 1;
    this.minimumSize = options.minimumSize ?? 0;
    this.visible = options.visible ?? true;
  }
  /**
   * Split the layout into a row (horizontal split).
   */
  splitRow(...layouts) {
    this._direction = "row";
    this._children = layouts.map((l) => l instanceof _Layout ? l : new _Layout(l));
  }
  /**
   * Split the layout into a column (vertical split).
   */
  splitColumn(...layouts) {
    this._direction = "column";
    this._children = layouts.map((l) => l instanceof _Layout ? l : new _Layout(l));
  }
  get renderable() {
    return this._renderable;
  }
  update(renderable) {
    this._renderable = renderable;
  }
  __rich_console__(console, options) {
    if (!this.visible) return { segments: [], width: 0, height: 0 };
    const width = options.width ?? console.width;
    const height = options.height ?? console.height;
    if (this._children.length === 0) {
      if (this._renderable) {
        return getRenderResult(this._renderable, console, { ...options, width, height });
      }
      return { segments: [], width, height: 0 };
    }
    const segments = [];
    if (this._direction === "column") {
      for (const child of this._children) {
        if (!child.visible) continue;
        const result = getRenderResult(child, console, { ...options, width });
        segments.push(...result.segments);
        const last = result.segments[result.segments.length - 1];
        if (last && !last.text.endsWith("\n")) {
          segments.push(new Segment("\n"));
        }
      }
    } else {
      const childWidths = this.calculateSizes(width, this._children);
      const renderedLines = [];
      let maxHeight = 0;
      this._children.forEach((child, i) => {
        if (!child.visible) {
          renderedLines.push([]);
          return;
        }
        const w = childWidths[i];
        const result = getRenderResult(child, console, { ...options, width: w });
        let childSegments = result.segments;
        const lines = splitLines(childSegments);
        renderedLines.push(lines);
        if (lines.length > maxHeight) maxHeight = lines.length;
      });
      for (let y = 0; y < maxHeight; y++) {
        for (let x = 0; x < this._children.length; x++) {
          if (!this._children[x].visible) continue;
          const lines = renderedLines[x];
          const w = childWidths[x];
          if (y < lines.length) {
            const line = lines[y];
            segments.push(...padLine(line, w));
          } else {
            segments.push(new Segment(" ".repeat(w)));
          }
        }
        segments.push(new Segment("\n"));
      }
    }
    return { segments, width, height };
  }
  /**
   * Calculates the size (width for rows, height for columns) for each child
   * based on constraints.
   */
  calculateSizes(availableSpace, children) {
    const sizes = new Array(children.length).fill(0);
    const visibleChildren = children.map((c, i) => ({ child: c, index: i })).filter((x) => x.child.visible);
    if (visibleChildren.length === 0) return sizes;
    let remainingSpace = availableSpace;
    let totalRatio = 0;
    for (const { child, index } of visibleChildren) {
      if (child.size !== void 0) {
        const size = Math.min(child.size, remainingSpace);
        sizes[index] = size;
        remainingSpace -= size;
      } else if (child.minimumSize > 0) {
        sizes[index] = child.minimumSize;
        remainingSpace -= child.minimumSize;
      }
      if (child.size === void 0) {
        totalRatio += child.ratio;
      }
    }
    if (remainingSpace <= 0) return sizes;
    if (totalRatio > 0) {
      let distributed = 0;
      for (let i = 0; i < visibleChildren.length; i++) {
        const { child, index } = visibleChildren[i];
        if (child.size === void 0) {
          const share = Math.floor(child.ratio / totalRatio * remainingSpace);
          sizes[index] += share;
          distributed += share;
        }
      }
      const dust = remainingSpace - distributed;
      if (dust > 0) {
        for (let i = visibleChildren.length - 1; i >= 0; i--) {
          const { child, index } = visibleChildren[i];
          if (child.size === void 0) {
            sizes[index] += dust;
            break;
          }
        }
      }
    }
    return sizes;
  }
};

// src/layout/grid.ts
var Grid = class extends Layout {
  constructor() {
    super();
  }
  /**
   * Adds a row to the grid with optional constraints.
   */
  addRow(content, options = {}) {
    const layout = content instanceof Layout ? content : new Layout(content, options);
    if (!(content instanceof Layout)) {
      layout.size = options.size;
      layout.ratio = options.ratio ?? 1;
      layout.minimumSize = options.minimumSize ?? 0;
    }
    this.splitColumn(...this["_children"] || [], layout);
  }
};

// src/renderables/padding.ts
var Padding = class {
  constructor(renderable, padding) {
    this.renderable = renderable;
    if (typeof padding === "number") {
      this.top = this.right = this.bottom = this.left = padding;
    } else if (Array.isArray(padding)) {
      if (padding.length === 2) {
        this.top = this.bottom = padding[0];
        this.right = this.left = padding[1];
      } else {
        [this.top, this.right, this.bottom, this.left] = padding;
      }
    } else {
      this.top = this.right = this.bottom = this.left = 0;
    }
  }
  top;
  right;
  bottom;
  left;
  __rich_console__(console, options) {
    const width = options.width ?? console.width;
    const innerWidth = Math.max(0, width - this.left - this.right);
    let contentSegments = [];
    if (typeof this.renderable === "string") {
      contentSegments = [new Segment(this.renderable)];
    } else if (isRenderable(this.renderable)) {
      const result = this.renderable.__rich_console__(console, { ...options, width: innerWidth });
      if ("segments" in result) contentSegments = result.segments;
    }
    const lines = splitLines(contentSegments);
    const segments = [];
    for (let i = 0; i < this.top; i++) {
      segments.push(new Segment(" ".repeat(width) + "\n"));
    }
    const leftPad = " ".repeat(this.left);
    for (const line of lines) {
      segments.push(new Segment(leftPad));
      segments.push(...line);
      segments.push(new Segment("\n"));
    }
    for (let i = 0; i < this.bottom; i++) {
      segments.push(new Segment(" ".repeat(width) + "\n"));
    }
    return { segments, width };
  }
};

// src/renderables/align.ts
var Align = class _Align {
  constructor(renderable, align, style) {
    this.renderable = renderable;
    this.align = align;
    this.style = style;
  }
  static left(renderable) {
    return new _Align(renderable, "left");
  }
  static center(renderable) {
    return new _Align(renderable, "center");
  }
  static right(renderable) {
    return new _Align(renderable, "right");
  }
  __rich_console__(console, options) {
    const width = options.width ?? console.width;
    let contentSegments = [];
    if (typeof this.renderable === "string") {
      contentSegments = [new Segment(this.renderable)];
    } else if (isRenderable(this.renderable)) {
      const result = this.renderable.__rich_console__(console, options);
      if ("segments" in result) contentSegments = result.segments;
    }
    const lines = splitLines(contentSegments);
    const segments = [];
    for (const line of lines) {
      const lineWidth = line.reduce((acc, s) => acc + s.cellLength(), 0);
      const remaining = Math.max(0, width - lineWidth);
      if (remaining === 0) {
        segments.push(...line);
      } else {
        let leftSpace = 0;
        if (this.align === "center") leftSpace = Math.floor(remaining / 2);
        else if (this.align === "right") leftSpace = remaining;
        if (leftSpace > 0) segments.push(new Segment(" ".repeat(leftSpace)));
        segments.push(...line);
      }
      segments.push(new Segment("\n"));
    }
    return { segments, width };
  }
};

// src/renderables/columns.ts
var Columns = class {
  renderables;
  options;
  constructor(renderables = [], options = {}) {
    this.renderables = Array.from(renderables);
    this.options = {
      padding: options.padding ?? 1,
      expand: options.expand ?? false,
      equal: options.equal ?? false,
      columnFirst: options.columnFirst ?? false,
      rightToLeft: options.rightToLeft ?? false,
      ...options
    };
  }
  /**
   * Add a renderable to the columns.
   */
  add(renderable) {
    this.renderables.push(renderable);
    return this;
  }
  __rich_console__(console, consoleOptions) {
    if (this.renderables.length === 0) {
      return { segments: [], width: 0 };
    }
    const items = this.renderables.map((r) => {
      if (typeof r === "string") {
        return r;
      }
      const result = r.__rich_console__(console, consoleOptions);
      if ("segments" in result) {
        return result.segments.map((s) => s.text).join("");
      }
      return "";
    });
    const terminalWidth = consoleOptions.width ?? console.width ?? 80;
    const padding = this.options.padding ?? 1;
    const paddingStr = " ".repeat(padding);
    let columnWidth;
    if (this.options.width) {
      columnWidth = this.options.width;
    } else if (this.options.equal) {
      columnWidth = Math.max(...items.map((item) => this.getDisplayWidth(item)));
    } else {
      columnWidth = Math.max(...items.map((item) => this.getDisplayWidth(item)));
    }
    const columnCount = Math.max(
      1,
      Math.floor((terminalWidth + padding) / (columnWidth + padding))
    );
    const lines = [];
    if (this.options.title) {
      lines.push(this.options.title);
    }
    const rows = [];
    if (this.options.columnFirst) {
      const rowCount = Math.ceil(items.length / columnCount);
      for (let row = 0; row < rowCount; row++) {
        const rowItems = [];
        for (let col = 0; col < columnCount; col++) {
          const index = col * rowCount + row;
          if (index < items.length) {
            rowItems.push(this.padItem(items[index], columnWidth));
          }
        }
        rows.push(rowItems);
      }
    } else {
      for (let i = 0; i < items.length; i += columnCount) {
        const rowItems = [];
        for (let j = 0; j < columnCount && i + j < items.length; j++) {
          rowItems.push(this.padItem(items[i + j], columnWidth));
        }
        rows.push(rowItems);
      }
    }
    for (const row of rows) {
      let rowItems = row;
      if (this.options.rightToLeft) {
        rowItems = [...row].reverse();
      }
      lines.push(rowItems.join(paddingStr));
    }
    const output = `${lines.join("\n")}
`;
    return {
      segments: [new Segment(output, Style.null())],
      width: terminalWidth
    };
  }
  /**
   * Get the display width of a string (accounting for ANSI codes).
   */
  getDisplayWidth(text) {
    const stripped = text.replace(/\x1b\[[0-9;]*m/g, "");
    return stripped.length;
  }
  /**
   * Pad an item to the specified width.
   */
  padItem(item, width) {
    const currentWidth = this.getDisplayWidth(item);
    if (currentWidth >= width) {
      return item;
    }
    return item + " ".repeat(width - currentWidth);
  }
};

// src/renderables/json.ts
var JSON2 = class _JSON {
  text;
  highlight;
  constructor(json, options = {}) {
    const { indent = 2, sortKeys = false } = options;
    this.highlight = options.highlight ?? true;
    try {
      let data = globalThis.JSON.parse(json);
      if (sortKeys && typeof data === "object" && data !== null) {
        data = this.sortObject(data);
      }
      this.text = globalThis.JSON.stringify(data, null, indent);
    } catch {
      this.text = json;
    }
  }
  /**
   * Create JSON from any data object.
   */
  static fromData(data, options = {}) {
    const { indent = 2, sortKeys = false } = options;
    let processedData = data;
    if (sortKeys && typeof data === "object" && data !== null) {
      processedData = _JSON.prototype.sortObject(data);
    }
    const json = globalThis.JSON.stringify(processedData, null, indent);
    const instance = new _JSON(json, { ...options, sortKeys: false });
    return instance;
  }
  sortObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortObject(item));
    }
    if (obj !== null && typeof obj === "object") {
      const sorted = {};
      const keys = Object.keys(obj).sort();
      for (const key of keys) {
        sorted[key] = this.sortObject(obj[key]);
      }
      return sorted;
    }
    return obj;
  }
  /**
   * Apply JSON syntax highlighting.
   */
  highlightJSON(text) {
    if (!this.highlight) {
      return text;
    }
    const highlighted = text.replace(/"([^"\\]|\\.)*"/g, (match) => {
      return Style.parse("#f1fa8c").apply(match);
    }).replace(/\b(-?\d+\.?\d*(?:e[+-]?\d+)?)\b/gi, (match) => {
      return Style.parse("#bd93f9").apply(match);
    }).replace(/\b(true|false)\b/g, (match) => {
      return match === "true" ? Style.parse("#50fa7b").apply(match) : Style.parse("#ff79c6").apply(match);
    }).replace(/\bnull\b/g, (match) => {
      return Style.parse("#8be9fd italic").apply(match);
    });
    return highlighted;
  }
  __rich_console__(_console, _consoleOptions) {
    const highlighted = this.highlightJSON(this.text);
    return {
      segments: [new Segment(highlighted + "\n", Style.null())],
      width: this.text.split("\n").reduce((max, line) => Math.max(max, line.length), 0)
    };
  }
};
var Prompt = class {
  static async ask(message, options = {}) {
    const console = options.console ?? new Console();
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });
    const defaultStr = options.default !== void 0 ? ` [default: ${options.default}]` : "";
    const choicesStr = options.choices ? ` [${options.choices.join("/")}]` : "";
    const query = `${message}${choicesStr}${defaultStr}: `;
    console.print(query);
    return new Promise((resolve) => {
      const askQuestion = () => {
        process.stdout.write("> ");
        rl.question("", (answer) => {
          let value = answer.trim();
          if (value === "" && options.default !== void 0) {
            value = String(options.default);
          }
          if (options.choices && !options.choices.includes(value)) {
            console.print(`[red]Please select one of: ${options.choices.join(", ")}[/]`);
            askQuestion();
            return;
          }
          if (options.validate) {
            const validation = options.validate(value);
            if (validation !== true) {
              const msg = typeof validation === "string" ? validation : "Invalid input";
              console.print(`[red]${msg}[/]`);
              askQuestion();
              return;
            }
          }
          rl.close();
          resolve(value);
        });
      };
      askQuestion();
    });
  }
};

// src/prompt/confirm.ts
var Confirm = class {
  static async ask(message, options = {}) {
    const defaultValue = options.default ?? true;
    const choices = defaultValue ? ["Y", "n"] : ["y", "N"];
    const answer = await Prompt.ask(message, {
      ...options,
      choices,
      default: defaultValue ? "y" : "n",
      validate: (input) => {
        const norm2 = input.toLowerCase();
        return norm2 === "y" || norm2 === "yes" || norm2 === "n" || norm2 === "no";
      }
    });
    const norm = answer.toLowerCase();
    return norm === "y" || norm === "yes";
  }
};

// src/logging/handler.ts
var RichHandler = class {
  console;
  constructor(console) {
    this.console = console ?? new Console();
  }
  handle(record) {
    const time = record.timestamp.toLocaleTimeString();
    const levelStyle = this.getLevelStyle(record.level);
    const parts = [
      `[dim]${time}[/dim]`,
      // Pad level to align messages
      new Segment(` ${record.level.toUpperCase()} `.padEnd(7), levelStyle),
      record.message
    ];
    if (record.context && Object.keys(record.context).length > 0) {
      parts.push(`[dim]${JSON.stringify(record.context)}[/dim]`);
    }
    this.console.print(...parts);
  }
  getLevelStyle(level) {
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
};

// src/hooks/install.ts
function install(consoleOptions = {}) {
  if (global.__rich_installed__) return;
  const richConsole = new Console(consoleOptions);
  const handler = new RichHandler(richConsole);
  const originalLog = global.console.log;
  const originalWarn = global.console.warn;
  const originalError = global.console.error;
  global.console.log = (...args) => {
    richConsole.print(...args);
  };
  global.console.warn = (...args) => {
    handler.handle({
      level: "warn",
      message: args.map(String).join(" "),
      timestamp: /* @__PURE__ */ new Date()
    });
  };
  global.console.error = (...args) => {
    handler.handle({
      level: "error",
      message: args.map(String).join(" "),
      timestamp: /* @__PURE__ */ new Date()
    });
  };
  global.__rich_installed__ = true;
  global.__rich_original_console__ = {
    log: originalLog,
    warn: originalWarn,
    error: originalError
  };
}
marked.setOptions({
  renderer: new TerminalRenderer()
});
var Markdown = class {
  constructor(markup) {
    this.markup = markup;
  }
  __rich_console__(_console, _options) {
    const rendered = marked.parse(this.markup);
    return {
      segments: [new Segment(rendered)],
      width: 0
      // Placeholder
    };
  }
};

// src/progress/bar.ts
var ProgressBar = class {
  constructor(total = 100, completed = 0, options = {}) {
    this.total = total;
    this.completed = completed;
    this.options = options;
  }
  render(_arg0) {
    throw new Error("Method not implemented.");
  }
  pulseOffset = 0;
  lastPulseTime = 0;
  __rich_console__(console, consoleOptions) {
    const width = this.options.width ?? Math.min(40, (consoleOptions.width ?? console.width) - 20);
    const percentage = Math.min(1, Math.max(0, this.completed / this.total));
    const isComplete = percentage >= 1;
    const isPulse = this.options.pulse ?? false;
    const completeChar = this.options.completeChar ?? "\u2501";
    const remainingChar = this.options.remainingChar ?? "\u2501";
    const completeStyleStr = isComplete ? this.options.finishedStyle ?? "#50fa7b bold" : this.options.completeStyle ?? "#61afef";
    const remainingStyleStr = this.options.remainingStyle ?? "#3a3a3a dim";
    const pulseStyleStr = this.options.pulseStyle ?? "#98c379 bold";
    const completeStyle = Style.parse(completeStyleStr);
    const remainingStyle = Style.parse(remainingStyleStr);
    const pulseStyle = Style.parse(pulseStyleStr);
    const filledWidth = Math.floor(width * percentage);
    const segments = [];
    if (isPulse && !isComplete) {
      const now = Date.now();
      if (now - this.lastPulseTime > 100) {
        this.pulseOffset = (this.pulseOffset + 1) % width;
        this.lastPulseTime = now;
      }
      for (let i = 0; i < width; i++) {
        const isPulsePos = Math.abs(i - this.pulseOffset) < 3;
        const style = isPulsePos ? pulseStyle : remainingStyle;
        segments.push(new Segment(remainingChar, style));
      }
    } else {
      if (filledWidth > 0) {
        if (width >= 20 && !isComplete) {
          const gradientColors = ["#61afef", "#66d9ef", "#50fa7b"];
          for (let i = 0; i < filledWidth; i++) {
            const colorIndex = Math.floor(i / filledWidth * gradientColors.length);
            const color = gradientColors[Math.min(colorIndex, gradientColors.length - 1)];
            segments.push(new Segment(completeChar, Style.parse(color)));
          }
        } else {
          segments.push(new Segment(completeChar.repeat(filledWidth), completeStyle));
        }
      }
      const remainingWidth = width - filledWidth;
      if (remainingWidth > 0) {
        segments.push(new Segment(remainingChar.repeat(remainingWidth), remainingStyle));
      }
    }
    return {
      segments,
      width
    };
  }
};
var PercentageColumn = class {
  constructor(percentage, style) {
    this.percentage = percentage;
    this.style = style;
  }
  __rich_console__(_console, _options) {
    const pct = Math.floor(this.percentage * 100);
    const text = `${pct.toString().padStart(3)}%`;
    const style = Style.parse(this.style ?? (pct >= 100 ? "#50fa7b bold" : "#61afef"));
    return {
      segments: [new Segment(text, style)],
      width: 4
    };
  }
};
var TimeElapsedColumn = class {
  constructor(elapsedMs, style) {
    this.elapsedMs = elapsedMs;
    this.style = style;
  }
  __rich_console__(_console, _options) {
    const seconds = Math.floor(this.elapsedMs / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    let text;
    if (hours > 0) {
      text = `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
    } else if (minutes > 0) {
      text = `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
    } else {
      text = `0:${seconds.toString().padStart(2, "0")}`;
    }
    const style = Style.parse(this.style ?? "#e5c07b");
    return {
      segments: [new Segment(text, style)],
      width: text.length
    };
  }
};
var TimeRemainingColumn = class {
  constructor(percentage, elapsedMs, style) {
    this.percentage = percentage;
    this.elapsedMs = elapsedMs;
    this.style = style;
  }
  __rich_console__(_console, _options) {
    if (this.percentage <= 0 || this.percentage >= 1) {
      const text2 = "-:--";
      return {
        segments: [new Segment(text2, Style.parse(this.style ?? "dim"))],
        width: 4
      };
    }
    const estimatedTotal = this.elapsedMs / this.percentage;
    const remainingMs = estimatedTotal - this.elapsedMs;
    const seconds = Math.floor(remainingMs / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    let text;
    if (hours > 0) {
      text = `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
    } else if (minutes > 0) {
      text = `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
    } else {
      text = `0:${seconds.toString().padStart(2, "0")}`;
    }
    const style = Style.parse(this.style ?? "#c678dd");
    return {
      segments: [new Segment(text, style)],
      width: text.length
    };
  }
};

// src/progress/progress.ts
var Progress = class {
  tasks = [];
  taskIdCounter = 0;
  started = false;
  refreshInterval = null;
  lastRenderedLines = 0;
  addTask(description, options = {}) {
    const taskId = this.taskIdCounter++;
    this.tasks.push({
      id: taskId,
      description,
      total: options.total ?? 100,
      completed: options.completed ?? 0,
      visible: true,
      finished: false,
      startTime: Date.now(),
      endTime: null
    });
    this.refresh();
    return taskId;
  }
  update(taskId, options) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (options.completed !== void 0) task.completed = options.completed;
    if (options.description !== void 0) task.description = options.description;
    if (task.completed >= task.total) {
      task.finished = true;
      task.endTime = Date.now();
    }
    this.refresh();
  }
  start() {
    if (this.started) return;
    this.started = true;
    process.stdout.write("\x1B[?25l");
    this.refreshInterval = setInterval(() => this.refresh(), 100);
    this.refresh();
  }
  stop() {
    if (!this.started) return;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    process.stdout.write("\x1B[?25h");
    this.started = false;
  }
  refresh() {
    if (!this.started) return;
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write("\x1B[2K\n");
      }
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
    }
    const lines = [];
    for (const task of this.tasks.filter((t) => t.visible)) {
      const percent = Math.floor(task.completed / task.total * 100);
      const barStr = this.renderSimpleBar(task.completed, task.total, 30);
      const percentStyle = percent >= 100 ? Style.parse("#50fa7b bold") : Style.parse("#61afef");
      lines.push(`${task.description.padEnd(20)} ${barStr} ${percentStyle.apply(`${percent}%`)}`);
    }
    const output = lines.join("\n") + "\n";
    this.lastRenderedLines = lines.length;
    process.stdout.write(output);
  }
  renderSimpleBar(completed, total, width) {
    const percentage = Math.min(1, Math.max(0, completed / total));
    const filledWidth = Math.floor(width * percentage);
    const remainingWidth = width - filledWidth;
    const filledStyle = percentage >= 1 ? Style.parse("#50fa7b bold") : Style.parse("#61afef");
    const remainingStyle = Style.parse("#3a3a3a dim");
    const filled = filledStyle.apply("\u2501".repeat(filledWidth));
    const remaining = remainingStyle.apply("\u2501".repeat(remainingWidth));
    return filled + remaining;
  }
};

// src/progress/track.ts
function* track(sequence, description = "Working...") {
  const progress = new Progress();
  const arr = Array.isArray(sequence) ? sequence : Array.from(sequence);
  const total = arr.length;
  progress.start();
  const taskId = progress.addTask(description, { total });
  try {
    for (let i = 0; i < total; i++) {
      yield arr[i];
      progress.update(taskId, { completed: i + 1 });
    }
  } finally {
    progress.stop();
  }
}

// src/live/live.ts
var Live = class {
  transient;
  started = false;
  refreshThread = null;
  lastRenderedLines = 0;
  currentContent = "";
  constructor(options = {}) {
    this.transient = options.transient ?? false;
  }
  /**
   * Check if live display is currently running.
   */
  get isStarted() {
    return this.started;
  }
  /**
   * Update the displayed content.
   */
  update(content) {
    this.currentContent = content;
  }
  /**
   * Refresh the display with current content.
   */
  refresh() {
    if (!this.started) return;
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write("\x1B[2K\n");
      }
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
    }
    this.lastRenderedLines = (this.currentContent.match(/\n/g) || []).length + 1;
    process.stdout.write(`${this.currentContent}
`);
  }
  /**
   * Start live display with a callback function.
   * The callback receives an update function to change the displayed content.
   */
  async start(callback) {
    if (this.started) {
      throw new Error("Live display already started");
    }
    this.started = true;
    process.stdout.write("\x1B[?25l");
    const updateFn = (content) => {
      this.currentContent = content;
      this.refresh();
    };
    try {
      await callback(updateFn);
    } finally {
      this.stop();
    }
  }
  /**
   * Stop live display.
   */
  stop() {
    if (!this.started) return;
    if (this.refreshThread) {
      clearInterval(this.refreshThread);
      this.refreshThread = null;
    }
    process.stdout.write("\x1B[?25h");
    if (this.transient && this.lastRenderedLines > 0) {
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write("\x1B[2K\n");
      }
      process.stdout.write(`\x1B[${this.lastRenderedLines}A`);
    }
    this.started = false;
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/utils/emoji.ts
var EMOJI = {
  // Common emojis
  rocket: "\u{1F680}",
  star: "\u2B50",
  sparkles: "\u2728",
  fire: "\u{1F525}",
  heart: "\u2764\uFE0F",
  thumbs_up: "\u{1F44D}",
  thumbs_down: "\u{1F44E}",
  clap: "\u{1F44F}",
  wave: "\u{1F44B}",
  ok_hand: "\u{1F44C}",
  // Faces
  smile: "\u{1F60A}",
  grin: "\u{1F601}",
  joy: "\u{1F602}",
  wink: "\u{1F609}",
  thinking: "\u{1F914}",
  sunglasses: "\u{1F60E}",
  heart_eyes: "\u{1F60D}",
  sob: "\u{1F62D}",
  angry: "\u{1F620}",
  scream: "\u{1F631}",
  skull: "\u{1F480}",
  ghost: "\u{1F47B}",
  robot: "\u{1F916}",
  // Status
  check: "\u2705",
  check_mark: "\u2714\uFE0F",
  x: "\u274C",
  cross_mark: "\u274C",
  warning: "\u26A0\uFE0F",
  exclamation: "\u2757",
  question: "\u2753",
  info: "\u2139\uFE0F",
  bulb: "\u{1F4A1}",
  gear: "\u2699\uFE0F",
  wrench: "\u{1F527}",
  hammer: "\u{1F528}",
  bug: "\u{1F41B}",
  construction: "\u{1F6A7}",
  // Weather & Nature
  sun: "\u2600\uFE0F",
  moon: "\u{1F319}",
  cloud: "\u2601\uFE0F",
  rain: "\u{1F327}\uFE0F",
  snow: "\u2744\uFE0F",
  thunder: "\u26A1",
  rainbow: "\u{1F308}",
  tree: "\u{1F333}",
  flower: "\u{1F338}",
  leaf: "\u{1F343}",
  // Objects
  book: "\u{1F4D6}",
  books: "\u{1F4DA}",
  pencil: "\u270F\uFE0F",
  pen: "\u{1F58A}\uFE0F",
  clipboard: "\u{1F4CB}",
  folder: "\u{1F4C1}",
  file_folder: "\u{1F4C1}",
  package: "\u{1F4E6}",
  inbox: "\u{1F4E5}",
  outbox: "\u{1F4E4}",
  email: "\u{1F4E7}",
  computer: "\u{1F4BB}",
  keyboard: "\u2328\uFE0F",
  phone: "\u{1F4F1}",
  camera: "\u{1F4F7}",
  video_camera: "\u{1F4F9}",
  clock: "\u{1F550}",
  hourglass: "\u23F3",
  key: "\u{1F511}",
  lock: "\u{1F512}",
  unlock: "\u{1F513}",
  link: "\u{1F517}",
  trophy: "\u{1F3C6}",
  medal: "\u{1F3C5}",
  crown: "\u{1F451}",
  gem: "\u{1F48E}",
  money: "\u{1F4B0}",
  coin: "\u{1FA99}",
  // Arrows & Symbols
  arrow_right: "\u27A1\uFE0F",
  arrow_left: "\u2B05\uFE0F",
  arrow_up: "\u2B06\uFE0F",
  arrow_down: "\u2B07\uFE0F",
  arrow_forward: "\u25B6\uFE0F",
  arrow_backward: "\u25C0\uFE0F",
  play: "\u25B6\uFE0F",
  pause: "\u23F8\uFE0F",
  stop: "\u23F9\uFE0F",
  refresh: "\u{1F504}",
  plus: "\u2795",
  minus: "\u2796",
  // Animals
  dog: "\u{1F415}",
  cat: "\u{1F408}",
  bird: "\u{1F426}",
  fish: "\u{1F41F}",
  butterfly: "\u{1F98B}",
  bee: "\u{1F41D}",
  snake: "\u{1F40D}",
  turtle: "\u{1F422}",
  crab: "\u{1F980}",
  octopus: "\u{1F419}",
  unicorn: "\u{1F984}",
  dragon: "\u{1F409}",
  // Food & Drink
  coffee: "\u2615",
  tea: "\u{1F375}",
  beer: "\u{1F37A}",
  wine: "\u{1F377}",
  pizza: "\u{1F355}",
  burger: "\u{1F354}",
  fries: "\u{1F35F}",
  taco: "\u{1F32E}",
  sushi: "\u{1F363}",
  apple: "\u{1F34E}",
  banana: "\u{1F34C}",
  cake: "\u{1F382}",
  cookie: "\u{1F36A}",
  // Celebrations
  party: "\u{1F389}",
  balloon: "\u{1F388}",
  confetti: "\u{1F38A}",
  gift: "\u{1F381}",
  christmas_tree: "\u{1F384}",
  fireworks: "\u{1F386}",
  // Hands
  point_up: "\u261D\uFE0F",
  point_down: "\u{1F447}",
  point_left: "\u{1F448}",
  point_right: "\u{1F449}",
  raised_hand: "\u270B",
  fist: "\u270A",
  v: "\u270C\uFE0F",
  muscle: "\u{1F4AA}",
  pray: "\u{1F64F}",
  // Transport
  car: "\u{1F697}",
  bus: "\u{1F68C}",
  train: "\u{1F686}",
  plane: "\u2708\uFE0F",
  ship: "\u{1F6A2}",
  bike: "\u{1F6B2}",
  // Places
  house: "\u{1F3E0}",
  office: "\u{1F3E2}",
  hospital: "\u{1F3E5}",
  school: "\u{1F3EB}",
  globe: "\u{1F30D}",
  earth: "\u{1F30D}",
  earth_americas: "\u{1F30E}",
  earth_asia: "\u{1F30F}",
  // Colors
  red_circle: "\u{1F534}",
  orange_circle: "\u{1F7E0}",
  yellow_circle: "\u{1F7E1}",
  green_circle: "\u{1F7E2}",
  blue_circle: "\u{1F535}",
  purple_circle: "\u{1F7E3}",
  white_circle: "\u26AA",
  black_circle: "\u26AB",
  // Misc
  zap: "\u26A1",
  boom: "\u{1F4A5}",
  hundred: "\u{1F4AF}",
  zzz: "\u{1F4A4}",
  speech_balloon: "\u{1F4AC}",
  thought_balloon: "\u{1F4AD}",
  mega: "\u{1F4E3}",
  bell: "\u{1F514}",
  pin: "\u{1F4CC}",
  scissors: "\u2702\uFE0F",
  art: "\u{1F3A8}",
  music: "\u{1F3B5}",
  notes: "\u{1F3B6}",
  mic: "\u{1F3A4}",
  headphones: "\u{1F3A7}",
  game: "\u{1F3AE}",
  dice: "\u{1F3B2}",
  // Programming
  terminal: "\u{1F4BB}",
  code: "\u{1F4BB}",
  database: "\u{1F5C4}\uFE0F",
  api: "\u{1F50C}",
  test_tube: "\u{1F9EA}",
  microscope: "\u{1F52C}",
  satellite: "\u{1F6F0}\uFE0F",
  atom: "\u269B\uFE0F"
};
function replaceEmoji(text) {
  return text.replace(/:([a-z0-9_]+):/gi, (match, name) => {
    const emoji = EMOJI[name.toLowerCase()];
    return emoji ?? match;
  });
}
function listEmoji() {
  return Object.keys(EMOJI);
}
function hasEmoji(name) {
  return name.toLowerCase() in EMOJI;
}

// src/logging/logger.ts
var Logger = class {
  handler;
  constructor(console) {
    this.handler = new RichHandler(console);
  }
  debug(message, context) {
    this.log("debug", message, context);
  }
  info(message, context) {
    this.log("info", message, context);
  }
  warn(message, context) {
    this.log("warn", message, context);
  }
  error(message, context) {
    this.log("error", message, context);
  }
  log(level, message, context) {
    const record = {
      level,
      message,
      timestamp: /* @__PURE__ */ new Date(),
      context
    };
    this.handler.handle(record);
  }
};

// src/utils/inspect.ts
function inspect(obj, options = {}) {
  const console = new Console();
  const title = options.title ?? `Inspect: ${obj?.constructor?.name ?? typeof obj}`;
  const table = new Table({ box: "single", showHeader: true });
  table.addColumn("Property", { style: "cyan" });
  table.addColumn("Type", { style: "magenta" });
  table.addColumn("Value");
  const props = Object.getOwnPropertyNames(obj);
  props.sort();
  for (const prop of props) {
    const value = obj[prop];
    let type = typeof value;
    let valueStr = String(value);
    if (value === null) type = "null";
    else if (Array.isArray(value)) type = "Array";
    if (valueStr.length > 50) valueStr = valueStr.substring(0, 47) + "...";
    table.addRow(prop, type, valueStr);
  }
  let json = "";
  try {
    json = JSON.stringify(obj, null, 2);
  } catch {
    json = "[Circular]";
  }
  new Syntax(json, "json");
  console.print(new Panel(table, { title, box: "round", borderStyle: void 0 }));
}

// src/index.ts
var globalConsole = new Console();
var print = globalConsole.print.bind(globalConsole);

export { Align, Color, Columns, Confirm, Console, DEFAULT_THEME, DRACULA, EMOJI, GITHUB_LIGHT, Grid, JSON2 as JSON, Layout, Live, Logger, MONOKAI, MONOKAI_THEME, Markdown, MarkupParser, ONE_DARK, Padding, Palette, Panel, PercentageColumn, Progress, ProgressBar, Prompt, RichHandler, Rule, SPINNERS, SYNTAX_THEMES, Segment, Spinner, Status, Style, Syntax, Table, Text, Theme, TimeElapsedColumn, TimeRemainingColumn, Traceback, Tree, getBox, getSpinner, listSpinners as getSpinnerNames, getTheme, hasEmoji, inspect, install, installTracebackHandler, isRenderable, listBoxStyles, listEmoji, listSpinners2 as listSpinners, print, replaceEmoji, sleep, track };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map