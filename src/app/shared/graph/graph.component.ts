import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { Instance, LenghtPercentage, Model } from '../models/graph.model';
import { v4 as uuid } from 'uuid';
import { CellComponent } from './cell/cell.component';

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {
  @Input() model: Model = {};
  @Input() instance: Instance[] = [];

  @ViewChildren(CellComponent) cells?: QueryList<CellComponent>;

  updateModel() {
    // this.resetModel();
    this.cells?.forEach((cell) => {
      cell.updateRenderTransforms();
    });
  }

  // private resetModel() {
  //   this.cells?.forEach((cell) => {
  //     cell.resetRenderTransforms();
  //   });
  // }

  // @Output() nodeSelected = new EventEmitter<any>();

  // @ViewChildren("svgs") svgs?: QueryList<ElementRef>;

  // onSelectNode() {
  //   this.nodeSelected.emit();
  // }

  // getBBox(id: string): any {
  //   let svg = this.svgs?.find(item => item.nativeElement.id == id);
  //   console.log(id, svg?.nativeElement.getBBox());
  //   return svg?.nativeElement.getBBox();
  // }

  // getRelativePosition(uuid: string, previous: string, container: string, element: any): any {
  //   if (uuid && previous && element.x && element.y && element.width && element.height) {
  //     var previousBBox = this.getBBox(uuid + previous);
  //     var containerBBox = this.getBBox(uuid + container);
  //     if (previousBBox && containerBBox) {
  //       if (containerBBox.width - element.width - previousBBox.x > 0) {
  //         console.log(container, previous, element.selector, { x: element.x + previousBBox?.x + previousBBox?.width, y: element.y });
  //         return { x: element.x + previousBBox?.x + previousBBox?.width, y: element.y }
  //       } else {
  //         console.log(container, previous, element.selector, { x: element.x, y: element.y + previousBBox?.y + previousBBox?.height });
  //         return { x: element.x, y: element.y + previousBBox?.y + previousBBox?.height }
  //       }
  //     }
  //   }
  //   console.log(container, previous, element.selector, { x: element.x, y: element.y });
  //   return { x: element.x, y: element.y };
  // }
}
