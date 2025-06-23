import { Component } from '@angular/core';

import { LanguageElementType } from '@dynamic-glsp/protocol';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Global } from '../../../shared/global/global';

import { LanguageElementEditorComponent } from '../../../shared/components/language-element/editor/language-element-editor.component';

import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'language-design',
  templateUrl: './language-design.component.html',
  styleUrl: './language-design.component.scss'
})
export class LanguageDesignComponent {
  filter: any = Global.filter;
  LanguageElementType = LanguageElementType;

  submitLoading: string[] = [];

  constructor(
    public auth: AuthService,
    public modalService: NgbModal,
    public language: LanguageService
  ) {}

  newElement(type: LanguageElementType): void {
    const modalRef = this.modalService.open(LanguageElementEditorComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    const editor = modalRef.componentInstance;
    editor.language = this.language.value();
    editor.type = type;
    editor.onCreate.subscribe(() => {
      this.language.refetchLanguage();
    });
  }
}
