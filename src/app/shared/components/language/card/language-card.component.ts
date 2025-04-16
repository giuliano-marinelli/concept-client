import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MetaModel } from '../../../entities/meta-model.entity';
import { NgxMasonryComponent } from 'ngx-masonry';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'language-card',
  templateUrl: './language-card.component.html',
  styleUrl: './language-card.component.scss'
})
export class LanguageCardComponent {
  @Input() language!: MetaModel;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;

  @Output() onDelete: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    public auth: AuthService,
    public messages: MessagesService
  ) {}
}
