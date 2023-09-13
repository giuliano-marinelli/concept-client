export type AbsoluteLenght = "cm" | "mm" | "Q" | "in" | "pt" | "pc" | "px";
export type FontRelativeLenght = "em" | "rem" | "ex" | "rex" | "cap" | "rcap" | "ch" | "rch" | "ic" | "ric" | "lh" | "rlh";
export type ViewportPercentageLenght = "*vw" | "*vh" | "*vi" | "*vb" | "*vmin" | "*vmax";
export type Lenght = `${number}${AbsoluteLenght | FontRelativeLenght | ViewportPercentageLenght}`;
export type Percentage = `${number}%`;
export type LenghtPercentage = Lenght | Percentage | number | `${number}`;
export type Position = { top?: LenghtPercentage, right?: LenghtPercentage, bottom?: LenghtPercentage, left?: LenghtPercentage };
export type Color = string;
export type Bind = string;

export interface Markup {
  selector: string,
  type: "rect" | "circle" | "ellipse" | "polygon" | "line" | "polyline" | "text" | "list",
  position?: "relative" | "absolute"
  width: LenghtPercentage | "auto",
  height: LenghtPercentage | "auto",
  x: LenghtPercentage,
  y: LenghtPercentage,
  minWidth?: LenghtPercentage,
  minHeight?: LenghtPercentage,
  maxWidth?: LenghtPercentage,
  maxHeight?: LenghtPercentage,
  padding?: LenghtPercentage | Position,
  margin?: LenghtPercentage | Position,
  text?: any,
  rx?: LenghtPercentage,
  ry?: LenghtPercentage,
  children?: Markup[],
  bind?: Bind,
  style?: any
}

export let defaultMarkup: Markup = {
  selector: "root", type: "rect", x: 0, y: 0, width: "100%", height: "100%"
}

export interface Token {
  [tokenName: string]: "string" | "boolean" | "integer" | "float" | string[] | Token[] | Token
}

export interface Value {
  [tokenName: string]: string | boolean | number | string[] | Value[] | Value
}

export interface Primitive {
  markup: Markup,
  tokens: Token
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

export let defaultTransform: Transform = {
  insideWidth: 0, insideHeight: 0, insideX: 0, insideY: 0,
  outsideWidth: 0, outsideHeight: 0, outsideX: 0, outsideY: 0,
  width: 0, height: 0, x: 0, y: 0
}
