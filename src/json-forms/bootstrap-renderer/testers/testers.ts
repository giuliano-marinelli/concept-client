import { and, optionIs, schemaTypeIs, uiTypeIs } from '@jsonforms/core';

/**
 * Tests whether the given UI schema is of type Control and if the schema
 * is of type condition.
 * @type {Tester}
 */
export const isConditionControl = and(uiTypeIs('Control'), schemaTypeIs('object'), optionIs('format', 'condition'));
