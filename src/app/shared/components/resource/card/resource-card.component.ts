import { Component, Input, OnInit } from '@angular/core';

import { MetaModel } from '../../../entities/meta-model.entity';
import { Model } from '../../../entities/model.entity';
import { NgxMasonryComponent } from 'ngx-masonry';

@Component({
  selector: 'resource-card',
  templateUrl: './resource-card.component.html',
  styleUrl: './resource-card.component.scss'
})
export class ResourceCardComponent {
  @Input() resource!: (MetaModel | Model) & { type: string };
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;
}
