import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DeleteMetaModel, MetaModel } from '../../../entities/meta-model.entity';
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
    public messages: MessagesService,
    private _deleteMetaModel: DeleteMetaModel
  ) {}

  deleteLanguage({ password, verificationCode }: any, language: MetaModel): void {
    if (!language) return;
    this.loading = true;
    this._deleteMetaModel
      .mutate({ id: language.id, password: password })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          }
          if (data?.deleteMetaModel) {
            this.messages.success('Language successfully deleted.', {
              onlyOne: true,
              displayMode: 'replace'
            });
            this.onDelete.emit(data?.deleteMetaModel);
          }
        }
      })
      .add(() => {
        this.loading = false;
      });
  }
}
