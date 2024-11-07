import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { FindMetaModels, MetaModel } from '../shared/entities/meta-model.entity';
import { CloseSession } from '../shared/entities/session.entity';
import { Global } from '../shared/global/global';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent {
  @ViewChild('message_container') messageContainer!: ElementRef;

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
    public messages: MessagesService,
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

  ngOnInit(): void {
    this.getLanguages();
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
              displayMode: 'replace',
              target: this.messageContainer
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

  deleteLanguage(language: MetaModel): void {
    // if (metaModel._id) this.submitLoading.push(metaModel._id);
    // this.metaModelService.deleteMetaModel(metaModel).subscribe({
    //   next: (data) => {
    //     this.getMetaModels();
    //     this.message.success('MetaModel succesfully deleted.', { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
    //   },
    //   error: (error) => {
    //     this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
    //   }
    // }).add(() => {
    //   this.submitLoading = this.submitLoading.filter(id => id != metaModel._id)
    // });
  }
}
