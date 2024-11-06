import { GridManager, IDiagramStartup } from '@eclipse-glsp/client';

import { inject, injectable, optional } from 'inversify';

@injectable()
export class StartupConfiguration implements IDiagramStartup {
  rank = -1;

  @inject(GridManager)
  @optional()
  protected gridManager?: GridManager;

  async preRequestModel(): Promise<void> {
    // action for setting the grid visible
    this.gridManager?.setGridVisible(true);
  }
}
