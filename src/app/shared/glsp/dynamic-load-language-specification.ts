import { GLSPActionDispatcher, IDiagramStartup } from '@eclipse-glsp/client';

import { inject, injectable } from 'inversify';

import {
  LoadLanguageSpecificationAction,
  ReadyLanguageSpecificationAction
} from './protocol/action/load-language-specification';

@injectable()
export class LoadLanguageSpecification implements IDiagramStartup {
  rank = -1;

  @inject(GLSPActionDispatcher)
  protected actionDispatcher?: GLSPActionDispatcher;

  async preRequestModel(): Promise<void> {
    // action for loading the language specification
    const requestAction = LoadLanguageSpecificationAction.create('96cc12d7-41e0-4e06-b097-1d97a57da87b'); // it's a hardcoded languageID
    await this.actionDispatcher?.request<ReadyLanguageSpecificationAction>(requestAction);
  }
}
