import { GModelElementSchema } from '@eclipse-glsp/protocol';

import { SelectionField, SelectionType } from 'apollo-dynamic';

import { MetaModel } from './meta-model.entity';

import { AModelElementSchema } from '../glsp/protocol/amodel';

@SelectionType('MetaElement')
export class MetaElement {
  @SelectionField()
  id?: string;
  @SelectionField(() => MetaModel)
  metaModel?: MetaModel;
  @SelectionField()
  type?: string;
  @SelectionField()
  name?: string;
  @SelectionField()
  tag?: string;
  @SelectionField()
  gModel?: GModelElementSchema;
  @SelectionField()
  aModel?: AModelElementSchema;
  @SelectionField()
  defaultModel?: any;
  @SelectionField()
  createdAt?: Date;
  @SelectionField()
  updatedAt?: Date;
  @SelectionField()
  deletedAt?: Date;
}
