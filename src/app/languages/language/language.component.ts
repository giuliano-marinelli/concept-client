import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { LanguageElementType } from '@dynamic-glsp/protocol';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MetaElement } from '../../shared/entities/meta-element.entity';
import { DeleteMetaElement, FindMetaModels, MetaModel } from '../../shared/entities/meta-model.entity';
import { Global } from '../../shared/global/global';

import { LanguageEditorComponent } from '../../shared/components/language-editor/language-editor.component';
import { LanguageElementEditorComponent } from '../../shared/components/language-element-editor/language-element-editor.component';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-language',
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
    public titleService: Title,
    public modalService: NgbModal,
    public changeDetector: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    public messages: MessagesService,
    private _findMetaModels: FindMetaModels,
    private _deleteMetaElement: DeleteMetaElement
  ) {
    this.route.params.subscribe((params) => {
      const fullTag = params['language']; // tag with version
      if (fullTag?.split('@').length === 2) {
        this.tag = fullTag.split('@')[0];
        this.version = fullTag.split('@')[1];
      }
    });
  }

  ngOnInit(): void {
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
              this.titleService.setTitle(this.language.tag + '@' + this.language.version + ' · ' + this.language.name);
              // if (this.language && this.language.metaElements) this.editElement(this.language.metaElements[2]);
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

  deleteLanguage(): void {}

  editLanguage(): void {
    const modalRef = this.modalService.open(LanguageEditorComponent, {
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.language = this.language;

    modalRef.dismissed.subscribe((reason: string) => {
      if (reason == 'Success') this.getLanguage();
    });
  }

  deleteElement(element: MetaElement): void {
    if (!element) return;
    this.submitLoading.push(element.id!);
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
            this.getLanguage();
            this.messages.success('Element successfully deleted.', {
              onlyOne: true,
              displayMode: 'replace'
            });
          }
        }
      })
      .add(() => {
        this.submitLoading = this.submitLoading.filter((id) => id !== element.id);
      });
  }

  editElement(options: { element?: MetaElement; type?: LanguageElementType }): void {
    const modalRef = this.modalService.open(LanguageElementEditorComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.language = this.language;
    if (options.element) {
      modalRef.componentInstance.element = options.element;
      modalRef.componentInstance.type = options.element.type;
    }
    if (options.type) modalRef.componentInstance.type = options.type;

    modalRef.dismissed.subscribe(() => {
      this.getLanguage();
    });
  }

  adjustSVG(svg: string, width?: number): any {
    return this.sanitizer.bypassSecurityTrustHtml(width ? Global.adjustSVGWidth(svg, width) : svg);
  }
}
