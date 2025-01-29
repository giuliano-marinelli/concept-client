import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

export class JsonModel<ModelType = any, ModelConfig = any> {
  private jsonModel: ModelType;
  private jsonModelSubject: BehaviorSubject<ModelType>;

  private jsonModelConfig: ModelConfig;
  private jsonModelConfigSubject: BehaviorSubject<ModelConfig>;

  private selectedNodePath: string;
  private selectedNodePathSubject: BehaviorSubject<string>;
  private selectedNodeSubject: BehaviorSubject<any>;
  private selectedNodeConfigSubject: BehaviorSubject<any>;

  constructor(jsonModel: ModelType, jsonModelConfig: ModelConfig) {
    // initialize the model and its observable
    this.jsonModel = jsonModel;
    this.jsonModelSubject = new BehaviorSubject<ModelType>(this.jsonModel);

    // initialize the model config and its observable
    this.jsonModelConfig = jsonModelConfig;
    this.jsonModelConfigSubject = new BehaviorSubject<ModelConfig>(this.jsonModelConfig);

    // initialize the selected node path and its observable
    this.selectedNodePath = '';
    this.selectedNodePathSubject = new BehaviorSubject<string>(this.selectedNodePath);

    const selectedNode = this.getNode(this.selectedNodePath);

    // initialize the selected node observable
    this.selectedNodeSubject = new BehaviorSubject<any>(selectedNode);

    // initialize the selected node config observable
    this.selectedNodeConfigSubject = new BehaviorSubject<any>(
      (this.jsonModelConfig as any).nodes?.[selectedNode.type] ||
        (this.jsonModelConfig as any).structures?.[selectedNode.type]
    );

    // select the root node
    this.selectNode('');
  }

  /**
   * Returns the JSON model observable for subscribe.
   */
  getModel(): Observable<ModelType> {
    return this.jsonModelSubject.asObservable();
  }

  /**
   * Returns the JSON model config observable for subscribe.
   */
  getConfig(): Observable<ModelConfig> {
    return this.jsonModelConfigSubject.asObservable();
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
    let currentNode = this.jsonModel;
    if (!currentNode) return;
    for (const indexOrField of pathArray) {
      if (!isNaN(indexOrField as any)) {
        currentNode = (currentNode as any)?.children?.[Number(indexOrField)]!;
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
      if (this.checkNodeIsStructure(node)) {
        const fields = (this.jsonModelConfig as any).structures?.[node.type]?.fields;
        if (fields) fields.forEach((field: string) => checkNode(node[field], `${path}/${field}`));
      }
      // if the node has children, check its children
      if (node?.children) node.children.forEach((child: any, index: number) => checkNode(child, `${path}/${index}`));
    };
    checkNode(startNode || this.jsonModel, '');
    return paths;
  }

  /**
   * Set the JSON model.
   */
  set(model: ModelType): void {
    this.jsonModel = model;
    this.jsonModelSubject.next(this.jsonModel);
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
    this.selectedNodeConfigSubject.next(
      (this.jsonModelConfig as any).nodes?.[selectedNode.type] ||
        (this.jsonModelConfig as any).structures?.[selectedNode.type]
    );
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
   * If asChild is true or the node at the path can't have children, it will add the node as a child of the parent of the node at the path.
   * Else it will add the node as child of the node at the path.
   *
   * If update is false, it will avoid update the selected node and emit the updated model.
   */
  addNode(path: string, node: any, asChild: boolean = true, update: boolean = true): void {
    const toNode = this.getNode(path);
    const parent = this.getNodeParent(path);
    if (!toNode) {
      const field = this.getNodeIndexOrField(path);
      parent[field] = node;
    } else {
      if (asChild || !this.checkNodeCanHaveChildren(toNode)) {
        if (!parent.children) parent.children = [];
        // add the node as children of parent at the position of the path
        parent.children.splice(Number(this.getNodeIndexOrField(path)), 0, node);
      } else {
        if (!toNode.children) toNode.children = [];
        toNode.children.push(node);
      }
    }

    if (update) {
      // update selected node
      this.updateSelectedNode();

      // emit the updated model
      this.jsonModelSubject.next(this.jsonModel);
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
        parent.children.splice(Number(indexOrField), 1);
      } else {
        parent[indexOrField] = null;
      }
    }

    if (update) {
      // update selected node
      this.updateSelectedNode();

      // emit the updated model
      this.jsonModelSubject.next(this.jsonModel);
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
      this.jsonModelSubject.next(this.jsonModel);
    }
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
      this.jsonModel = node;
      return;
    }

    const parent = this.getNodeParent(path);
    const indexOrField = this.getNodeIndexOrField(path);
    if (parent) {
      if (!isNaN(indexOrField as any)) {
        parent.children[Number(indexOrField)] = node;
      } else {
        parent[indexOrField] = node;
      }
    }

    if (update) {
      // emit the updated model
      this.jsonModelSubject.next(this.jsonModel);
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
    return (
      node && (this.jsonModelConfig as any).nodes?.[node.type]?.children !== false && !this.checkNodeIsStructure(node)
    );
  }

  /**
   * Check if a node is a structure node by checking if it's defined in the structures config.
   */
  checkNodeIsStructure(node: any): boolean {
    return (this.jsonModelConfig as any).structures?.[node?.type] !== undefined;
  }
}
