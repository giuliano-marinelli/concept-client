import { GridManager, IDiagramStartup } from '@eclipse-glsp/client';
import { MaybePromise } from '@eclipse-glsp/sprotty';

import { inject, injectable, optional } from 'inversify';

@injectable()
export class DynamicStartup implements IDiagramStartup {
  rank = -1;

  @inject(GridManager) @optional() protected gridManager?: GridManager;

  preRequestModel(): MaybePromise<void> {
    this.gridManager?.setGridVisible(true);
  }
}
