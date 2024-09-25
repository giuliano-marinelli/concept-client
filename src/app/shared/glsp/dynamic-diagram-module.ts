import {
  ConsoleLogger,
  ContainerConfiguration,
  DEFAULT_ALIGNABLE_ELEMENT_FILTER,
  DefaultTypes,
  GCompartment,
  GEdge,
  GGraph,
  GLSPProjectionView,
  GLabel,
  GLabelView,
  IHelperLineOptions,
  LogLevel,
  PolylineEdgeViewWithGapsOnIntersections,
  STANDALONE_MODULE_CONFIG,
  TYPES,
  accessibilityModule,
  bindAsService,
  bindOrRebind,
  configureDefaultModelElements,
  debugModule,
  edgeEditToolModule,
  editLabelFeature,
  gridModule,
  helperLineModule,
  initializeDiagramContainer,
  overrideModelElement,
  toolPaletteModule
} from '@eclipse-glsp/client';

import { Container, ContainerModule } from 'inversify';

import { DynamicStartup } from './dynamic-startup';

export const dynamicDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  const context = { bind, unbind, isBound, rebind };

  // allow to enable/disable default features of the diagram on startup
  // e.g. enable/disable the grid on startup
  bindAsService(context, TYPES.IDiagramStartup, DynamicStartup);

  // configure the default logger to show only warnings and errors
  bindOrRebind(context, TYPES.LogLevel).toConstantValue(LogLevel.warn);
  bindOrRebind(context, TYPES.ILogger).to(ConsoleLogger).inSingletonScope();

  // configure the marquee tool behavior to select only the entire edge or element
  bindOrRebind(context, TYPES.IMarqueeBehavior).toConstantValue({ entireEdge: true, entireElement: true });

  // configure the helper line options dynamically
  bind<IHelperLineOptions>(TYPES.IHelperLineOptions).toDynamicValue(() => {
    const options: IHelperLineOptions = {};
    // skip compartments for alignment which are only used for structure
    options.alignmentElementFilter = (element) =>
      DEFAULT_ALIGNABLE_ELEMENT_FILTER(element) && !(element instanceof GCompartment);
    return options;
  });

  configureDefaultModelElements(context);

  // configure the GGraph (graphical model root element) for render the projection view (scrollbars for spanning the diagram)
  overrideModelElement(context, DefaultTypes.GRAPH, GGraph, GLSPProjectionView);

  // configure the GLabel (graphical model label element) with the GLabelView (default view for rendering labels)
  // and enable the edit label feature (double click on label to edit)
  overrideModelElement(context, DefaultTypes.LABEL, GLabel, GLabelView, { enable: [editLabelFeature] });

  // configure the GEdge (graphical model edge element) with the PolylineEdgeViewWithGapsOnIntersections view to render edges with gaps on intersections
  overrideModelElement(context, DefaultTypes.EDGE, GEdge, PolylineEdgeViewWithGapsOnIntersections);
});

export function initializeDynamicDiagramContainer(...containerConfiguration: ContainerConfiguration): Container {
  // create a new container and load all the modules that are needed
  // the modules are a set of bindings and configurations already defined in the GLSP client that can be reused or extended
  // the dynamicDiagramModule contains base custom bindings for our dynamic diagram language
  return initializeDiagramContainer(
    new Container(),
    ...containerConfiguration,
    {
      add: accessibilityModule,
      remove: toolPaletteModule
    },
    STANDALONE_MODULE_CONFIG, // contains a set of default modules for basic features like undo/redo, copy/paste, selection, etc.
    helperLineModule, // load bindings for helper lines for alignment
    gridModule, // load bindings for grid on the diagram and button to toggle the grid
    edgeEditToolModule, // load bindings for debug mode (it can be enable with an option at command palette)
    dynamicDiagramModule, // load all the bindings for the dynamic diagram language
    debugModule
  );
}
