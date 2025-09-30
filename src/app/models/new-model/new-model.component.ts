import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FindMetaModels, MetaModel } from '../../shared/entities/meta-model.entity';
import { Search } from '../../shared/global/search';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'new-model',
  templateUrl: './new-model.component.html',
  styleUrl: './new-model.component.scss'
})
export class NewModelComponent implements OnInit {
  selectedLanguage?: MetaModel;

  languagesLoading: boolean = true;

  languages: MetaModel[] = [];
  languagesPage: number = 1;
  languagesPageSize: number = 12;
  languagesCount: number = 0;
  languagesSearch: any;
  languagesSearchString: string = '';

  constructor(
    public auth: AuthService,
    public router: Router,
    public activeModal: NgbActiveModal,
    public messages: MessagesService,
    public _findMetaModels: FindMetaModels
  ) {}

  ngOnInit(): void {}

  getLanguages(): void {
    this.languagesLoading = true;

    // deselect language
    this.selectedLanguage = undefined;

    this._findMetaModels()
      .fetch({
        // if there is no search string, look up only the auth user's languages
        ...this.languagesSearch,
        ...(!this.languagesSearchString
          ? Search.applyFixedAttributes(this.languagesSearch, [
              {
                name: 'owner.username',
                criteria: 'eq',
                value: this.auth.user?.username,
                enabled: this.auth.user !== null
              }
            ])
          : this.languagesSearch),
        pagination: {
          page: this.languagesPage,
          count: this.languagesPageSize
        }
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          if (data?.metaModels) {
            const metaModels = data?.metaModels;
            this.languages = metaModels?.set;
            this.languagesCount = metaModels?.count;
          }
        }
      })
      .add(() => {
        this.languagesLoading = false;
      });
  }

  openModelEditor() {
    if (this.selectedLanguage) {
      this.activeModal.close();
      this.router.navigateByUrl(
        `/${this.selectedLanguage?.owner?.username}/lang/${this.selectedLanguage?.tag}@${this.selectedLanguage?.version}/new`
      );
    }
  }
}
