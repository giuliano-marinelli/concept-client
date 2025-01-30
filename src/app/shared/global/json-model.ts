import { IconName } from '@fortawesome/angular-fontawesome';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';

import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

export interface JsonModelElementConfig {
  icon?: IconName;
  descriptor?: string;
  children?: string;
  fields?: string[];
  default?: any;
  schema?: JsonSchema;
  uiSchema?: UISchemaElement;
}

export interface JsonModelConfig {
  defaultIcon?: IconName;
  nodes?: {
    [key: string]: JsonModelElementConfig;
  };
}

export class JsonModel<ModelType = any> {
  private model: ModelType;
  private modelSubject: BehaviorSubject<ModelType>;

  private config: JsonModelConfig;
  private configSubject: BehaviorSubject<JsonModelConfig>;

  private selectedNodePath: string;
  private selectedNodePathSubject: BehaviorSubject<string>;
  private selectedNodeSubject: BehaviorSubject<any>;
  private selectedNodeConfigSubject: BehaviorSubject<any>;

  constructor(model: ModelType, config?: JsonModelConfig) {
    // initialize the model and its observable
    this.model = model;
    this.modelSubject = new BehaviorSubject<ModelType>(this.model);

    // initialize the model config and its observable
    this.config = config || { defaultIcon: 'circle' };
    this.configSubject = new BehaviorSubject<JsonModelConfig>(this.config);

    // initialize the selected node path and its observable
    this.selectedNodePath = '';
    this.selectedNodePathSubject = new BehaviorSubject<string>(this.selectedNodePath);

    const selectedNode = this.getNode(this.selectedNodePath);

    // initialize the selected node observable
    this.selectedNodeSubject = new BehaviorSubject<any>(selectedNode);

    // initialize the selected node config observable
    this.selectedNodeConfigSubject = new BehaviorSubject<any>(this.config.nodes?.[selectedNode.type]);

    // select the root node
    this.selectNode('');
  }

  /**
   * Returns the JSON model observable for subscribe.
   */
  getModel(): Observable<ModelType> {
    return this.modelSubject.asObservable();
  }

  /**
   * Returns the JSON model config observable for subscribe.
   */
  getConfig(): Observable<JsonModelConfig> {
    return this.configSubject.asObservable();
  }

  /**
   * Returns the selected node path observable for subscribe.
   */
  getSelectedNodePath(): Observable<string> {
    return this.selectedNodePathSubject.asObservable();
  }

  /**
   * Returns the selected node observable for subscribe
   */
  getSelectedNode(): any {
    return this.selectedNodeSubject.asObservable();
  }

  /**
   * Returns the selected node config observable for subscribe
   */
  getSelectedNodeConfig(): any {
    return this.selectedNodeConfigSubject.asObservable();
  }

  /**
   * Returns the node at the given path.
   *
   * @param {string} path - The path to the node.
   * @returns {any} The node at the given path.
   *
   * @example
   * // Returns the third child of the second child of the first child of the root node.
   * const node = jsonModel.getNode('/0/1/2');
   *
   * @example
   * // Returns the 'then' field of the second child of the first child of the root node.
   * const node = jsonModel.getNode('/0/1/then');
   */
  getNode(path: string): any {
    const pathArray: string[] = path.split('/').splice(1);
    let currentNode = this.model;
    if (!currentNode) return;
    for (const indexOrField of pathArray) {
      if (!isNaN(indexOrField as any)) {
        currentNode = this.getNodeChildren(currentNode)?.[Number(indexOrField)]!;
      } else {
        currentNode = (currentNode as any)?.[indexOrField];
      }
    }
    return currentNode;
  }

  /**
   * Returns the parent node of the node at the given path.
   */
  getNodeParent(path: string): any {
    return this.getNode(this.getNodeParentPath(path));
  }

  /**
   * Returns the parent node path of the node at the given path.
   */
  getNodeParentPath(path: string): string {
    return path.slice(0, path.lastIndexOf('/'));
  }

  /**
   * Returns the index or field of the node at the given path.
   */
  getNodeIndexOrField(path: string): number | string {
    return path.slice(path.lastIndexOf('/') + 1);
  }

  /**
   * Returns the paths of nodes that have the given property, optionally starting at a given node.
   */
  getNodePathsByProperty(property: string, startNode?: any): string[] {
    const paths: string[] = [];
    const checkNode = (node: any, path: string) => {
      if (node && node[property]) paths.push(path);
      // if the node is a structure node, check its fields
      if (this.checkNodeCanHaveFields(node)) {
        const fields = this.config.nodes?.[node.type]?.fields;
        if (fields) fields.forEach((field: string) => checkNode(node[field], `${path}/${field}`));
      }
      // if the node has children, check its children
      if (this.getNodeChildren(node))
        this.getNodeChildren(node)!.forEach((child: any, index: number) => checkNode(child, `${path}/${index}`));
    };
    checkNode(startNode || this.model, '');
    return paths;
  }

  getNodeChildren(node: any): any[] | undefined {
    if (!node || !this.checkNodeCanHaveChildren(node)) return undefined;
    return node[this.config.nodes?.[node.type]?.children!];
  }

  getNodeChildrenField(node: any): string | undefined {
    return this.config.nodes?.[node.type]?.children;
  }

  getNodeTypes(): string[] {
    return Object.keys(this.config.nodes || {});
  }

  getNodeIcon(node: any): IconName {
    return this.config.nodes?.[node.type]?.icon || this.config.defaultIcon || 'circle';
  }

  getNodeTypeIcon(type: string): IconName {
    return this.config.nodes?.[type]?.icon || this.config.defaultIcon || 'circle';
  }

  getNodeDescriptor(node: any): string {
    return node && this.config.nodes?.[node.type]?.descriptor ? node[this.config.nodes?.[node.type]?.descriptor!] : '';
  }

  /**
   * Set the entire model to the given model.
   */
  setModel(model: ModelType): void {
    this.model = model;
    this.modelSubject.next(this.model);
  }

  /**
   * Set the config to the given config.
   */
  setConfig(config: JsonModelConfig): void {
    this.config = config;
    this.configSubject.next(this.config);
  }

  /**
   * Sets the node at the given path with the given node.
   *
   * If the path is empty, it will set the node as the root node.
   *
   * If update is false, it will avoid update the selected node and emit the updated model.
   */
  setNode(path: string, node: any, update: boolean = true): void {
    // if the path is empty, set the node as the root node
    if (!path) {
      this.model = node;
      return;
    }

    const parent = this.getNodeParent(path);
    const indexOrField = this.getNodeIndexOrField(path);
    if (parent) {
      if (!isNaN(indexOrField as any)) {
        this.getNodeChildren(parent)![Number(indexOrField)] = node;
      } else {
        parent[indexOrField] = node;
      }
    }

    if (update) {
      // emit the updated model
      this.modelSubject.next(this.model);
    }
  }

  /**
   * Set the selected node to the node at the given path.
   */
  selectNode(path: string): void {
    // unselect the previously selected node
    const previousSelectedNode = this.getNode(this.selectedNodePath);
    if (previousSelectedNode) delete previousSelectedNode._selected;

    // select the new node
    this.selectedNodePath = path;
    const selectedNode = this.getNode(this.selectedNodePath);
    selectedNode._selected = true;

    // emit the selected node path
    this.selectedNodePathSubject.next(this.selectedNodePath);

    // emit the selected node
    this.selectedNodeSubject.next(selectedNode);

    // emit the selected node config
    this.selectedNodeConfigSubject.next(this.config.nodes?.[selectedNode.type]);
  }

  /**
   * Updates the selected node by searching for the node with the _selected property.
   */
  updateSelectedNode(): void {
    const selectedPath: string = this.getNodePathsByProperty('_selected')[0];
    if (selectedPath) this.selectNode(selectedPath);
  }

  /**
   * Adds a node to the given path.
   *
   * If the given node is a string, it will create a new node with the given type using default values if available in the config.
   *
   * If asChild is true or the node at the path can't have children, it will add the node as a child of the parent of the node at the path.
   * Else it will add the node as child of the node at the path.
   *
   * If update is false, it will avoid update the selected node and emit the updated model.
   */
  addNode(path: string, node: any | string, asChild: boolean = true, update: boolean = true): void {
    if (typeof node === 'string') {
      const type = node;
      const defaultValues = this.config.nodes?.[type]?.default;
      node = { type, ...defaultValues };
    }
    const toNode = this.getNode(path);
    const parent = this.getNodeParent(path);
    if (!toNode) {
      const field = this.getNodeIndexOrField(path);
      parent[field] = node;
    } else {
      if (asChild || !this.checkNodeCanHaveChildren(toNode)) {
        const childrenField = this.getNodeChildrenField(parent)!;
        if (!this.getNodeChildren(parent)) parent[childrenField] = [];
        // add the node as children of parent at the position of the path
        parent[childrenField].splice(Number(this.getNodeIndexOrField(path)), 0, node);
      } else {
        const childrenField = this.getNodeChildrenField(toNode)!;
        if (!this.getNodeChildren(toNode)) toNode[childrenField] = [];
        toNode[childrenField].push(node);
      }
    }

    if (update) {
      // update selected node
      this.updateSelectedNode();

      // emit the updated model
      this.modelSubject.next(this.model);
    }
  }

  /**
   * Removes a node at the given path.
   *
   * If update is false, it will avoid update the selected node and emit the updated model.
   */
  removeNode(path: string, update: boolean = true): void {
    const parent = this.getNodeParent(path);
    const indexOrField = this.getNodeIndexOrField(path);
    if (parent) {
      if (!isNaN(indexOrField as any)) {
        this.getNodeChildren(parent)?.splice(Number(indexOrField), 1);
      } else {
        parent[indexOrField] = null;
      }
    }

    if (update) {
      // update selected node
      this.updateSelectedNode();

      // emit the updated model
      this.modelSubject.next(this.model);
    }
  }

  /**
   * Removes the nodes that are marked for removal with the property _remove.
   *
   * If update is false, it will avoid update the selected node and emit the updated model in each removal.
   */
  updateRemovedNodes(update: boolean = true): void {
    const removePaths: string[] = this.getNodePathsByProperty('_remove');
    removePaths.forEach((path: string) => this.removeNode(path, update));
  }

  /**
   * Moves a node from the fromPath to the toPath.
   *
   * If asChild is true or the node at the toPath can't have children, it will add the node as a child of the parent of the node at the toPath.
   * Else it will add the node as child of the node at the toPath.
   *
   * If update is false, it will avoid update the selected node and emit the updated model.
   */
  moveNode(fromPath: string, toPath: string, asChild: boolean, update: boolean = true): void {
    const fromNode = this.getNode(fromPath);

    // clone fromNode to keep the original node
    const fromNodeClone = _.cloneDeep(fromNode);

    // mark fromNode for removal later
    fromNode._remove = true;

    // add fromNode into toNode
    this.addNode(toPath, fromNodeClone, asChild, false);

    // remove all nodes that are marked for removal
    this.updateRemovedNodes(false);

    if (update) {
      // update selected node
      this.updateSelectedNode();

      // emit the updated model
      this.modelSubject.next(this.model);
    }
  }

  /**
   * Check if a node can be moved to the given path.
   *
   * If the toPath is not the same as the fromPath, and the toPath is not a child of the fromPath,
   * and the toNode can have children.
   */
  checkNodeCanMoveToPath(fromPath: string | undefined, toPath: string, toNode: any): boolean {
    // obtain the parent node of the toPath to check if it can have children
    const toParent = this.getNodeParent(toPath);
    return (
      fromPath != undefined &&
      toPath != undefined &&
      fromPath !== toPath &&
      !toPath.startsWith(fromPath) &&
      toParent != undefined &&
      (!toNode || this.checkNodeCanHaveChildren(toParent) || this.checkNodeCanHaveChildren(toNode))
    );
  }

  /**
   * Check if a node can have children.
   *
   * If it's not explicitly set to false in the config, and it's not a structure node.
   */
  checkNodeCanHaveChildren(node: any): boolean {
    return node && this.config.nodes?.[node.type]?.children && !this.checkNodeCanHaveFields(node);
  }

  /**
   * Check if a node is a structure node by checking if it's defined in the structures config.
   */
  checkNodeCanHaveFields(node: any): boolean {
    return node && this.config.nodes?.[node.type]?.fields !== undefined;
  }

  checkNodeIsRoot(node: any): boolean {
    return node === this.model;
  }
}
