import { Segment } from './segment';
import { Style } from './style';
import { Theme, DEFAULT_THEME } from '../themes/theme';

/**
 * Parses Rich markup into segments.
 * Example: "[bold red]Hello[/bold red] [green]World[/green]"
 */
export class MarkupParser {
  // Regex that matches standard tags [tag] and closing tags [/] or [/tag]
  // We use a non-greedy match for content inside brackets
  private static readonly TAG_REGEX = /\[(\/)?([\w\s#.,()]*?)\]/g;
  
  private theme: Theme;

  constructor(theme?: Theme) {
      this.theme = theme ?? DEFAULT_THEME;
  }

  parse(markup: string): Segment[] {
    const segments: Segment[] = [];
    const styleStack: Style[] = [Style.null()];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex lastIndex because it's static
    MarkupParser.TAG_REGEX.lastIndex = 0;

    while ((match = MarkupParser.TAG_REGEX.exec(markup)) !== null) {
      const fullMatch = match[0];
      const isClosing = !!match[1];
      const tagContent = match[2];
      const index = match.index;

      // Ignore empty tags []
      if (!isClosing && !tagContent) {
          continue;
      }

      // Add text before the tag
      if (index > lastIndex) {
        const text = markup.substring(lastIndex, index);
        segments.push(new Segment(text, styleStack[styleStack.length - 1]));
      }

      if (isClosing) {
        // Closing tag - for now we just pop regardless of name matching
        if (styleStack.length > 1) {
          styleStack.pop();
        }
      } else {
        // Opening tag
        const currentStyle = styleStack[styleStack.length - 1];
        
        // Resolve style: check theme first, then parse
        let nextStyle = this.theme.get(tagContent);
        if (nextStyle === Style.null() && !this.theme.styles[tagContent]) {
            // Not in theme, parse as raw style
            nextStyle = Style.parse(tagContent);
        } else if (this.theme.styles[tagContent]) {
            // It was found in theme
        }
        
        // Wait, theme.get returns Style.null() if not found. 
        // But Style.null() is a valid return for "none" theme key.
        // We need to know if it was ACTUALLY found.
        // Let's improve logic:
        
        // Try simple parse if it looks like a complex style string (spaces)
        if (tagContent.includes(' ')) {
             nextStyle = Style.parse(tagContent);
        } else {
             const themeStyle = this.theme.styles[tagContent];
             if (themeStyle) {
                 nextStyle = typeof themeStyle === 'string' ? Style.parse(themeStyle) : themeStyle;
             } else {
                 nextStyle = Style.parse(tagContent);
             }
        }

        const newStyle = currentStyle.combine(nextStyle);
        styleStack.push(newStyle);
      }

      lastIndex = index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < markup.length) {
      const text = markup.substring(lastIndex);
      segments.push(new Segment(text, styleStack[styleStack.length - 1]));
    }

    return segments.filter(s => s.text.length > 0);
  }
}
