import { Injectable } from '@angular/core';

import { Mutation, Query, gql } from 'apollo-angular';
import { SelectionField, SelectionType } from 'apollo-dynamic';
import { DynamicMutation, DynamicQuery } from 'apollo-dynamic-angular';

import { MetaElement } from './meta-element.entity';
import { User } from './user.entity';

@SelectionType('MetaModel', {
  default: {
    relations: {
      owner: {
        profile: {
          publicEmail: true
        },
        primaryEmail: true
      },
      // collaborators: {
      //   profile: {
      //     publicEmail: true
      //   },
      //   primaryEmail: true
      // },
      metaElements: true
    }
  }
})
export class MetaModel {
  @SelectionField()
  id?: string;
  @SelectionField()
  name?: string;
  @SelectionField()
  tag?: string;
  @SelectionField()
  tags?: string[];
  @SelectionField()
  version?: string;
  @SelectionField()
  description?: string;
  @SelectionField()
  logo?: string;
  @SelectionField()
  createdAt?: Date;
  @SelectionField()
  updatedAt?: Date;
  @SelectionField()
  deletedAt?: Date;
  @SelectionField(() => User)
  owner?: User;
  @SelectionField(() => User)
  collaborators?: User[];
  @SelectionField(() => MetaElement)
  metaElements?: MetaElement[];
}

@Injectable({ providedIn: 'root' })
export class CreateMetaModel extends DynamicMutation<{ createMetaModel: MetaModel }> {
  override document = gql`
    mutation CreateMetaModel($metaModelCreateInput: MetaModelCreateInput!) {
      createMetaModel(metaModelCreateInput: $metaModelCreateInput) {
        MetaModel
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateMetaModel extends DynamicMutation<{ updateMetaModel: MetaModel }> {
  override document = gql`
    mutation UpdateMetaModel($metaModelUpdateInput: MetaModelUpdateInput!, $logoFile: Upload) {
      updateMetaModel(metaModelUpdateInput: $metaModelUpdateInput, logoFile: $logoFile) {
        MetaModel
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class DeleteMetaModel extends Mutation<{ deleteMetaModel: string }> {
  override document = gql`
    mutation DeleteMetaModel($id: UUID!, $password: String!) {
      deleteMetaModel(id: $id, password: $password)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CreateMetaElement extends DynamicMutation<{ createMetaElement: MetaElement }> {
  override document = gql`
    mutation CreateMetaElement($metaElementCreateInput: MetaElementCreateInput!) {
      createMetaElement(metaElementCreateInput: $metaElementCreateInput) {
        MetaElement
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateMetaElement extends DynamicMutation<{ updateMetaElement: MetaElement }> {
  override document = gql`
    mutation UpdateMetaElement($metaElementUpdateInput: MetaElementUpdateInput!) {
      updateMetaElement(metaElementUpdateInput: $metaElementUpdateInput) {
        MetaElement
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class DeleteMetaElement extends Mutation<{ deleteMetaElement: string }> {
  override document = gql`
    mutation DeleteMetaElement($id: UUID!) {
      deleteMetaElement(id: $id)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CheckMetaModelTagExists extends Query<{ checkMetaModelTagExists: boolean }> {
  override document = gql`
    query CheckMetaModelTagExists($tag: String!, $metaModel: UUID) {
      checkMetaModelTagExists(tag: $tag, metaModel: $metaModel)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CheckMetaElementTagExists extends Query<{ checkMetaElementTagExists: boolean }> {
  override document = gql`
    query CheckMetaElementTagExists($tag: String!, $metaModel: UUID!, $metaElement: UUID) {
      checkMetaElementTagExists(tag: $tag, metaModel: $metaModel, metaElement: $metaElement)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindMetaModel extends DynamicQuery<{ metaModel: MetaModel }> {
  override document = gql`
    query MetaModel($id: UUID!) {
      metaModel(id: $id) {
        MetaModel
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindMetaModels extends DynamicQuery<{ metaModels: { set: MetaModel[]; count: number } }> {
  override document = gql`
    query MetaModels($where: [MetaModelWhereInput!], $order: [MetaModelOrderInput!], $pagination: PaginationInput) {
      metaModels(where: $where, order: $order, pagination: $pagination) {
        set {
          MetaModel
        }
        count
      }
    }
  `;
}
