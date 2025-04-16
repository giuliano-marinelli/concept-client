import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FindMetaModels, MetaModel } from '../shared/entities/meta-model.entity';
import { CloseSession } from '../shared/entities/session.entity';
import { Global } from '../shared/global/global';
import _ from 'lodash';
import { Observable } from 'rxjs';

import { LanguageEditorComponent } from '../shared/components/language/editor/language-editor.component';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'languages',
  templateUrl: './languages.component.html',
  styleUrl: './languages.component.scss'
})
export class LanguagesComponent {
  filter: any = Global.filter;

  languagesLoading: boolean = true;
  submitLoading: string[] = [];

  languages: MetaModel[] = [];
  languagesPage: number = 1;
  languagesPageSize: number = 12;
  languagesCount: number = 0;
  languagesSearch: any;

  constructor(
    public auth: AuthService,
    public router: Router,
    public modalService: NgbModal,
    public messages: MessagesService,
    public profile: ProfileService,
    public _findMetaModels: FindMetaModels,
    public _closeSession: CloseSession
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return false;
  }

  getLanguages(): void {
    this.languagesLoading = true;

    this._findMetaModels()
      .fetch({
        ...this.languagesSearch,
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

  newLanguage(): void {
    this.modalService.open(LanguageEditorComponent, {
      backdrop: 'static',
      keyboard: false
    });
  }
}
