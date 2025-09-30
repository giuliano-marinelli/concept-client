import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FindModels, Model } from '../shared/entities/model.entity';
import { Global } from '../shared/global/global';
import _ from 'lodash';
import { Observable } from 'rxjs';

import { NewModelComponent } from './new-model/new-model.component';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'models',
  templateUrl: './models.component.html',
  styleUrl: './models.component.scss'
})
export class ModelsComponent {
  filter: any = Global.filter;

  modelsLoading: boolean = true;
  submitLoading: string[] = [];

  models: Model[] = [];
  modelsPage: number = 1;
  modelsPageSize: number = 12;
  modelsCount: number = 0;
  modelsSearch: any;

  constructor(
    public auth: AuthService,
    public router: Router,
    public modalService: NgbModal,
    public messages: MessagesService,
    public profile: ProfileService,
    public _findModels: FindModels
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return false;
  }

  getModels(): void {
    this.modelsLoading = true;

    this._findModels()
      .fetch({
        ...this.modelsSearch,
        pagination: {
          page: this.modelsPage,
          count: this.modelsPageSize
        }
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          if (data?.models) {
            const models = data?.models;
            this.models = models?.set;
            this.modelsCount = models?.count;
          }
        }
      })
      .add(() => {
        this.modelsLoading = false;
      });
  }

  newModel(): void {
    this.modalService.open(NewModelComponent, {
      backdrop: 'static',
      keyboard: false
    });
  }
}
