import { Component, OnInit, computed } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MetaModel } from '../../shared/entities/meta-model.entity';
import { Model } from '../../shared/entities/model.entity';

import { ProfileOverviewPinsComponent } from './pins/profile-overview-pins.component';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.scss'
})
export class ProfileOverviewComponent {
  publications: any[] = [];
  publicationsLoading: boolean = false;

  pinnedResources = computed<((MetaModel | Model) & { type: string })[]>(() => {
    if (!this.profile.user()?.pinnedMetaModels || !this.profile.user()?.pinnedModels) return [];
    else
      return [
        ...this.profile.user()!.pinnedMetaModels!.map((pinnedMetaModel: MetaModel) => ({
          ...pinnedMetaModel,
          type: 'lang'
        })),
        ...this.profile.user()!.pinnedModels!.map((pinnedModel: Model) => ({
          ...pinnedModel,
          type: 'model'
        }))
      ].sort((a, b) => a.name!.localeCompare(b.name!));
  });

  constructor(
    public auth: AuthService,
    public profile: ProfileService,
    public modalService: NgbModal
  ) {}

  editPins(): void {
    this.modalService.open(ProfileOverviewPinsComponent, {
      backdrop: 'static',
      keyboard: false
    });
  }
}
