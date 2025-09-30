import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MetaElement } from '../../../entities/meta-element.entity';
import { DeleteMetaElement, MetaModel } from '../../../entities/meta-model.entity';
import { Global } from '../../../global/global';
import { NgxMasonryComponent } from 'ngx-masonry';

import { LanguageElementEditorComponent } from '../editor/language-element-editor.component';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'language-element-card',
  templateUrl: './language-element-card.component.html',
  styleUrl: './language-element-card.component.scss'
})
export class LanguageElementCardComponent {
  @Input() language!: MetaModel;
  @Input() element!: MetaElement;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;

  @Output() onEdit: EventEmitter<MetaElement> = new EventEmitter<MetaElement>();
  @Output() onDelete: EventEmitter<string> = new EventEmitter<string>();

  lastEdit?: MetaElement;

  sanitizeSVG: any = Global.sanitizeSVG;

  constructor(
    public auth: AuthService,
    public sanitizer: DomSanitizer,
    public messages: MessagesService,
    public modalService: NgbModal,
    private _deleteMetaElement: DeleteMetaElement
  ) {}

  deleteElement(element: MetaElement): void {
    if (!element) return;
    this.loading = true;
    this._deleteMetaElement
      .mutate({ id: element.id })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          }
          if (data?.deleteMetaElement) {
            this.messages.success('Element successfully deleted.', {
              onlyOne: true,
              displayMode: 'replace'
            });
            this.onDelete.emit(data?.deleteMetaElement);
          }
        }
      })
      .add(() => {
        this.loading = false;
      });
  }

  editElement(element: MetaElement): void {
    const modalRef = this.modalService.open(LanguageElementEditorComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    const editor = modalRef.componentInstance;

    editor.language = this.language;
    editor.element = element;
    editor.type = element.type;

    editor.onUpdate.subscribe((element: MetaElement) => {
      this.lastEdit = element;
    });

    modalRef.dismissed.subscribe(() => {
      if (this.lastEdit) this.onEdit.emit(this.lastEdit);
    });
  }
}
