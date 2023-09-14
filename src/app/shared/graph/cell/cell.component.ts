import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CellTransform, Markup, Token, Value, defaultCellTransform, defaultMarkup } from '../../models/graph.model';
import { RenderComponent } from './render/render.component';

@Component({
  selector: '.cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements AfterViewInit {

  @Input() markup: Markup = defaultMarkup;
  @Input() tokens: Token = {};
  @Input() values: Value = {};
  @Input() transform: CellTransform = defaultCellTransform;

  @ViewChild(RenderComponent) render?: RenderComponent;

  ngAfterViewInit() {
    this.updateRenderTransforms();
  }

  updateRenderTransforms() {
    setTimeout(() => this.render?.updateTransforms(), 0);
  }

}
