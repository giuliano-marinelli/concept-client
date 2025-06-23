import { Component, HostListener, OnDestroy, OnInit, ViewChild, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { ModelEditorComponent } from '../../shared/components/model/editor/model-editor.component';

import { AuthService } from '../../services/auth.service';
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
  tag!: string;
  version!: string;
  language?: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public titleService: TitleService,
    public model: ModelService
  ) {
    effect(() => {
      const model = this.model.value();
      if (model) {
        if (model.tag) this.titleService.setParam('modeltag', model.tag);
        if (model.version) this.titleService.setParam('modelversion', model.version);
        if (model.name) this.titleService.setParam('modelname', model.name);
        if (model.owner?.username) this.titleService.setParam('username', model.owner.username);
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
      const fullTag = params['model']; // tag with version or 'new' for new model

      // if there's no model param it means it's 'new model'
      if (!fullTag) {
        // set the title parameter for username
        setTimeout(() => {
          this.titleService.setParam('username', params['username']);
        }, 0);

        // set the model editor language if it's provided in the url
        if (params['language']) this.language = params['language'];

        return;
      }

      if (fullTag?.split('@').length === 2) {
        this.tag = fullTag.split('@')[0];
        this.version = fullTag.split('@')[1];
      }

      if (!this.tag || !this.version) this.router.navigate(['/']);
      try {
        await this.model.fetchModel(this.tag, this.version);
      } catch (error) {
        this.router.navigate(['not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this.model.reset();
  }
}
