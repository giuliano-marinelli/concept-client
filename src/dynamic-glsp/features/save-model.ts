import { Action, GModelRoot, KeyListener, TYPES, matchesKeystroke } from '@eclipse-glsp/client';

import { SaveModelAction } from '../protocol/action/model-save';
import { inject, injectable } from 'inversify';

import { SvgExporter } from './svg-exporter';

@injectable()
export class SaveModelKeyboardListener extends KeyListener {
  @inject(TYPES.SvgExporter)
  protected svgExporter?: SvgExporter;

  override keyDown(element: GModelRoot, event: KeyboardEvent): Action[] {
    if (matchesKeystroke(event, 'KeyS', 'ctrlCmd')) {
      return [SaveModelAction.create({ preview: this.svgExporter?.getSvg() })];
    }
    return [];
  }
}
