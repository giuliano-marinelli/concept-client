import { AfterViewInit, Component, Input, NgZone, ViewContainerRef } from '@angular/core';

import {
  DynamicDiagramLoader,
  DynamicGLSPWebSocketProvider,
  DynamicInspector,
  DynamicLanguageSpecification,
  DynamicSvgExporter,
  IDynamicDiagramOptions,
  initializeDynamicDiagramContainer
} from '@dynamic-glsp/client';
import { AModelElementSchema, AModelRootSchema, Language, LanguageElement } from '@dynamic-glsp/protocol';
import {
  Action,
  BaseJsonrpcGLSPClient,
  ConnectionProvider,
  DirtyStateChange,
  EditorContextService,
  GLSPActionDispatcher,
  GLSPClient,
  MessageAction,
  StatusAction,
  TYPES,
  ViewerOptions
} from '@eclipse-glsp/client';
import { JsonForms } from '@jsonforms/angular';

import { environment } from '../../../../../environments/environment';
import { bootstrapRenderers } from '../../../../../json-forms/bootstrap-renderer';
import { AModelToJSONForms } from '../../../global/amodel-to-json-forms';
import { Container } from 'inversify';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'model-editor',
  templateUrl: './model-editor.component.html',
  styleUrl: './model-editor.component.scss'
})
export class ModelEditorComponent implements AfterViewInit {
  @Input() sourceUri: string = '';
  @Input() language?: string | Language | LanguageElement;
  @Input() editMode: 'readonly' | 'editable' = 'editable';
  @Input() showcaseMode: boolean = false; // only works with language element

  dirty: boolean = false; // to be used in the parent component to check if the model is dirty

  // diagramType for the GLSP server (it's always dynamic)
  diagramType: string = 'dynamic';

  clientId: string = 'sprotty';
  wsUrl: string = `ws://${environment.host}:${environment.glspPort}/${environment.glsp}`;

  glspClient!: GLSPClient;
  glspContainer!: Container;
  glspWSProvider?: DynamicGLSPWebSocketProvider;

  constructor(
    public auth: AuthService,
    private ngZone: NgZone,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let self = this;

      // create a new custom WebSocket provider for the GLSP client, which sends authentication headers as protocol messages
      this.glspWSProvider = new DynamicGLSPWebSocketProvider(this.wsUrl, this.auth.getToken() || undefined);

      async function glspOnConnection(connectionProvider: ConnectionProvider, isReconnecting = false): Promise<void> {
        // create GLSP client for the JSON RPC communication with server
        self.glspClient = new BaseJsonrpcGLSPClient({ id: environment.glsp, connectionProvider });

        const diagramOptions: IDynamicDiagramOptions = {
          clientId: self.clientId,
          diagramType: self.diagramType,
          sourceUri: self.sourceUri,
          editMode: self.editMode,
          showcaseMode: self.showcaseMode,
          language: self.language,
          glspClientProvider: async () => self.glspClient
        };

        const viewerOptions: Partial<ViewerOptions> = { baseDiv: 'sprotty' };

        // create the diagram container which use the clientId to find the DOM element to render the diagram
        // and the diagramType to find the correct diagram configuration in the GLSP server
        // and the glspClient to communicate via JSON RPC with the GLSP server
        self.glspContainer = initializeDynamicDiagramContainer(diagramOptions, viewerOptions);

        // set inspector event listener for create json forms on element selection changed
        // and update inspector element on json forms data change
        const inspector = self.glspContainer.get(DynamicInspector);
        inspector.onElementChange.on(
          'select',
          (container: HTMLElement, elementId: string, elementAModel: AModelRootSchema, elementModel: any) => {
            self.createJsonForms(container, elementId, elementAModel, elementModel);
          }
        );

        const actionDispatcher = self.glspContainer.get(GLSPActionDispatcher);

        const diagramLoader = self.glspContainer.get(DynamicDiagramLoader);

        const editorContext = self.glspContainer.get(EditorContextService);

        await diagramLoader.load({
          requestModelOptions: {
            isReconnecting
          }
        });

        if (isReconnecting) {
          const message = `Connection to the ${environment.glsp} GLSP server got closed. Connection was successfully re-established.`;
          const timeout = 5000;
          const severity = 'WARNING';

          actionDispatcher.dispatchAll([
            StatusAction.create(message, { severity, timeout }),
            MessageAction.create(message, { severity })
          ]);

          return;
        }

        // check if the model is dirty and set the dirty state
        editorContext.onDirtyStateChanged((event: DirtyStateChange) => {
          self.dirty = event.isDirty;
        });
      }

      async function glspOnReconnect(connectionProvider: ConnectionProvider): Promise<void> {
        self.glspClient.stop();
        glspOnConnection(connectionProvider, true);
      }

      this.glspWSProvider.listen({ onConnection: glspOnConnection, onReconnect: glspOnReconnect, logger: console });
    });
  }

  async sendAction(action: Action): Promise<void> {
    await this.glspContainer?.get(GLSPActionDispatcher).dispatch(action);
  }

  async loadLanguage(language?: string | Language | LanguageElement): Promise<void> {
    if (language) this.language = language;
    await this.glspContainer?.get(DynamicLanguageSpecification).sendLoadLanguageSpecificationAction(language);
  }

  getSVG(): string {
    return (this.glspContainer?.get(TYPES.SvgExporter) as DynamicSvgExporter).getSvg() || '';
  }

  createJsonForms(container: HTMLElement, elementId: string, elementAModel: AModelRootSchema, elementModel: any): void {
    const componentRef = this.viewContainerRef.createComponent(JsonForms);
    componentRef.instance.renderers = [...bootstrapRenderers];
    componentRef.instance.data = elementModel;

    // generate json forms schema and ui schema from the aModel
    const { schema, uiSchema } = AModelToJSONForms(elementAModel as AModelElementSchema);

    componentRef.instance.schema = schema;
    componentRef.instance.uischema = uiSchema;

    container.appendChild(componentRef.location.nativeElement);

    // to avoid firing the change event before the component is initialized
    setTimeout(() => {
      componentRef.instance.dataChange.subscribe((event: any) => {
        // call update element on inspector with the new model and elementId
        this.glspContainer.get(DynamicInspector).updateElement(elementId, event);
      });
    }, 0);
  }
}
