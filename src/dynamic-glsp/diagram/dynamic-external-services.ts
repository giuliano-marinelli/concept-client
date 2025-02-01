import { IActionDispatcher } from '@eclipse-glsp/client';

import { Language, LanguageElement } from '../protocol/language';

import { AModelRootSchema } from '../protocol/amodel';

export const ExternalServices = Symbol('ExternalServices');

export interface ExternalServices {
  inspectorCreateElement?: (
    container: HTMLElement,
    elementId: string,
    elementAModel: AModelRootSchema,
    elementModel: any
  ) => void;
  inspectorElementChanged?: (elementId: string, newModel: any) => void;
  language?: string | Language | LanguageElement;
  showcaseMode?: boolean;
  actionDispatcher?: IActionDispatcher;
  reloadLanguage?: () => void;
  requestModel?: () => void;
  centerElements?: (elementIds: string[], options?: { animate?: boolean; retainZoom?: boolean }) => void;
}
