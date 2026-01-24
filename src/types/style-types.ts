export type StandardColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'bright_black'
  | 'bright_red'
  | 'bright_green'
  | 'bright_yellow'
  | 'bright_blue'
  | 'bright_magenta'
  | 'bright_cyan'
  | 'bright_white';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type Color = StandardColor | RGB | string | number; // number for 256-color palette

export interface StyleOptions {
  color?: Color;
  backgroundColor?: Color;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dim?: boolean;
  reverse?: boolean;
  blink?: boolean;
  hidden?: boolean;
}
