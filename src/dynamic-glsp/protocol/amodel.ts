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
  label?: string;
  default?: any;
}

export interface AModelEnumSchema extends AModelElementSchema {
  type: Type.STRING | Type.INTEGER | Type.BOOLEAN;
  enum?: [{ const: string | number | boolean; title: string }];
}

export interface AModelArraySchema extends AModelElementSchema {
  type: Type.ARRAY;
  items: AModelElementSchema;
}

export interface AModelObjectSchema extends AModelElementSchema {
  type: Type.OBJECT;
  properties: (AModelPropertySchema | AModelEnumPropertySchema)[];
}

export interface AModelPropertySchema extends AModelElementSchema {
  key: string;
}

export interface AModelEnumPropertySchema extends AModelEnumSchema {
  key: string;
}

export interface AModelRootSchema extends AModelObjectSchema {}
