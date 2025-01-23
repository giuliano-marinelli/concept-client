import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';

import { GModelElementSchema } from '@eclipse-glsp/protocol';

import { GModelConfig, GModelContext, Global } from '../../global/global';
import _ from 'lodash';

@Component({
  selector: 'gmodel-tree',
  templateUrl: './gmodel-tree.component.html',
  styleUrl: './gmodel-tree.component.scss'
})
export class GModelTreeComponent implements OnInit {
  @Input() gModel?: GModelElementSchema;
  @Input() gModelConfig: GModelConfig = {};

  @Output() gModelChange = new EventEmitter<GModelElementSchema>();
  @Output() selectedChange = new EventEmitter<string>();

  @ViewChildren('placeholder') placeholders?: QueryList<ElementRef>;
  @ViewChildren('nodeContainer') nodeContainers?: QueryList<ElementRef>;

  gModelUtils = Global.GModelUtils;

  gModelContext!: GModelContext;

  selectedNodePath: string = '';

  dragNode?: any;
  dragNodePath?: string;

  ngOnInit(): void {
    // set default config
    if (!this.gModelConfig.nodeIcon) this.gModelConfig.nodeIcon = 'circle';
    if (!this.gModelConfig.structures) this.gModelConfig.structures = {};

    // set context with a gModel clone and config
    this.gModelContext = { gModel: _.cloneDeep(this.gModel)!, config: this.gModelConfig };

    // set the selected node to the root node
    this.selectNode('', this.gModelContext.gModel);
  }

  onNodeClick(path: string, node: any): void {
    if (node) this.selectNode(path, node);
  }

  onNodeDragStart(event: DragEvent, nodePath: string): void {
    // save a copy of the node being dragged and its path
    this.dragNode = _.cloneDeep(this.gModelUtils.getNodeByPath(this.gModelContext, nodePath));
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
    if (this.gModelUtils.checkNodeCanMoveToPath(this.gModelContext, this.dragNodePath, nodePath, node)) {
      event.preventDefault();
    }
  }

  onNodeDragEnter(event: DragEvent, nodePath: string, node: any): void {
    event.preventDefault();
    // add dropzone class to indicate that the node can be dropped there
    if (this.gModelUtils.checkNodeCanMoveToPath(this.gModelContext, this.dragNodePath, nodePath, node)) {
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
        placeholder?.classList.add('show');
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
    if (
      this.dragNodePath &&
      this.gModelUtils.checkNodeCanMoveToPath(this.gModelContext, this.dragNodePath, nodePath, node)
    ) {
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
      this.updateSelectedNodePath();

      // emit the updated gModel
      this.gModelChange.emit(this.gModelContext.gModel);
    }

    // reset drag state
    this.resetDrag();
  }

  // add a node to the gModel at the given path
  // if path is an empty field, the node will be added in that field
  // if path is a node that can have children, the node will be added as a child
  addNodeByPath(path: string, node: any, dropOnParent: boolean = true): void {
    const toNode = this.gModelUtils.getNodeByPath(this.gModelContext, path);
    const parent = this.gModelUtils.getNodeParentByPath(this.gModelContext, path);
    if (!toNode) {
      const field = this.gModelUtils.getNodeIndexOrFieldByPath(path);
      parent[field] = node;
    } else {
      if (dropOnParent || !this.gModelUtils.checkNodeCanHaveChildren(this.gModelContext, toNode)) {
        if (!parent.children) parent.children = [];
        // add the node as children of parent at the position of the path
        parent.children.splice(Number(this.gModelUtils.getNodeIndexOrFieldByPath(path)), 0, node);
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
    const parent = this.gModelUtils.getNodeParentByPath(this.gModelContext, path);
    const indexOrField = this.gModelUtils.getNodeIndexOrFieldByPath(path);
    if (parent) {
      if (!isNaN(indexOrField as any)) {
        parent.children.splice(Number(indexOrField), 1);
      } else {
        parent[indexOrField] = null;
      }
    }
  }

  // mark a node that must be removed later
  markNodeForRemoval(path: string): void {
    const node = this.gModelUtils.getNodeByPath(this.gModelContext, path);
    if (node) node._remove = true;
  }

  // remove all nodes that are marked for removal
  removeMarkedNodes(): void {
    const removePaths: string[] = this.gModelUtils.getPathsByProperty(this.gModelContext, '_remove');
    removePaths.forEach((path: string) => {
      this.removeNodeByPath(path);
    });
  }

  // update the selected node path for when the gModel is updated
  updateSelectedNodePath(): void {
    const selectedPath: string = this.gModelUtils.getPathsByProperty(this.gModelContext, '_selected')[0];
    if (selectedPath) this.selectNode(selectedPath);
  }

  // sets the selected node path and emits the selected node path
  // if node reference is provided, previous selected node will be unselected and the new node will be selected
  selectNode(path: string, node?: any): void {
    if (node) {
      let selectedNode = this.gModelUtils.getNodeByPath(this.gModelContext, this.selectedNodePath);
      if (selectedNode) delete selectedNode._selected;

      node._selected = true;
    }
    this.selectedNodePath = path;
    this.selectedChange.emit(path);
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
}
