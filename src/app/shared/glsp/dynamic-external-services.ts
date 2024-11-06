import { AModelRootSchema } from './protocol/amodel';

export const ExternalServices = Symbol('ExternalServices');

export interface ExternalServices {
  inspectorCreateElement?: (
    container: HTMLElement,
    elementId: string,
    elementAModel: AModelRootSchema,
    elementModel: any
  ) => void;
  inspectorElementChanged?: (elementId: string, newModel: any) => void;
}
