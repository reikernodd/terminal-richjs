#!/usr/bin/env node
import { Command } from 'commander';
import process2 from 'process';
import wrapAnsi from 'wrap-ansi';
import os from 'os';
import terminalSize from 'terminal-size';
import chalk from 'chalk';
import tinycolor from 'tinycolor2';
import stringWidth from 'string-width';
import fs from 'fs';
import hljs from 'highlight.js';
import 'cli-boxes';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var Terminal = class {
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
    if (env.TERM?.includes("256")) {
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
    const rgbMatch = word.match(
      /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
    );
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
    return new _Theme(
      {
        danger: `bold ${palette.get("danger")}`,
        success: `bold ${palette.get("success")}`,
        warning: `bold ${palette.get("warning")}`,
        info: `${palette.get("info")}`
      },
      palette
    );
  }
};
var DEFAULT_THEME = new Theme({
  none: Style.null(),
  dim: Style.parse("dim"),
  bright: Style.parse("bold"),
  // Semantic
  danger: Style.parse("bold red"),
  success: Style.parse("bold green"),
  warning: Style.parse("bold yellow"),
  info: Style.parse("cyan"),
  // Components
  "rule.line": Style.parse("green"),
  "repr.str": Style.parse("green"),
  "repr.brace": Style.parse("bold")
});
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
    return stringWidth(this.text);
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
    return new _Segment(
      text ?? this.text,
      style ?? this.style,
      isControl ?? this.isControl
    );
  }
};

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
  return typeof obj === "object" && obj !== null && "__rich_console__" in obj && // biome-ignore lint/suspicious/noExplicitAny: Type guard check
  typeof obj.__rich_console__ === "function";
}

// src/traceback/trace.ts
var Trace;
((Trace2) => {
  function parse(error) {
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
      const columnNumber = parseInt(locParts.pop() || "0", 10);
      const lineNumber = parseInt(locParts.pop() || "0", 10);
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
  Trace2.parse = parse;
})(Trace || (Trace = {}));

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
({
  keyword: Style.parse("bold magenta"),
  string: Style.parse("yellow"),
  number: Style.parse("magenta"),
  comment: Style.parse("dim white"),
  operator: Style.parse("bold white"),
  function: Style.parse("green"),
  class: Style.parse("bold blue"),
  title: Style.parse("bold white")
});
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
        lineWidth += stringWidth(token.text);
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
    segments.push(
      new Segment(" (most recent call last)\n", Style.parse("dim"))
    );
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
      segments.push(
        new Segment(String(frame.lineNumber), Style.parse("#e5c07b bold"))
      );
      segments.push(new Segment(", in ", frameHeaderStyle));
      segments.push(
        new Segment(frame.functionName, Style.parse("#98c379 italic"))
      );
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
        segments.push(
          new Segment("[source not available]", Style.parse("dim italic"))
        );
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
    frames: [
      "\u{1F55B} ",
      "\u{1F550} ",
      "\u{1F551} ",
      "\u{1F552} ",
      "\u{1F553} ",
      "\u{1F554} ",
      "\u{1F555} ",
      "\u{1F556} ",
      "\u{1F557} ",
      "\u{1F558} ",
      "\u{1F559} ",
      "\u{1F55A} "
    ]
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
      throw new Error(
        `No spinner called '${name}'. Use listSpinners() to see available spinners.`
      );
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
    return new Status(message, {
      spinnerName: options.spinner,
      ...options
    });
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
marked.setOptions({
  renderer: new TerminalRenderer()
});

// src/index.ts
var globalConsole = new Console();
globalConsole.print.bind(globalConsole);

// src/cli.ts
var VERSION = "0.2.1";
var program = new Command();
program.name("richjs").description("Rich terminal rendering for Node.js - CLI toolbox for fancy terminal output").version(VERSION, "-v, --version", "Display version").argument("[resource]", 'Path to file, URL, or text to render (use "-" for stdin)', "").helpOption("-h, --help", "Display help");
program.action((resource) => {
  const console = new Console();
  if (!resource) {
    console.print("[yellow]No resource provided. Use --help for usage information.[/]");
    process.exit(0);
  }
  console.print(`[green]Resource received:[/] ${resource}`);
  console.print("[dim]Full CLI implementation coming in next phases...[/]");
});
program.parse();
//# sourceMappingURL=cli.js.map
//# sourceMappingURL=cli.js.map