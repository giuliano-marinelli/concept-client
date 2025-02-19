import { Component, Input } from '@angular/core';

import { MetaModel } from '../../../entities/meta-model.entity';

@Component({
  selector: 'language-mini',
  templateUrl: './language-mini.component.html',
  styleUrl: './language-mini.component.scss'
})
export class LanguageMiniComponent {
  @Input() language!: MetaModel;
}
