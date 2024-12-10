import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { MetaElement } from '../../shared/entities/meta-element.entity';
import { FindMetaModels, MetaModel } from '../../shared/entities/meta-model.entity';
import { Global } from '../../shared/global/global';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {
  JSON: any = JSON;
  filter: any = Global.filter;

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
    public changeDetector: ChangeDetectorRef,
    private _findMetaModels: FindMetaModels
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

  deleteElement(element: MetaElement): void {
    //TODO
  }
}
