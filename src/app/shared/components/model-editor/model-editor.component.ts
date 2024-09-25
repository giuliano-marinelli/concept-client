import { AfterViewInit, Component, NgZone } from '@angular/core';

import {
  BaseJsonrpcGLSPClient,
  ConnectionProvider,
  DiagramLoader,
  GLSPActionDispatcher,
  GLSPClient,
  GLSPWebSocketProvider,
  MessageAction,
  STANDALONE_MODULE_CONFIG,
  StatusAction,
  createDiagramOptionsModule
} from '@eclipse-glsp/client';

import { Container } from 'inversify';

import { initializeDynamicDiagramContainer } from '../../glsp/dynamic-diagram-module';

@Component({
  selector: 'model-editor',
  templateUrl: './model-editor.component.html',
  styleUrls: ['./model-editor.component.scss']
})
export class ModelEditorComponent implements AfterViewInit {
  port: number = 3001;
  id: string = 'dynamic';
  diagramType: string = 'dynamic';
  clientId: string = 'sprotty';
  webSocketUrl: string = `ws://127.0.0.1:${this.port}/${this.id}`;

  glspClient!: GLSPClient;
  container!: Container;
  wsProvider: GLSPWebSocketProvider = new GLSPWebSocketProvider(this.webSocketUrl);

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let self = this;

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
              glspClientProvider: async () => self.glspClient
            },
            { baseDiv: 'sprotty' }
          )
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
}
