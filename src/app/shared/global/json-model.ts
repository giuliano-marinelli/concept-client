import { IconName } from '@fortawesome/angular-fontawesome';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';

import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

import { AModelToJSONForms } from './amodel-to-json-forms';

import { AModelElementSchema } from '../../../dynamic-glsp/protocol/amodel';

export interface JsonModelElementConfig {
  icon?: IconName;
  descriptor?: string | ((node: any) => string);
  children?: string;
  childrenKey?: string;
  fields?: string[];
  default?: any;
  aModel?: AModelElementSchema;
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

    // update _schemas and _uiSchemas
    this.updateSchemas();
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
    let currentNode = this.model;
    if (!currentNode) return;

    // if the path is empty, return the root node
    if (path === '') return currentNode;

    // else traverse the path to find the node
    const pathArray: string[] = path.split('/').splice(1);
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
    const parentPath = this.getNodeParentPath(path);
    return parentPath != undefined ? this.getNode(parentPath) : undefined;
  }

  /**
   * Returns the parent node path of the node at the given path.
   */
  getNodeParentPath(path: string): string | undefined {
    return path && typeof path === 'string' ? path.slice(0, path.lastIndexOf('/')) : undefined;
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
      // if the node is can have fields check them
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

  /**
   * Returns the children of the given node.
   *
   * If the node can't have children, it returns undefined.
   */
  getNodeChildren(node: any): any[] | undefined {
    if (!node || !this.checkNodeCanHaveChildren(node)) return undefined;
    return node[this.config.nodes?.[node.type]?.children!];
  }

  /**
   * Returns the children field of the given node if its defined.
   */
  getNodeChildrenField(node: any): string | undefined {
    return this.config.nodes?.[node.type]?.children;
  }

  /**
   * Returns the icon of the given node.
   */
  getNodeIcon(node: any): IconName {
    return this.config.nodes?.[node.type]?.icon || this.config.defaultIcon || 'circle';
  }

  /**
   * Returns the descriptor of the given node.
   */
  getNodeDescriptor(node: any): string {
    // if the node or the node descriptor is not defined, return empty string
    if (!node || !this.config.nodes?.[node.type]?.descriptor) return '';

    // if node descriptor is function, call it with the node
    if (typeof this.config.nodes?.[node.type]?.descriptor === 'function') {
      return (this.config.nodes?.[node.type]?.descriptor as (node: any) => string)(node);
    } else {
      return node[this.config.nodes?.[node.type]?.descriptor as string];
    }
  }

  /**
   * Returns the key of the node at the given path.
   *
   * It checks if the parent node has a childrenKey property, then it return the value of key property of the node.
   */
  getNodeKey(path: string): string {
    const parent = this.getNodeParent(path);
    const node = this.getNode(path);
    if (!parent || !node) return '';
    const childrenKey = this.config.nodes?.[parent.type]?.childrenKey;
    return childrenKey ? node[childrenKey] : '';
  }

  /**
   * Returns the schema of the node at the given path.
   *
   * If the node is child of node with childrenKey property,
   * it will have childrenKey value defined on parent as a property at the root of the schema.
   */
  getNodeSchema(node: any): JsonSchema {
    return node._schema;
  }

  /**
   * Returns the UI schema of the node at the given path.
   *
   * If the node is child of node with childrenKey property,
   * it will have childrenKey value defined on parent as a element at the root of the UI schema (after the type).
   */
  getNodeUISchema(node: any): UISchemaElement {
    return node._uiSchema;
  }

  /**
   * Returns the node types defined in the config.
   */
  getNodeTypes(): string[] {
    return Object.keys(this.config.nodes || {});
  }

  /**
   * Returns the icon of the given node type.
   */
  getNodeTypeIcon(type: string): IconName {
    return this.config.nodes?.[type]?.icon || this.config.defaultIcon || 'circle';
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
    } else {
      const parent = this.getNodeParent(path);
      const indexOrField = this.getNodeIndexOrField(path);
      if (parent) {
        if (!isNaN(indexOrField as any)) {
          this.getNodeChildren(parent)![Number(indexOrField)] = node;
        } else {
          parent[indexOrField] = node;
        }
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
    else this.selectNode('');
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

      // update schemas
      this.updateSchemas();

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

      // update schemas
      this.updateSchemas();

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

      // update schemas
      this.updateSchemas();

      // emit the updated model
      this.modelSubject.next(this.model);
    }
  }

  /**
   * It will traverse the model and update the schema and uiSchema of each node if needed.
   *
   * If the node is child of node with childrenKey property.
   * This will add the childrenKey property to the schema and the childrenKey value as a element at the root of the UI schema.
   *
   * It will use _schema and _uiSchema properties to store the updated schema and uiSchema.
   * That are the ones returned by getNodeSchema and getNodeUISchema.
   */
  updateSchemas(): void {
    // check if the node at the path has childrenKey property
    // and updates the _schema and _uiSchema properties of the children
    // calls recursively for each child
    const updateChildSchemas = (node: any) => {
      // get the node childrenKey property
      const childrenKey = this.config.nodes?.[node.type]?.childrenKey;

      // update children's _schema and _uiSchema and call recursively
      const children = this.getNodeChildren(node);
      if (children) {
        children.forEach((child: any) => {
          updateSchemas(child, childrenKey);
          updateChildSchemas(child);
        });
      }

      // update fields's _schema and _uiSchema and call recursively
      if (this.checkNodeCanHaveFields(node)) {
        const fields = this.config.nodes?.[node.type]?.fields;
        if (fields) {
          fields.forEach((field: string) => {
            const fieldNode = node[field];
            if (fieldNode) {
              updateSchemas(fieldNode);
              updateChildSchemas(fieldNode);
            }
          });
        }
      }
    };

    const updateSchemas = (node: any, childrenKey?: string | undefined) => {
      if (!node) return;

      const { schema, uiSchema } = AModelToJSONForms(this.config.nodes?.[node.type]?.aModel!);

      // if node don't have _schema and _uiSchema, add it
      if (!node._schema) node._schema = _.cloneDeep(schema);
      if (!node._uiSchema) node._uiSchema = _.cloneDeep(uiSchema);

      // get the previous childrenKey cached on the node
      const prevChildrenKey = node._childrenKey;

      // if previous childrenKey is different from the current childrenKey
      // update the _schema and _uiSchema
      if (prevChildrenKey !== childrenKey) {
        // restore the original schema, uiSchema and reset cached _childrenKey
        node._schema = _.cloneDeep(schema);
        node._uiSchema = _.cloneDeep(uiSchema);
        node._childrenKey = undefined;

        // if childrenKey is defined, add it to the _schema and _uiSchema and update the _childrenKey
        if (childrenKey) {
          // add the childrenKey property and element to the node _schema and _uiSchema
          node._schema.properties = { ...(node._schema.properties ?? {}), [childrenKey]: { type: 'string' } };
          node._schema.required = [...(node._schema.required ?? []), childrenKey];
          node._uiSchema.elements.splice(1, 0, { type: 'Control', scope: `#/properties/${childrenKey}` });

          // update the cached _childrenKey
          node._childrenKey = childrenKey;
        } else {
          // remove childrenKey property from node data
          delete node[prevChildrenKey];
        }
      }
    };

    // update the root node _schema and _uiSchema
    updateSchemas(this.model);

    // start the update from the root node
    updateChildSchemas(this.model);
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
   * If it's not explicitly set to false in the config, and it not have fields.
   */
  checkNodeCanHaveChildren(node: any): boolean {
    return (
      node &&
      this.config.nodes?.[node.type]?.children &&
      (!node[this.config.nodes?.[node.type]?.children!] ||
        Array.isArray(node[this.config.nodes?.[node.type]?.children!])) &&
      !this.checkNodeCanHaveFields(node)
    );
  }

  /**
   * Check if a node can have fields by checking if such property is defined in the config.
   */
  checkNodeCanHaveFields(node: any): boolean {
    return node && this.config.nodes?.[node.type]?.fields !== undefined;
  }

  /**
   * Check if a node path is the root node.
   */
  checkNodeIsRoot(path: string): boolean {
    return path === '';
  }
}
