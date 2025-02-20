import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { LanguageElementType } from '@dynamic-glsp/protocol';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteMetaElement, FindMetaModels, MetaModel } from '../../shared/entities/meta-model.entity';
import { Global } from '../../shared/global/global';

import { LanguageElementEditorComponent } from '../../shared/components/language-element/editor/language-element-editor.component';
import { LanguageEditorComponent } from '../../shared/components/language/editor/language-editor.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'language',
  templateUrl: './language.component.html',
  styleUrl: './language.component.scss'
})
export class LanguageComponent implements OnInit {
  JSON: any = JSON;
  filter: any = Global.filter;
  LanguageElementType = LanguageElementType;

  languageLoading: boolean = true;
  submitLoading: string[] = [];

  language?: MetaModel;

  //router params
  tag!: string;
  version!: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public titleService: TitleService,
    public modalService: NgbModal,
    public changeDetector: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    public messages: MessagesService,
    private _findMetaModels: FindMetaModels
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const fullTag = params['language']; // tag with version
      if (fullTag?.split('@').length === 2) {
        this.tag = fullTag.split('@')[0];
        this.version = fullTag.split('@')[1];
      }
    });

    if (!this.tag || !this.version) this.router.navigate(['/']);
    this.getLanguage();
  }

  getLanguage(): void {
    this.languageLoading = true;
    this._findMetaModels
      .fetch({ where: { tag: { eq: this.tag }, version: { eq: this.version } } })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.router.navigate(['not-found']);
            return;
          }
          if (data?.metaModels?.set) {
            this.language = data.metaModels.set[0] ?? null;
            if (this.language) {
              if (this.language.tag) this.titleService.setParam('languagetag', this.language.tag);
              if (this.language.version) this.titleService.setParam('languageversion', this.language.version);
              if (this.language.name) this.titleService.setParam('languagename', this.language.name);
            } else {
              this.router.navigate(['not-found']);
            }
          }
        }
      })
      .add(() => {
        this.languageLoading = false;
      });
  }

  editLanguage(): void {
    const modalRef = this.modalService.open(LanguageEditorComponent, {
      backdrop: 'static',
      keyboard: false
    });

    const editor = modalRef.componentInstance;

    editor.language = this.language;

    editor.onUpdate.subscribe((language: MetaModel) => {
      if (language.tag != this.language?.tag) {
        this.tag = language.tag!;
        this.version = language.version!;
        this.router.navigate(['/language', language.tag + '@' + language.version]);
      }
      this.getLanguage();
    });
  }

  deleteLanguage(): void {}

  newElement(type: LanguageElementType): void {
    const modalRef = this.modalService.open(LanguageElementEditorComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    const editor = modalRef.componentInstance;

    editor.language = this.language;
    editor.type = type;

    editor.onCreate.subscribe(() => {
      this.getLanguage();
    });
  }
}
