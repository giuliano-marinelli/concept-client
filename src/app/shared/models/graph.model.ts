export type AbsoluteLenght = "cm" | "mm" | "Q" | "in" | "pt" | "pc" | "px";
export type FontRelativeLenght = "em" | "rem" | "ex" | "rex" | "cap" | "rcap" | "ch" | "rch" | "ic" | "ric" | "lh" | "rlh";
// export type ViewportPercentageLenght = "*vw" | "*vh" | "*vi" | "*vb" | "*vmin" | "*vmax";
export type Lenght = `${number}${AbsoluteLenght}` | number | `${number}`;
export type FontLength = `${number}${AbsoluteLenght}` | `${number}${FontRelativeLenght}` | number | `${number}`
export type Percentage = `${number}%`;
export type LenghtPercentage = Lenght | Percentage;
export type FontLengthPercentage = FontLength | Percentage;
export type Position = { top?: LenghtPercentage, right?: LenghtPercentage, bottom?: LenghtPercentage, left?: LenghtPercentage };
export type Color = string;
export type Bind = string;

export interface Markup {
  selector: string,
  type: "rect" | "circle" | "ellipse" | "polygon" | "line" | "polyline" | "text" | "list",
  //bounding box positioning
  position?: "relative" | "absolute"
  width: LenghtPercentage | "auto",
  height: LenghtPercentage | "auto",
  x?: LenghtPercentage,
  y?: LenghtPercentage,
  minWidth?: LenghtPercentage,
  minHeight?: LenghtPercentage,
  maxWidth?: LenghtPercentage,
  maxHeight?: LenghtPercentage,
  padding?: LenghtPercentage | Position,
  margin?: LenghtPercentage | Position,
  //sub elements
  children?: Markup[],
  //geometry attributes
  rx?: LenghtPercentage | "auto",
  ry?: LenghtPercentage | "auto",
  cx?: LenghtPercentage,
  cy?: LenghtPercentage,
  r?: LenghtPercentage,
  //line properties
  x1?: LenghtPercentage,
  y1?: LenghtPercentage,
  x2?: LenghtPercentage,
  y2?: LenghtPercentage,
  //polygon/polyline properties
  points?: string,
  //text attributes
  text?: {
    valign?: "top" | "center" | "bottom",
    halign?: "left" | "center" | "right",
    lineHeight?: FontLengthPercentage,
  },
  //binding
  bind?: Bind,
  //style attributes
  style?: {
    "fill"?: Color,
    "stroke"?: Color,
    "stroke-width"?: LenghtPercentage,
    "font-size"?: LenghtPercentage,
    "text-anchor"?: "start" | "middle" | "end",
    //"central" | "text-after-edge" | "text-before-edge"
    "dominant-baseline"?: "auto" | "use-script" | "no-change" | "reset-size" | "alphabetic" | "hanging" | "ideographic" | "mathematical" | "central" | "middle" | "text-after-edge" | "text-before-edge",
    "alignment-baseline"?: "auto" | "use-script" | "no-change" | "reset-size" | "alphabetic" | "hanging" | "ideographic" | "mathematical" | "central" | "middle" | "text-after-edge" | "text-before-edge",
    "text-decoration"?: "none" | "underline" | "overline" | "line-through" | "blink",
    "text-transform"?: "none" | "capitalize" | "uppercase" | "lowercase",
    "text-overflow"?: "clip" | "ellipsis",
    "white-space"?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line",
    "word-wrap"?: "normal" | "break-word",
    "word-break"?: "normal" | "break-all" | "keep-all",
    "letter-spacing"?: LenghtPercentage,
    "word-spacing"?: LenghtPercentage,
    "text-indent"?: LenghtPercentage,
    "text-align"?: "start" | "end" | "left" | "right" | "center" | "justify" | "match-parent",
    "direction"?: "ltr" | "rtl" | "inherit",
    "writing-mode"?: "horizontal-tb" | "vertical-rl" | "vertical-lr" | "sideways-rl" | "sideways-lr",
    "fill-opacity"?: number,
    "stroke-opacity"?: number,
    "opacity"?: number,
    "font-family"?: string,
    "font-style"?: "normal" | "italic" | "oblique",
    "font-weight"?: "normal" | "bold" | "bolder" | "lighter" | number,
    "font-variant"?: "normal" | "small-caps",
    "font-stretch"?: "normal" | "ultra-condensed" | "extra-condensed" | "condensed" | "semi-condensed" | "semi-expanded" | "expanded" | "extra-expanded" | "ultra-expanded",
  }
}

export let defaultMarkup: Markup = {
  selector: "root", type: "rect", x: 0, y: 0, width: "100%", height: "100%"
}

// export interface Token {
//   [tokenName: string]: "string" | "boolean" | "integer" | "float" | string[] | Token[] | Token
// }

export interface Token {
  name: string,
  type: "text" | "bool" | "enum" | "object" | "list",
  label: string,
  default: Value | string | boolean,
  input?:
  "text" | "textarea" | //for text
  "checkbox" | "switch" | //for bool
  "radio" | "select", //for enum
  //for text
  rows?: number,
  placeholder?: string
  validator?: "string" | "number" | "integer" | "float"
  //for bool
  map?: {
    true: string,
    false: string
  }
  //for enum
  options: {
    [enumName: string]: string
  }
  //for object
  properties: Token[]
  //for list
  item: Token
}

export interface Value {
  [tokenName: string]: string | boolean | number | string[] | Value[] | Value
}

export interface Primitive {
  markup: Markup,
  tokens: Token[]
}

export interface Model {
  [primitiveName: string]: Primitive
}

export interface Instance {
  model: string,
  values: Value,
  transform: CellTransform,
  // attributes?: any
}

export interface CellTransform {
  width: number,
  height: number,
  x: number,
  y: number
}

export let defaultCellTransform: CellTransform = {
  width: 100, height: 100, x: 0, y: 0
}

export interface Transform {
  width: number,
  height: number,
  x: number,
  y: number,
  insideWidth: number,
  insideHeight: number,
  insideX: number,
  insideY: number,
  outsideWidth: number,
  outsideHeight: number,
  outsideX: number,
  outsideY: number,
}

export function defaultTransform(): Transform {
  return {
    insideWidth: 0, insideHeight: 0, insideX: 0, insideY: 0,
    outsideWidth: 0, outsideHeight: 0, outsideX: 0, outsideY: 0,
    width: 0, height: 0, x: 0, y: 0
  }
}

export interface Geometry {
  //geometry attributes
  rx?: number,
  ry?: number,
  cx?: number,
  cy?: number,
  r?: number,
  //line properties
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number,
  //polygon/polyline properties
  // points?: string,
}

// export function defaultGeometry(): Geometry {
//   return {
//     rx: 0, ry: 0, cx: 0, cy: 0, r: 0,
//     x1: 0, y1: 0, x2: 0, y2: 0,
//     // points: "",
//   }
// };

export interface Text {
  //text attributes
  x?: number,
  y?: number,
  text?: string,
}

// export function defaultText(): Text {
//   return {
//     x: 0, y: 0, text: ""
//   }
// }
