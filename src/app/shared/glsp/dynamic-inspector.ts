import {
  AbstractUIExtension,
  Action,
  CenterAction,
  EditorContextService,
  FitToScreenAction,
  GLSPAbstractUIExtension,
  IActionDispatcher,
  IDiagramStartup,
  MaybePromise,
  TYPES,
  codiconCSSClasses
} from '@eclipse-glsp/client';

import { inject, injectable } from 'inversify';

import { ExternalServices } from './dynamic-external-services';

export const IInspector = Symbol('IInspector');

@injectable()
export class DynamicInspector extends GLSPAbstractUIExtension implements IDiagramStartup {
  @inject(TYPES.IActionDispatcher)
  protected readonly actionDispatcher!: IActionDispatcher;

  @inject(EditorContextService)
  protected editorContext!: EditorContextService;

  @inject(ExternalServices)
  protected services!: ExternalServices;

  static readonly ID = 'button-overlay';

  id() {
    return DynamicInspector.ID;
  }

  containerClass() {
    return DynamicInspector.ID;
  }

  protected initializeContents(containerElement: HTMLElement): void {
    const exampleData = {
      name: 'John Doe'
    };

    const exampleSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      }
    };

    const exampleUiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name'
        }
      ]
    };

    this.services['jsonFormsService'].init({
      data: exampleData,
      schema: exampleSchema,
      uischema: exampleUiSchema,
      renderers: this.services['jsonFormsService'].getRenderers()
    });

    this.services['jsonFormsService'].render(this.options.baseDiv);
    // containerElement.appendChild(
    //   this.createButton('btn_center_diagram', 'Center', 'screen-normal', CenterAction.create([]))
    // );
  }

  protected createButton(): HTMLElement {
    // const baseDiv = document.getElementById(this.options.baseDiv);
    // if (baseDiv) {
    //   const button = document.createElement('div');
    //   const insertedDiv = baseDiv.insertBefore(button, baseDiv.firstChild);
    //   button.id = id;
    //   button.classList.add('overlay-button');
    //   const icon = this.createIcon(codiconId);
    //   insertedDiv.appendChild(icon);
    //   insertedDiv.onclick = () => this.actionDispatcher.dispatch(action);
    //   insertedDiv.insertAdjacentText('beforeend', label);
    //   return button;
    // }
    return document.createElement('div');
  }

  // protected createIcon(codiconId: string): HTMLElement {
  //   const icon = document.createElement('i');
  //   icon.classList.add(...codiconCSSClasses(codiconId), 'overlay-icon');
  //   return icon;
  // }

  postModelInitialization(): MaybePromise<void> {
    this.show(this.editorContext.modelRoot);
  }
}
