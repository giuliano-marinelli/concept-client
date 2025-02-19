import { Component, Input } from '@angular/core';

import { MetaModel } from '../../../entities/meta-model.entity';
import { NgxMasonryComponent } from 'ngx-masonry';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'language-card',
  templateUrl: './language-card.component.html',
  styleUrl: './language-card.component.scss'
})
export class LanguageCardComponent {
  @Input() language!: MetaModel;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;

  constructor(public auth: AuthService) {}

  deleteLanguage(language: MetaModel): void {
    // TODO
  }
}
