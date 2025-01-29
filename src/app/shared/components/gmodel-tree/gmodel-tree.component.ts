import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';

import { GModelElementSchema } from '@eclipse-glsp/protocol';

import { GModelConfig } from '../../global/global';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { JsonModel } from '../../global/json-model';

@Component({
  selector: 'gmodel-tree',
  templateUrl: './gmodel-tree.component.html',
  styleUrl: './gmodel-tree.component.scss'
})
export class GModelTreeComponent implements OnInit {
  @ViewChildren('placeholder') placeholders?: QueryList<ElementRef>;
  @ViewChildren('nodeContainer') nodeContainers?: QueryList<ElementRef>;

  @Input() gModel!: JsonModel<GModelElementSchema, GModelConfig>;

  model?: GModelElementSchema;
  modelSubscription?: Subscription;

  config?: GModelConfig;
  configSubscription?: Subscription;

  dragNode?: any;
  dragNodePath?: string;

  ngOnInit(): void {
    // subscribe to the gModel changes
    this.modelSubscription = this.gModel
      .getModel()
      .subscribe((newGModel: GModelElementSchema) => (this.model = newGModel));

    // subscribe to the gModel config changes
    this.configSubscription = this.gModel
      .getConfig()
      .subscribe((newGModelConfig: GModelConfig) => (this.config = newGModelConfig));
  }

  onNodeClick(path: string, node: any): void {
    if (node && !this.dragNodePath) this.gModel.selectNode(path);
  }

  onNodeDragStart(event: DragEvent, nodePath: string): void {
    // save a copy of the node being dragged and its path
    this.dragNode = _.cloneDeep(this.gModel.getNode(nodePath));
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
    if (this.gModel.checkNodeCanMoveToPath(this.dragNodePath, nodePath, node)) {
      event.preventDefault();
    }
  }

  onNodeDragEnter(event: DragEvent, nodePath: string, node: any): void {
    event.preventDefault();
    // add dropzone class to indicate that the node can be dropped there
    if (this.gModel.checkNodeCanMoveToPath(this.dragNodePath, nodePath, node)) {
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
    if (this.dragNodePath && this.gModel.checkNodeCanMoveToPath(this.dragNodePath, nodePath, node)) {
      // remove dropzone class when the node leaves the drop zone
      const dropZone = event.target as HTMLElement;
      dropZone.classList.remove('dropzone');

      // move the dragged node to the new path
      this.gModel.moveNode(this.dragNodePath, nodePath, dropOnParent);
    }

    // reset drag state
    this.resetDrag();
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
