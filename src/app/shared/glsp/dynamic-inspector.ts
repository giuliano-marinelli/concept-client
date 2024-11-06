import {
  AbstractUIExtension,
  EditorContextService,
  GEdge,
  GModelRoot,
  GNode,
  IActionDispatcher,
  IDiagramStartup,
  ISelectionListener,
  MaybePromise,
  TYPES
} from '@eclipse-glsp/client';

import { inject, injectable } from 'inversify';

import { ExternalServices } from './dynamic-external-services';

export const IInspector = Symbol('IInspector');

@injectable()
export class Inspector extends AbstractUIExtension implements ISelectionListener, IDiagramStartup {
  @inject(TYPES.IActionDispatcher)
  protected readonly actionDispatcher!: IActionDispatcher;

  @inject(EditorContextService)
  protected editorContext!: EditorContextService;

  @inject(ExternalServices)
  protected services!: ExternalServices;

  static readonly ID = 'inspector';

  id() {
    return Inspector.ID;
  }

  containerClass() {
    return Inspector.ID;
  }

  exampleData = {
    name: 'John Doe'
  };

  exampleSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      }
    }
  };

  exampleUiSchema = {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Control',
        scope: '#/properties/name'
      }
    ]
  };

  protected initializeContents(containerElement: HTMLElement): void {
    this.setNoSelection();
  }

  /**
   * Sets the inspector content when no element is selected.
   */
  protected setNoSelection() {
    // const noSelection = document.createElement('div');
    // noSelection.classList.add('no-selection');
    // noSelection.textContent = 'Select an element to inspect';

    this.containerElement.classList.add('collapsed');

    // wait for the container to be collapsed before removing the content
    setTimeout(() => {
      this.containerElement.innerHTML = '';
    }, 200);

    // this.containerElement.appendChild(noSelection);
  }

  /**
   * Sets the inspector content for the given element.
   */
  protected setElement(selectedElement: any) {
    console.log('SELECTED ELEMENT', selectedElement);

    this.containerElement.innerHTML = '';

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');
    this.containerElement.appendChild(formContainer);

    this.services['editor'].createForm(
      formContainer,
      selectedElement.args?.model,
      selectedElement.args?.aModel
      // this.exampleUiSchema
    );

    this.containerElement.classList.remove('collapsed');
  }

  postModelInitialization(): MaybePromise<void> {
    this.show(this.editorContext.modelRoot);
  }

  selectionChanged(root: Readonly<GModelRoot>, selectedElements: string[], deselectedElements?: string[]): void {
    if (selectedElements.length === 1) {
      const selectedElement = this.getGModelElement(root, selectedElements[0]);
      if (selectedElement) this.setElement(selectedElement);
    } else {
      this.setNoSelection();
    }
  }

  /**
   * Get the GModel element for the given id and root.
   */
  getGModelElement(root: Readonly<GModelRoot>, id: string): GNode | GEdge | undefined {
    const element = root.children.find((child) => child.id === id);
    switch (element?.type) {
      case 'node':
        return element as GNode;
      case 'edge':
        return element as GEdge;
      default:
        return undefined;
    }
  }
}
