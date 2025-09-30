import { Component, HostListener, OnDestroy, OnInit, ViewChild, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { ModelEditorComponent } from '../../shared/components/model/editor/model-editor.component';

import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { ModelService } from '../../services/model.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'model',
  templateUrl: './model.component.html',
  styleUrl: './model.component.scss'
})
export class ModelComponent implements OnInit, OnDestroy {
  @ViewChild(ModelEditorComponent) modelEditor!: ModelEditorComponent;

  //router params
  langTag!: string;
  langVersion!: string;
  modelTag!: string;
  modelVersion!: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public titleService: TitleService,
    public model: ModelService,
    public language: LanguageService
  ) {
    effect(() => {
      const model = this.model.value();
      if (model) {
        if (model.tag) this.titleService.setParam('modeltag', model.tag);
        if (model.version) this.titleService.setParam('modelversion', model.version);
        if (model.name) this.titleService.setParam('modelname', model.name);
        if (model.owner?.username) this.titleService.setParam('username', model.owner.username);
      }

      const language = this.language.value();
      if (language) {
        if (language.tag) this.titleService.setParam('languagetag', language.tag);
        if (language.version) this.titleService.setParam('languageversion', language.version);
        if (language.name) this.titleService.setParam('languagename', language.name);
        // only set language owner if there's no model (it means we're creating a new model), otherwise the model owner is already set
        if (!model && language.owner?.username) this.titleService.setParam('username', language.owner.username);
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.modelEditor?.dirty;
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      const modelParam = params['model']; // tag@version of the model (if provided)
      const langParam = params['language']; // tag@version of the language (if provided)

      // if there's model param, it's a model edition, otherwise it's a new model
      if (modelParam) {
        if (modelParam?.split('@').length === 2) {
          this.modelTag = modelParam.split('@')[0];
          this.modelVersion = modelParam.split('@')[1];
        }

        if (!this.modelTag || !this.modelVersion) this.router.navigate(['not-found']);
        try {
          await this.model.fetchModel(this.modelTag, this.modelVersion);
        } catch (error) {
          this.router.navigate(['not-found']);
        }

        // if the model has a language defined (it must have), fetch it too
        if (this.model.value()?.metaModel?.id) {
          try {
            await this.language.fetchLanguageById(this.model.value()!.metaModel!.id!);
          } catch (error) {
            this.router.navigate(['not-found']);
          }
        }
      } else if (langParam) {
        if (langParam?.split('@').length === 2) {
          this.langTag = langParam.split('@')[0];
          this.langVersion = langParam.split('@')[1];
        }

        if (!this.langTag || !this.langVersion) this.router.navigate(['not-found']);
        try {
          await this.language.fetchLanguage(this.langTag, this.langVersion);
        } catch (error) {
          this.router.navigate(['not-found']);
        }
      } else {
        this.router.navigate(['not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this.model.reset();
    this.language.reset();
    this.titleService.resetParams();
  }
}
