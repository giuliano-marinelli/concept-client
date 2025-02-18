import { AfterViewInit, Component, Input, NgZone, ViewContainerRef } from '@angular/core';

import {
  DynamicGLSPWebSocketProvider,
  ExternalServices,
  initializeDynamicDiagramContainer
} from '@dynamic-glsp/client';
import { AModelElementSchema, AModelRootSchema, Language, LanguageElement } from '@dynamic-glsp/protocol';
import {
  Action,
  BaseJsonrpcGLSPClient,
  ConnectionProvider,
  DiagramLoader,
  FeatureModule,
  GLSPActionDispatcher,
  GLSPClient,
  IDiagramOptions,
  MessageAction,
  StatusAction,
  ViewerOptions,
  accessibilityModule,
  createDiagramOptionsModule,
  standaloneMarkerNavigatorModule,
  standaloneViewportModule
} from '@eclipse-glsp/client';
import { JsonForms } from '@jsonforms/angular';

import { bootstrapRenderers } from '../../../../json-forms/bootstrap-renderer';
import { AModelToJSONForms } from '../../global/amodel-to-json-forms';
import { Container } from 'inversify';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'model-editor',
  templateUrl: './model-editor.component.html',
  styleUrl: './model-editor.component.scss'
})
export class ModelEditorComponent implements AfterViewInit {
  @Input() sourceUri: string = '';
  @Input() language: string | Language | LanguageElement = '96cc12d7-41e0-4e06-b097-1d97a57da87b';
  @Input() editMode: 'readonly' | 'editable' = 'editable';
  @Input() showcaseMode: boolean = false; // only works with language element

  port: number = 3001;

  // id for the JSON RPC Client
  id: string = 'dynamic';

  // diagramType for the GLSP server (it's always dynamic)
  diagramType: string = 'dynamic';

  clientId: string = 'sprotty';
  webSocketUrl: string = `ws://127.0.0.1:${this.port}/${this.id}`;

  glspClient!: GLSPClient;
  container!: Container;
  wsProvider?: DynamicGLSPWebSocketProvider;

  services: ExternalServices = {};

  constructor(
    public auth: AuthService,
    private ngZone: NgZone,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let self = this;

      // define services for language specification
      this.services.language = this.language;
      this.services.showcaseMode = this.showcaseMode;

      // define services for the inspector
      this.services.inspectorCreateElement = (
        container: HTMLElement,
        elementId: string,
        elementAModel: AModelRootSchema,
        elementModel: any
      ) => {
        self.createJsonForms(container, elementId, elementAModel, elementModel);
      };

      // create a new custom WebSocket provider for the GLSP client, which sends authentication headers as protocol messages
      this.wsProvider = new DynamicGLSPWebSocketProvider(this.webSocketUrl, this.auth.getToken() || undefined);

      async function glspOnConnection(connectionProvider: ConnectionProvider, isReconnecting = false): Promise<void> {
        // create GLSP client for the JSON RPC communication with server
        self.glspClient = new BaseJsonrpcGLSPClient({ id: self.id, connectionProvider });

        const diagramOptions: IDiagramOptions = {
          clientId: self.clientId,
          diagramType: self.diagramType,
          sourceUri: self.sourceUri,
          editMode: self.editMode,
          glspClientProvider: async () => self.glspClient
        };

        const viewerOptions: Partial<ViewerOptions> = { baseDiv: 'sprotty' };

        // create the diagram container which use the clientId to find the DOM element to render the diagram
        // and the diagramType to find the correct diagram configuration in the GLSP server
        // and the glspClient to communicate via JSON RPC with the GLSP server
        self.container = initializeDynamicDiagramContainer(diagramOptions, viewerOptions, self.services);

        const actionDispatcher = self.container.get(GLSPActionDispatcher);
        const diagramLoader = self.container.get(DiagramLoader);

        await diagramLoader.load({
          requestModelOptions: {
            isReconnecting
          }
        });

        if (isReconnecting) {
          const message = `Connection to the ${self.id} GLSP server got closed. Connection was successfully re-established.`;
          const timeout = 5000;
          const severity = 'WARNING';

          actionDispatcher.dispatchAll([
            StatusAction.create(message, { severity, timeout }),
            MessageAction.create(message, { severity })
          ]);

          return;
        }
      }

      async function glspOnReconnect(connectionProvider: ConnectionProvider): Promise<void> {
        self.glspClient.stop();
        glspOnConnection(connectionProvider, true);
      }

      this.wsProvider.listen({ onConnection: glspOnConnection, onReconnect: glspOnReconnect, logger: console });
    });
  }

  async sendAction(action: Action): Promise<void> {
    await this.services.actionDispatcher?.dispatch(action);
  }

  async reloadLanguage(language?: string | Language | LanguageElement): Promise<void> {
    if (language) {
      this.language = language;
      this.services.language = language;
    }
    await this.services.reloadLanguage?.();
  }

  getSVG(): string {
    return this.services.getSVG?.() || '';
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
        // send the new model to the GLSP external services so it can be used by the inspector
        this.services.inspectorElementChanged?.(elementId, event);
      });
    }, 0);
  }
}
