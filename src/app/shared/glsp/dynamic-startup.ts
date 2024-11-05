import {
  Action,
  Args,
  GLSPActionDispatcher,
  GridManager,
  IDiagramStartup,
  RequestAction,
  ResponseAction,
  hasObjectProp
} from '@eclipse-glsp/client';

import { inject, injectable, optional } from 'inversify';

import { ExternalServices } from './dynamic-external-services';

/*
 This RequestAction and ResponseActions interfaces must be in a shared project to be used in both the client and server.
 This are shared by: DynamicStartup and DynamicLoadLanguageSpecificationActionHandler
*/

export interface LoadLanguageSpecificationAction extends RequestAction<ReadyLanguageSpecificationAction> {
  kind: typeof LoadLanguageSpecificationAction.KIND;

  languageID: string;
}

export namespace LoadLanguageSpecificationAction {
  export const KIND = 'loadLanguageSpecification';

  export function is(object: unknown): object is LoadLanguageSpecificationAction {
    return RequestAction.hasKind(object, KIND) && hasObjectProp(object, 'languageID');
  }

  export function create(languageID: string, options: { args?: Args } = {}): LoadLanguageSpecificationAction {
    return {
      kind: KIND,
      requestId: '',
      languageID,
      ...options
    };
  }
}

export interface ReadyLanguageSpecificationAction extends ResponseAction {
  kind: typeof ReadyLanguageSpecificationAction.KIND;
}

export namespace ReadyLanguageSpecificationAction {
  export const KIND = 'readyLanguageSpecification';

  export function is(object: unknown): object is ReadyLanguageSpecificationAction {
    return Action.hasKind(object, KIND);
  }

  export function create(options: { responseId?: string } = {}): ReadyLanguageSpecificationAction {
    return {
      kind: KIND,
      responseId: '',
      ...options
    };
  }
}

@injectable()
export class DynamicStartup implements IDiagramStartup {
  rank = -1;

  @inject(GLSPActionDispatcher)
  protected actionDispatcher?: GLSPActionDispatcher;

  @inject(GridManager)
  @optional()
  protected gridManager?: GridManager;

  @inject(ExternalServices)
  protected services?: ExternalServices;

  async preRequestModel(): Promise<void> {
    // action for loading the language specification
    const requestAction = LoadLanguageSpecificationAction.create('96cc12d7-41e0-4e06-b097-1d97a57da87b'); // it's a hardcoded languageID
    await this.actionDispatcher?.request<ReadyLanguageSpecificationAction>(requestAction);

    // action for setting the grid visible
    this.gridManager?.setGridVisible(true);
  }
}
