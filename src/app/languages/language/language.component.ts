import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LanguageElementType } from '@dynamic-glsp/protocol';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Global } from '../../shared/global/global';

import { LanguageEditorComponent } from '../../shared/components/language/editor/language-editor.component';

import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'language',
  templateUrl: './language.component.html',
  styleUrl: './language.component.scss'
})
export class LanguageComponent implements OnInit, OnDestroy {
  //router params
  tag!: string;
  version!: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public titleService: TitleService,
    public modalService: NgbModal,
    public language: LanguageService
  ) {
    effect(() => {
      const language = this.language.value();
      if (language) {
        if (language.tag) this.titleService.setParam('languagetag', language.tag);
        if (language.version) this.titleService.setParam('languageversion', language.version);
        if (language.name) this.titleService.setParam('languagename', language.name);
        if (language.owner?.username) this.titleService.setParam('username', language.owner.username);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      const fullTag = params['language']; // tag@version
      if (fullTag?.split('@').length === 2) {
        this.tag = fullTag.split('@')[0];
        this.version = fullTag.split('@')[1];
      }

      if (!this.tag || !this.version) this.router.navigate(['not-found']);
      try {
        await this.language.fetchLanguage(this.tag, this.version);
      } catch (error) {
        this.router.navigate(['not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this.language.reset();
    this.titleService.resetParams();
  }

  editLanguage(): void {
    this.modalService.open(LanguageEditorComponent, {
      backdrop: 'static',
      keyboard: false
    });
  }
}
