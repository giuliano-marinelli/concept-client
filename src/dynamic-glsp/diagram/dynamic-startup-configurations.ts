import {
  CenterAction,
  GridManager,
  IActionDispatcher,
  IDiagramStartup,
  RequestModelAction,
  TYPES
} from '@eclipse-glsp/client';

import {
  LoadLanguageSpecificationAction,
  ReadyLanguageSpecificationAction
} from '../protocol/action/language-specification-load';
import { inject, injectable, optional } from 'inversify';

import { ExternalServices } from './dynamic-external-services';

@injectable()
export class StartupConfiguration implements IDiagramStartup {
  rank = -1;

  @inject(TYPES.IActionDispatcher)
  protected readonly actionDispatcher!: IActionDispatcher;

  @inject(GridManager)
  @optional()
  protected gridManager?: GridManager;

  @inject(ExternalServices)
  protected services!: ExternalServices;

  async preRequestModel(): Promise<void> {
    // action for setting the grid visible
    this.gridManager?.setGridVisible(true);

    // set action dispatcher for use with external services
    this.services.actionDispatcher = this.actionDispatcher;

    // define reload language function for use with external services
    this.services.reloadLanguage = async () => {
      await this.sendLoadLanguageSpecificationAction();
    };

    // load the language specification for the first time
    await this.sendLoadLanguageSpecificationAction();
  }

  private async sendLoadLanguageSpecificationAction() {
    const loadLanguageSpecificationAction = LoadLanguageSpecificationAction.create(this.services.language!, {
      showcaseMode: this.services.showcaseMode
    });
    await this.actionDispatcher?.request<ReadyLanguageSpecificationAction>(loadLanguageSpecificationAction);
  }
}
