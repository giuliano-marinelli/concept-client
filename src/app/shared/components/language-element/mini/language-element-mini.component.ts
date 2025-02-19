import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { MetaElement } from '../../../entities/meta-element.entity';
import { Global } from '../../../global/global';

@Component({
  selector: 'language-element-mini',
  templateUrl: './language-element-mini.component.html',
  styleUrl: './language-element-mini.component.scss'
})
export class LanguageElementMiniComponent {
  @Input() element!: MetaElement;

  sanitizeSVG: any = Global.sanitizeSVG;

  constructor(public sanitizer: DomSanitizer) {}
}
