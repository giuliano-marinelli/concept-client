import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CellTransform, Instance, Markup, Token, defaultCellTransform, defaultMarkup } from '../../models/graph.model';
import { RenderComponent } from './render/render.component';

@Component({
  selector: '.cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements AfterViewInit {

  @Input() markup: Markup = defaultMarkup;
  @Input() tokens: Token[] = [];
  @Input() instance!: Instance;
  // @Input() values: Value = {};
  // @Input() transform: CellTransform = defaultCellTransform;

  @Output() selected = new EventEmitter<CellComponent>();

  @ViewChild(RenderComponent) render?: RenderComponent;

  ngAfterViewInit() {
    this.updateRenderTransforms();
  }

  updateRenderTransforms() {
    // console.log("%cUPDATE RENDER", 'color: #00ff00');
    setTimeout(() => this.render?.updateTransforms(), 0);
  }

}
