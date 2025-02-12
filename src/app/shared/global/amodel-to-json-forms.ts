import { AModelArraySchema, AModelElementSchema, AModelEnumSchema, AModelObjectSchema } from '@dynamic-glsp/protocol';
import { JsonSchema, Labelable, Layout, Scoped, UISchemaElement } from '@jsonforms/core';

export function AModelToJSONForms(
  aModel: AModelElementSchema,
  scope: string = '#/'
): { schema: JsonSchema; uiSchema: UISchemaElement } {
  let schema: JsonSchema;
  let uiSchema: UISchemaElement;
  let jsonForms: { schema: JsonSchema; uiSchema: UISchemaElement };

  switch (aModel.type) {
    case 'string':
    case 'integer':
    case 'boolean':
      jsonForms = AModelPropertyToJSONForms(aModel as AModelElementSchema);
      break;
    case 'array':
      jsonForms = AModelArrayToJSONForms(aModel as AModelArraySchema, scope);
      break;
    case 'object':
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

  if (aModel.default) {
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

  const uiSchema: UISchemaElement = {
    type: 'Control'
  };

  return { schema, uiSchema };
}
