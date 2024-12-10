import { AfterViewInit, Component, NgZone, ViewContainerRef } from '@angular/core';

import {
  BaseJsonrpcGLSPClient,
  ConnectionProvider,
  DiagramLoader,
  FeatureModule,
  GLSPActionDispatcher,
  GLSPClient,
  MessageAction,
  StatusAction,
  createDiagramOptionsModule
} from '@eclipse-glsp/client';

import { DynamicGLSPWebSocketProvider } from '../../dynamic-glsp/connection/dynamic-websocket-provider';
import { ExternalServices } from '../../dynamic-glsp/diagram/dynamic-external-services';
import { Container } from 'inversify';

import {
  AModelArraySchema,
  AModelElementSchema,
  AModelObjectSchema,
  AModelRootSchema
} from '../../dynamic-glsp/protocol/amodel';

import { JsonFormsRendererComponent } from '../json-forms-renderer/json-forms-renderer.component';

import { AuthService } from '../../../services/auth.service';

import { initializeDynamicDiagramContainer } from '../../dynamic-glsp/diagram/dynamic-diagram-module';

@Component({
  selector: 'model-editor',
  templateUrl: './model-editor.component.html',
  styleUrls: ['./model-editor.component.scss']
})
export class ModelEditorComponent implements AfterViewInit {
  port: number = 3001;

  // id for the JSON RPC Client
  id: string = 'dynamic';

  // parameters for set the language (diagramType) and the model (sourceUri)
  diagramType: string = 'dynamic';
  sourceUri: string = 'dynamic';

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

      // create a new feature module for the external services (it can provide access to services outside GLSP)
      const externalServicesModule = new FeatureModule(
        (bind, unbind, isBound, rebind) => {
          const context = { bind, unbind, isBound, rebind };
          bind(ExternalServices).toConstantValue(this.services);
        },
        { featureId: Symbol('externalServices') }
      );

      async function glspOnConnection(connectionProvider: ConnectionProvider, isReconnecting = false): Promise<void> {
        // create GLSP client for the JSON RPC communication with server
        self.glspClient = new BaseJsonrpcGLSPClient({ id: self.id, connectionProvider });

        // create the diagram container which use the clientId to find the DOM element to render the diagram
        // and the diagramType to find the correct diagram configuration in the GLSP server
        // and the glspClient to communicate via JSON RPC with the GLSP server
        self.container = initializeDynamicDiagramContainer(
          createDiagramOptionsModule(
            {
              clientId: self.clientId,
              diagramType: self.diagramType,
              sourceUri: self.sourceUri,
              glspClientProvider: async () => self.glspClient
            },
            { baseDiv: 'sprotty' }
          ),
          externalServicesModule
        );

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

  createJsonForms(container: HTMLElement, elementId: string, elementAModel: AModelRootSchema, elementModel: any): void {
    const componentRef = this.viewContainerRef.createComponent(JsonFormsRendererComponent);
    componentRef.instance.data = elementModel;
    componentRef.instance.schema = elementAModel;
    componentRef.instance.uiSchema = this.createJsonFormsUI(elementAModel);
    componentRef.instance.elementId = elementId;

    container.appendChild(componentRef.location.nativeElement);

    // to avoid firing the change event before the component is initialized
    setTimeout(() => {
      componentRef.instance.dataChange.subscribe((event: { elementId: string; newModel: any }) => {
        // send the new model to the GLSP external services so it can be used by the inspector
        this.services.inspectorElementChanged?.(event.elementId, event.newModel);
      });
    }, 0);
  }

  createJsonFormsUI(elementAModel: AModelElementSchema): any {
    const uiSchema: any = {};

    if (elementAModel.type == 'string' || elementAModel.type == 'integer' || elementAModel.type == 'boolean') {
      uiSchema.type = 'Control';
    }

    if (elementAModel.type == 'object') {
      uiSchema.type = 'VerticalLayout';
      uiSchema.elements = [];
    }

    if ((elementAModel as AModelObjectSchema).properties) {
      // traverse the AModelRootSchema and create the corresponding UI schema
      Object.keys((elementAModel as AModelObjectSchema).properties).forEach((propertyKey) => {
        const property = (elementAModel as AModelObjectSchema).properties[propertyKey];
        let arrayElements =
          property.type == 'array' ? this.createJsonFormsUI((property as AModelArraySchema).items) : undefined;
        if (arrayElements && arrayElements.elements) arrayElements = arrayElements.elements;
        const uiElement = {
          type: 'Control',
          scope: `#/properties/${propertyKey}`,
          label: property.label,
          ...(property.type == 'array'
            ? {
                options: {
                  detail: {
                    type: 'VerticalLayout',
                    elements: [...arrayElements]
                  }
                }
              }
            : {})
        };
        uiSchema.elements.push(uiElement);
      });
    }

    return uiSchema;
  }
}
