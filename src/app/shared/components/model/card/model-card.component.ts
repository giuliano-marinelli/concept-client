import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Model } from '../../../entities/model.entity';
import { NgxMasonryComponent } from 'ngx-masonry';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'model-card',
  templateUrl: './model-card.component.html',
  styleUrl: './model-card.component.scss'
})
export class ModelCardComponent {
  @Input() model!: Model;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;

  @Output() onDelete: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    public auth: AuthService,
    public messages: MessagesService
  ) {}
}
