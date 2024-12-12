import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';

import { GModelElementSchema } from '@eclipse-glsp/protocol';
import { IconName } from '@fortawesome/angular-fontawesome';

import _ from 'lodash';

export interface GModelTreeConfig {
  nodeIcon?: IconName;
  nodes?: {
    [key: string]: {
      icon?: IconName;
      children?: boolean;
    };
  };
  structures?: {
    [key: string]: {
      icon?: IconName;
      fields?: string[];
    };
  };
}

@Component({
  selector: 'gmodel-tree',
  templateUrl: './gmodel-tree.component.html',
  styleUrl: './gmodel-tree.component.scss'
})
export class GModelTreeComponent implements OnInit {
  @Input() gModel?: GModelElementSchema;
  @Input() config: GModelTreeConfig = {};

  @ViewChildren('placeholder') placeholders?: QueryList<ElementRef>;
  @ViewChildren('nodeContainer') nodeContainers?: QueryList<ElementRef>;

  _gModel?: GModelElementSchema;

  dragNode?: any;
  dragNodePath?: string;

  ngOnInit(): void {
    // set default config
    if (!this.config.nodeIcon) this.config.nodeIcon = 'circle';
    if (!this.config.structures) this.config.structures = {};

    // clone the gModel to prevent mutation
    this._gModel = _.cloneDeep(this.gModel);
  }

  onNodeDragStart(event: DragEvent, nodePath: string): void {
    // save a copy of the node being dragged and its path
    this.dragNode = _.cloneDeep(this.getNodeByPath(nodePath));
    this.dragNodePath = nodePath;

    // set the drag effect to move
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';

    // mark node container as selected
    const nodeContainer = this.nodeContainers?.find(
      (nodeContainer) => nodeContainer.nativeElement.dataset.path === nodePath
    )?.nativeElement;
    if (nodeContainer) nodeContainer.classList.add('selected');
  }

  onNodeDragEnd(event: DragEvent): void {
    // reset drag state
    this.resetDrag();
  }

  onNodeDragOver(event: DragEvent, nodePath: string, node: any): void {
    // prevent default to allow drop event
    if (this.checkNodeCanMoveToPath(this.dragNodePath, nodePath, node)) {
      event.preventDefault();
    }
  }

  onNodeDragEnter(event: DragEvent, nodePath: string, node: any): void {
    event.preventDefault();
    // add dropzone class to indicate that the node can be dropped there
    if (this.checkNodeCanMoveToPath(this.dragNodePath, nodePath, node)) {
      const dropZone = event.target as HTMLElement;
      dropZone.classList.add('dropzone');

      if (node) {
        // reset all placeholders
        this.resetPlaceholders();

        // if the node exist, it means it's not a structure field
        // so we show a placeholder to indicate where the node will be added
        const placeholder = this.placeholders?.find(
          (placeholder) => placeholder.nativeElement.dataset.path === nodePath
        )?.nativeElement;
        placeholder.classList.add('show');
      }
    }
  }

  onNodeDragLeave(event: DragEvent): void {
    event.preventDefault();
    // remove dropzone class when the node leaves the drop zone
    const dropZone = event.target as HTMLElement;
    dropZone.classList.remove('dropzone');

    // if drag leaves a placeholder container, hide placeholder
    if (dropZone.classList.contains('node-placeholder-container')) {
      if (!dropZone.contains(event.relatedTarget as any)) {
        this.resetPlaceholders();
      }
    }
  }

  onNodeDrop(event: DragEvent, nodePath: string, node: any, dropOnParent: boolean = true): void {
    event.preventDefault();
    if (this.dragNodePath && this.checkNodeCanMoveToPath(this.dragNodePath, nodePath, node)) {
      // remove dropzone class when the node leaves the drop zone
      const dropZone = event.target as HTMLElement;
      dropZone.classList.remove('dropzone');

      // mark the dragged node for removal
      // add a copy of the dragged node to the new path
      // and remove all marked nodes
      // (this avoid the issue of path changing when adding/removing nodes)
      this.markNodeForRemoval(this.dragNodePath);
      this.addNodeByPath(nodePath, this.dragNode, dropOnParent);
      this.removeMarkedNodes();
    }

    // reset drag state
    this.resetDrag();
  }

  // add a node to the gModel at the given path
  // if path is an empty field, the node will be added in that field
  // if path is a node that can have children, the node will be added as a child
  addNodeByPath(path: string, node: any, dropOnParent: boolean = true): void {
    const toNode = this.getNodeByPath(path);
    const parent = this.getNodeParentByPath(path);
    if (!toNode) {
      const field = this.getNodeIndexOrFieldByPath(path);
      parent[field] = node;
    } else {
      if (dropOnParent || !this.checkNodeCanHaveChildren(toNode)) {
        if (!parent.children) parent.children = [];
        // add the node as children of parent at the position of the path
        parent.children.splice(Number(this.getNodeIndexOrFieldByPath(path)), 0, node);
      } else {
        if (!toNode.children) toNode.children = [];
        toNode.children.push(node);
      }
    }
  }

  // remove a node from the gModel at the given path
  // if path is an index, the node will be removed from the children array of the parent node
  // if path is a field, the field will be set to null
  removeNodeByPath(path: string): void {
    const parent = this.getNodeParentByPath(path);
    const indexOrField = this.getNodeIndexOrFieldByPath(path);
    if (parent) {
      console.log('removeNodeByPath', parent, indexOrField);
      if (!isNaN(indexOrField as any)) {
        parent.children.splice(Number(indexOrField), 1);
      } else {
        parent[indexOrField] = null;
      }
    }
  }

  // mark a node that must be removed later
  markNodeForRemoval(path: string): void {
    const node = this.getNodeByPath(path);
    if (node) node._remove = true;
  }

  // remove all nodes that are marked for removal
  removeMarkedNodes(node?: any): void {
    if (!node) node = this._gModel;
    if (this.checkNodeIsStructure(node)) {
      const fields = this.config?.structures?.[node.type]?.fields;
      if (fields?.length) {
        for (const field of fields) {
          if (node[field]?._remove) node[field] = null;
          else if (node[field]) this.removeMarkedNodes(node[field]);
        }
      }
    } else {
      if (node.children) {
        node.children = node.children.filter((child: any) => {
          if (child._remove) return false;
          this.removeMarkedNodes(child);
          return true;
        });
      }
    }
  }

  // reset the drag state
  // remove the selected class from the node container, hide all placeholders and reset the dragged node and its path
  resetDrag(): void {
    // remove selected class from node container
    const nodeContainer = this.nodeContainers?.find(
      (nodeContainer) => nodeContainer.nativeElement.dataset.path === this.dragNodePath
    )?.nativeElement;
    if (nodeContainer) nodeContainer.classList.remove('selected');

    // reset all placeholders
    this.resetPlaceholders();

    // reset dragged node and its path
    this.dragNode = undefined;
    this.dragNodePath = undefined;
  }

  resetPlaceholders(): void {
    this.placeholders?.forEach((placeholder) => {
      placeholder.nativeElement.classList.remove('show');
    });
  }

  // check if a node can be moved to the given path
  // if the toPath is not the same as the fromPath, and the toPath is not a child of the fromPath, and the toNode can have children
  checkNodeCanMoveToPath(fromPath: string | undefined, toPath: string, toNode: any): boolean {
    // obtain the parent node of the toPath to check if it can have children
    const toParent = this.getNodeParentByPath(toPath);
    return (
      fromPath != undefined &&
      toPath != undefined &&
      fromPath !== toPath &&
      !toPath.startsWith(fromPath) &&
      toParent != undefined &&
      (!toNode || this.checkNodeCanHaveChildren(toParent) || this.checkNodeCanHaveChildren(toNode))
    );
  }

  // check if a node can have children
  // if it's not explicitly set to false in the config, and it's not a structure node
  checkNodeCanHaveChildren(node: any): boolean {
    return node && this.config?.nodes?.[node.type]?.children !== false && !this.checkNodeIsStructure(node);
  }

  // check if a node is a structure node by checking if it's defined in the structures config
  checkNodeIsStructure(node: any): boolean {
    return this.config?.structures?.[node?.type] !== undefined;
  }

  // returns the node at the given path
  // for example: getNodeByPath('0/1/2') will return the third child of the second child of the first child of the root node
  // for example: getNodeByPath('0/1/then) will return the 'then' field of the second child of the first child of the root node
  getNodeByPath(path: string): any {
    const pathArray: string[] = path.split('/').splice(1);
    let currentNode = this._gModel;
    if (!currentNode) return;
    for (const indexOrField of pathArray) {
      if (!isNaN(indexOrField as any)) {
        currentNode = currentNode?.children?.[Number(indexOrField)];
      } else {
        currentNode = (currentNode as any)?.[indexOrField];
      }
    }
    return currentNode;
  }

  // returns the parent node of the node at the given path
  getNodeParentByPath(path: string): any {
    const parentPath = path.slice(0, path.lastIndexOf('/'));
    return path ? this.getNodeByPath(parentPath) : undefined;
  }

  // returns the index or field of the node at the given path
  getNodeIndexOrFieldByPath(path: string): number | string {
    return path.slice(path.lastIndexOf('/') + 1);
  }
}
