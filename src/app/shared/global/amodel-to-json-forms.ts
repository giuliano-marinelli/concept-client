import {
  AModelArraySchema,
  AModelBooleanSchema,
  AModelElementSchema,
  AModelEnumSchema,
  AModelIntegerSchema,
  AModelObjectSchema,
  AModelStringSchema,
  BooleanStyle,
  EnumStyle,
  IntegerStyle,
  StringStyle,
  Type
} from '@dynamic-glsp/protocol';
import { JsonSchema, Labelable, Layout, Scoped, UISchemaElement } from '@jsonforms/core';

export function AModelToJSONForms(
  aModel: AModelElementSchema,
  scope: string = '#/'
): { schema: JsonSchema; uiSchema: UISchemaElement } {
  let schema: JsonSchema;
  let uiSchema: UISchemaElement;
  let jsonForms: { schema: JsonSchema; uiSchema: UISchemaElement };

  switch (aModel.type) {
    case Type.STRING:
    case Type.INTEGER:
    case Type.BOOLEAN:
      jsonForms = AModelPropertyToJSONForms(aModel as AModelElementSchema);
      break;
    case Type.ARRAY:
      jsonForms = AModelArrayToJSONForms(aModel as AModelArraySchema, scope);
      break;
    case Type.OBJECT:
    default:
      jsonForms = AModelObjectToJSONForms(aModel as AModelObjectSchema, scope);
      break;
  }

  schema = jsonForms.schema;
  uiSchema = jsonForms.uiSchema;

  if (aModel.label) {
    (uiSchema as Labelable).label = aModel.label;
  }

  if (aModel.key) {
    (uiSchema as UISchemaElement & Scoped).scope = scope + 'properties/' + aModel.key;
  }

  if (aModel.default != undefined) {
    schema.default = aModel.default;
  }

  if (aModel.readOnly) {
    (schema as any).readOnly = aModel.readOnly;
  }

  return { schema, uiSchema };
}

export function AModelObjectToJSONForms(
  aModel: AModelObjectSchema,
  scope: string = '#/'
): { schema: JsonSchema; uiSchema: UISchemaElement } {
  const schema: JsonSchema = {
    type: 'object',
    properties: {}
  };

  const uiSchema: UISchemaElement = {
    type: aModel.key ? 'Group' : 'VerticalLayout',
    elements: []
  } as any;

  if (Array.isArray(aModel.properties)) {
    const propertiesScope = aModel.key ? scope + 'properties/' + aModel.key + '/' : scope;
    aModel.properties?.forEach((property) => {
      const { schema: propertySchema, uiSchema: propertyUiSchema } = AModelToJSONForms(property, propertiesScope);
      if (property.key) {
        schema.properties![property.key] = propertySchema;
        (uiSchema as Layout).elements?.push(propertyUiSchema);
      }
    });
  }

  return { schema, uiSchema };
}

export function AModelArrayToJSONForms(
  aModel: AModelArraySchema,
  scope: string = '#/'
): { schema: JsonSchema; uiSchema: UISchemaElement } {
  const schema: JsonSchema = {
    type: 'array',
    items: {}
  };

  const uiSchema: UISchemaElement = {
    type: 'Control',
    options: {}
  };

  if (aModel.items) {
    const { schema: itemsSchema, uiSchema: itemsUiSchema } = AModelToJSONForms(aModel.items, scope);
    schema.items = itemsSchema;
    uiSchema.options!['detail'] = itemsUiSchema;
  }

  return { schema, uiSchema };
}

export function AModelPropertyToJSONForms(aModel: AModelElementSchema): {
  schema: JsonSchema;
  uiSchema: UISchemaElement;
} {
  const schema: JsonSchema = {
    type: aModel.type
  };

  if ((aModel as AModelEnumSchema).enum?.length) {
    if (((aModel as AModelEnumSchema).enum?.[0] as any).const) schema.oneOf = (aModel as AModelEnumSchema).enum as any;
    else schema.enum = (aModel as AModelEnumSchema).enum;
  }

  if ((aModel as AModelStringSchema).minLength != undefined)
    schema.minLength = (aModel as AModelStringSchema).minLength;
  if ((aModel as AModelStringSchema).maxLength != undefined)
    schema.maxLength = (aModel as AModelStringSchema).maxLength;

  if ((aModel as AModelIntegerSchema).minimum != undefined) schema.minimum = (aModel as AModelIntegerSchema).minimum;
  if ((aModel as AModelIntegerSchema).maximum != undefined) schema.maximum = (aModel as AModelIntegerSchema).maximum;

  const uiSchema: UISchemaElement = {
    type: 'Control'
  };

  if ((aModel as any).style) {
    if ((aModel as AModelEnumSchema).enum?.length) {
      if ((aModel as AModelEnumSchema).style === EnumStyle.RADIO) uiSchema.options = { format: 'radio' };
    } else {
      if (aModel.type === Type.STRING && (aModel as AModelStringSchema).style === StringStyle.TEXTAREA)
        uiSchema.options = { multi: true };
      else if (aModel.type === Type.INTEGER && (aModel as AModelIntegerSchema).style === IntegerStyle.RANGE)
        uiSchema.options = { slider: true };
      else if (aModel.type === Type.BOOLEAN && (aModel as AModelBooleanSchema).style === BooleanStyle.SWITCH)
        uiSchema.options = { toggle: true };
    }
  }

  return { schema, uiSchema };
}
