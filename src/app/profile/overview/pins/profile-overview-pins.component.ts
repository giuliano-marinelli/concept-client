import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FindMetaModels, MetaModel } from '../../../shared/entities/meta-model.entity';
import { FindModels, Model } from '../../../shared/entities/model.entity';
import { UpdateUser, UpdateUserPinnedResources } from '../../../shared/entities/user.entity';

import { AuthService } from '../../../services/auth.service';
import { MessagesService } from '../../../services/messages.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'profile-overview-pins',
  templateUrl: './profile-overview-pins.component.html',
  styleUrl: './profile-overview-pins.component.scss'
})
export class ProfileOverviewPinsComponent implements OnInit {
  resourcesLoading: boolean = true;
  submitLoading: boolean = false;

  resourcesSearch: any;
  _languages: MetaModel[] = [];
  _models: Model[] = [];

  pinsLimit: number = 6; // maximum number of pinned resources

  pinsForm!: FormGroup;
  pinnedMetaModels: FormControl = new FormControl(this.profile.user()?.pinnedMetaModels);
  pinnedModels: FormControl = new FormControl(this.profile.user()?.pinnedModels);

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    public router: Router,
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    public profile: ProfileService,
    public _findMetaModels: FindMetaModels,
    public _findModels: FindModels,
    public _updateUserPinnedResources: UpdateUserPinnedResources
  ) {}

  get pinnedResources(): (MetaModel | Model)[] {
    return [
      ...this.pinnedMetaModels.value.map((pinnedMetaModel: MetaModel) => ({
        ...pinnedMetaModel,
        type: 'lang'
      })),
      ...this.pinnedModels.value.map((pinnedModel: Model) => ({
        ...pinnedModel,
        type: 'model'
      }))
    ].sort((a, b) => a.name!.localeCompare(b.name!));
  }

  get unpinnedResources(): (MetaModel | Model)[] {
    return [
      ...this._languages.map((language) => ({ ...language, type: 'lang' })),
      ...this._models.map((model) => ({ ...model, type: 'model' }))
    ]
      .filter((resource) => !this.pinnedResources.some((pinnedResource) => pinnedResource.id === resource.id))
      .sort((a, b) => a.name!.localeCompare(b.name!));
  }

  ngOnInit(): void {
    this.pinsForm = this.formBuilder.group({
      pinnedMetaModels: this.pinnedMetaModels,
      pinnedModels: this.pinnedModels
    });
  }

  /**
   * Check if the resource is in the pinnedResources list.
   */
  isToggledPin(resource: MetaModel | Model): boolean {
    return this.pinnedResources.some((pinnedResource) => pinnedResource.id === resource.id);
  }

  /**
   * Put or remove the resource from the pinnedResources lists (pinnedMetaModels or pinnedModels).
   *
   *  Using the original ones that are on _languages and _models.
   */
  togglePin(resource: MetaModel | Model): void {
    if (this.isToggledPin(resource)) {
      if ((resource as any).type === 'lang') {
        // remove from pinnedMetaModels
        this.pinnedMetaModels.setValue(
          this.pinnedMetaModels.value.filter((pinnedMetaModel: MetaModel) => pinnedMetaModel.id !== resource.id)
        );
      } else if ((resource as any).type === 'model') {
        // remove from pinnedModels
        this.pinnedModels.setValue(
          this.pinnedModels.value.filter((pinnedModel: Model) => pinnedModel.id !== resource.id)
        );
      }
    } else if (this.pinnedResources.length < this.pinsLimit) {
      if ((resource as any).type === 'lang') {
        // find the original language in _languages and add it to pinnedMetaModels
        const originalLanguage = this._languages.find((lang) => lang.id === resource.id);
        if (originalLanguage) {
          this.pinnedMetaModels.setValue([...this.pinnedMetaModels.value, originalLanguage]);
        }
      } else if ((resource as any).type === 'model') {
        // find the original model in _models and add it to pinnedModels
        const originalModel = this._models.find((model) => model.id === resource.id);
        if (originalModel) {
          this.pinnedModels.setValue([...this.pinnedModels.value, originalModel]);
        }
      }
    }
  }

  getResources(): void {
    this.resourcesLoading = true;

    let languagesLoading = true;
    let modelsLoading = true;

    this._findMetaModels()
      .fetch({
        ...this.resourcesSearch
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          if (data?.metaModels) this._languages = data?.metaModels.set;
        }
      })
      .add(() => {
        languagesLoading = false;
        if (!modelsLoading) this.resourcesLoading = false;
      });

    this._findModels()
      .fetch({
        ...this.resourcesSearch
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          if (data?.models) this._models = data?.models.set;
        }
      })
      .add(() => {
        modelsLoading = false;
        if (!languagesLoading) this.resourcesLoading = false;
      });
  }

  updatePinnedResources(): void {
    if (this.auth.user) {
      this.pinsForm.markAllAsTouched();
      if (this.pinsForm.valid) {
        this.submitLoading = true;
        this._updateUserPinnedResources
          .mutate({
            id: this.auth.user.id,
            pinnedMetaModels: this.pinnedMetaModels.value.map((pinnedMetaModel: MetaModel) => ({
              id: pinnedMetaModel.id
            })),
            pinnedModels: this.pinnedModels.value.map((pinnedModel: Model) => ({
              id: pinnedModel.id
            }))
          })
          .subscribe({
            next: ({ data, errors }) => {
              if (errors)
                this.messages.error(errors, {
                  onlyOne: true,
                  displayMode: 'replace'
                });
              if (data?.updateUserPinnedResources) {
                this.pinsForm.markAsPristine();
                this.profile.refetchUser();
                this.activeModal.close();
                this.messages.success('Pins successfully updated.', {
                  onlyOne: true,
                  displayMode: 'replace'
                });
              }
            }
          })
          .add(() => {
            this.submitLoading = false;
          });
      } else {
        this.messages.error('Some values are invalid, please check.', {
          onlyOne: true,
          displayMode: 'replace'
        });
      }
    }
  }
}
