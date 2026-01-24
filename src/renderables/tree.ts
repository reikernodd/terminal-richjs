/** biome-ignore-all assist/source/organizeImports: false */
import type { Console } from '../console/console';
import type { ConsoleOptions } from '../types/console-options';
import { isRenderable, type Renderable, type RenderResult } from '../types/renderable';
import { Segment } from '../core/segment';
import { Style } from '../core/style';
import { splitLines } from '../core/lines';

export interface TreeOptions {
  guideStyle?: string;
  hideRoot?: boolean;
}

// Tree guide characters
const TREE_GUIDES = {
  standard: {
    branch: '├── ',
    last: '└── ',
    vertical: '│   ',
    space: '    ',
  },
  bold: {
    branch: '┣━━ ',
    last: '┗━━ ',
    vertical: '┃   ',
    space: '    ',
  },
  double: {
    branch: '╠══ ',
    last: '╚══ ',
    vertical: '║   ',
    space: '    ',
  },
  ascii: {
    branch: '|-- ',
    last: '`-- ',
    vertical: '|   ',
    space: '    ',
  },
};

/**
 * Hierarchical tree structure for displaying nested data.
 * Supports any renderable as node content, including Panels, Syntax, and Tables.
 */
export class Tree implements Renderable {
  private children: Tree[] = [];
  private guideStyle: Style;
  private guides: typeof TREE_GUIDES.standard;

  constructor(
    public readonly label: string | Renderable,
    public readonly options: TreeOptions = {},
  ) {
    this.guideStyle = Style.parse(options.guideStyle ?? '#6e7681 dim');

    // Select guide characters based on style
    if (options.guideStyle === 'bold') {
      this.guides = TREE_GUIDES.bold;
    } else if (options.guideStyle === 'double') {
      this.guides = TREE_GUIDES.double;
    } else if (options.guideStyle === 'ascii') {
      this.guides = TREE_GUIDES.ascii;
    } else {
      this.guides = TREE_GUIDES.standard;
    }
  }

  /**
   * Add a child node to the tree.
   * Returns the added Tree node for method chaining.
   */
  add(label: string | Renderable | Tree): Tree {
    if (label instanceof Tree) {
      this.children.push(label);
      return label;
    }

    const node = new Tree(label, this.options);
    this.children.push(node);
    return node;
  }

  __rich_console__(console: Console, options: ConsoleOptions): RenderResult {
    const segments: Segment[] = [];

    if (!this.options.hideRoot) {
      // Render the root label
      this.renderLabel(this.label, segments, console, options);
      segments.push(new Segment('\n', Style.null(), true));
    }

    // Render children
    this.renderChildren(this.children, '', segments, console, options);

    return { segments, width: 0 };
  }

  /**
   * Render a label (string or renderable) and add segments.
   */
  private renderLabel(
    label: string | Renderable,
    segments: Segment[],
    console: Console,
    options: ConsoleOptions,
  ): void {
    if (typeof label === 'string') {
      segments.push(new Segment(label));
    } else if (isRenderable(label)) {
      const result = label.__rich_console__(console, options);
      if ('segments' in result) {
        // For single-line renderables, just add segments
        const labelSegments = result.segments.filter((s) => !s.isControl || s.text !== '\n');
        segments.push(...labelSegments);
      }
    }
  }

  /**
   * Render child nodes with appropriate prefixes.
   */
  private renderChildren(
    children: Tree[],
    prefix: string,
    segments: Segment[],
    console: Console,
    options: ConsoleOptions,
  ): void {
    children.forEach((child, index) => {
      const isLast = index === children.length - 1;
      const connector = isLast ? this.guides.last : this.guides.branch;
      const continuation = isLast ? this.guides.space : this.guides.vertical;

      // Render child label
      const labelSegments: Segment[] = [];
      if (typeof child.label === 'string') {
        labelSegments.push(new Segment(child.label));
      } else if (isRenderable(child.label)) {
        const result = child.label.__rich_console__(console, options);
        if ('segments' in result) {
          labelSegments.push(...result.segments);
        }
      }

      // Split label into lines for multiline renderables
      const labelLines = splitLines(labelSegments);

      // First line gets the connector
      if (labelLines.length > 0) {
        segments.push(new Segment(prefix, this.guideStyle));
        segments.push(new Segment(connector, this.guideStyle));
        segments.push(...labelLines[0]);
        segments.push(new Segment('\n', Style.null(), true));
      }

      // Subsequent lines get continuation prefix
      for (let i = 1; i < labelLines.length; i++) {
        segments.push(new Segment(prefix, this.guideStyle));
        segments.push(new Segment(continuation, this.guideStyle));
        segments.push(...labelLines[i]);
        segments.push(new Segment('\n', Style.null(), true));
      }

      // Render grandchildren
      const newPrefix = prefix + continuation;
      this.renderChildren(child.children, newPrefix, segments, console, options);
    });
  }
}
