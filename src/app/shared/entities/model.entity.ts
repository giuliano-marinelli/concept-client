import { Injectable } from '@angular/core';

import { Mutation, Query, gql } from 'apollo-angular';
import { SelectionField, SelectionType } from 'apollo-dynamic';
import { DynamicMutation, DynamicQuery } from 'apollo-dynamic-angular';

import { MetaModel } from './meta-model.entity';
import { User } from './user.entity';

@SelectionType('Model', {
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
      metaModel: true
    }
  }
})
export class Model {
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
  preview?: string;
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
  @SelectionField(() => MetaModel)
  metaModel?: MetaModel;
  @SelectionField(() => User)
  pinnedIn?: User[];
}

@Injectable({ providedIn: 'root' })
export class CreateModel extends DynamicMutation<{ createModel: Model }> {
  override document = gql`
    mutation CreateModel($modelCreateInput: ModelCreateInput!) {
      createModel(modelCreateInput: $modelCreateInput) {
        Model
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateModel extends DynamicMutation<{ updateModel: Model }> {
  override document = gql`
    mutation UpdateModel($modelUpdateInput: ModelUpdateInput!) {
      updateModel(modelUpdateInput: $modelUpdateInput) {
        Model
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class DeleteModel extends Mutation<{ deleteModel: string }> {
  override document = gql`
    mutation DeleteModel($id: UUID!, $password: String!) {
      deleteModel(id: $id, password: $password)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CheckModelTagExists extends Query<{ checkModelTagExists: boolean }> {
  override document = gql`
    query CheckModelTagExists($tag: String!, $model: UUID) {
      checkModelTagExists(tag: $tag, model: $model)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindModel extends DynamicQuery<{ model: Model }> {
  override document = gql`
    query Model($id: UUID!) {
      model(id: $id) {
        Model
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindModels extends DynamicQuery<{ models: { set: Model[]; count: number } }> {
  override document = gql`
    query Models($where: [ModelWhereInput!], $order: [ModelOrderInput!], $pagination: PaginationInput) {
      models(where: $where, order: $order, pagination: $pagination) {
        set {
          Model
        }
        count
      }
    }
  `;
}
