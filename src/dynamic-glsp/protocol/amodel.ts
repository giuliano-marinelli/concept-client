export enum Type {
  STRING = 'string',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object'
}

export enum EnumStyle {
  SELECT = 'select',
  RADIO = 'radio'
}

export interface AModelElementSchema {
  type: Type;
  key?: string;
  label?: string;
  default?: any;
  readOnly?: boolean;
  rule?: any;
}

export interface AModelEnumSchema extends AModelElementSchema {
  type: Type.STRING | Type.INTEGER | Type.BOOLEAN;
  enum?: [{ const: string | number | boolean; title: string }] | string[] | number[] | boolean[];
}

export interface AModelArraySchema extends AModelElementSchema {
  type: Type.ARRAY;
  items: AModelElementSchema;
}

export interface AModelObjectSchema extends AModelElementSchema {
  type: Type.OBJECT;
  properties: AModelElementSchema[];
}

export interface AModelRootSchema extends AModelObjectSchema {}
