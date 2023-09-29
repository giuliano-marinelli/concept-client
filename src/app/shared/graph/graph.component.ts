import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { Instance, LenghtPercentage, Model } from '../models/graph.model';
import { CellComponent } from './cell/cell.component';

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {

  @Input() model: Model = {};
  @Input() instance: Instance[] = [];
  @Input() width: LenghtPercentage = "100%";
  @Input() height: LenghtPercentage = "100%";

  @Output() cellSelected = new EventEmitter<CellComponent>();

  @ViewChildren(CellComponent) cells?: QueryList<CellComponent>;

  updateModel() {
    this.cells?.forEach((cell) => {
      cell.updateRenderTransforms();
    });
  }

}
