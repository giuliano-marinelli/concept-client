import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CheckMetaModelTagExists,
  DeleteMetaModel,
  FindMetaModel,
  MetaModel,
  UpdateMetaModel
} from '../../../../shared/entities/meta-model.entity';
import { Global } from '../../../../shared/global/global';
import { ExtraValidators } from '../../../../shared/validators/validators';
import { Observable, lastValueFrom } from 'rxjs';

import { AuthService } from '../../../../services/auth.service';
import { LanguageService } from '../../../../services/language.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'language-settings-general',
  templateUrl: './language-settings-general.component.html',
  styleUrl: './language-settings-general.component.scss'
})
export class LanguageSettingsGeneralComponent {
  @ViewChild('message_container_update') messageContainerUpdate!: ElementRef;
  @ViewChild('message_container_delete') messageContainerDelete!: ElementRef;

  tagSubmitLoading: boolean = false;
  deleteSubmitLoading: boolean = false;

  setValid: any = Global.setValid;

  tagForm!: FormGroup;
  tag = new FormControl(
    this.language.value()!.tag,
    [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern('[a-z0-9_-]*')],
    [ExtraValidators.metaModelTagExists(this._checkMetaModelTagExists, this.language.value()!.id)]
  );

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public formBuilder: FormBuilder,
    public language: LanguageService,
    private _checkMetaModelTagExists: CheckMetaModelTagExists,
    private _updateMetaModel: UpdateMetaModel,
    private _deleteMetaModel: DeleteMetaModel
  ) {}

  ngOnInit(): void {
    this.tagForm = this.formBuilder.group({
      id: this.language.value()!.id,
      tag: this.tag
    });
  }

  async updateTag(): Promise<void> {
    this.tagForm.markAllAsTouched();

    if (this.tagForm.valid) {
      this.tagSubmitLoading = true;

      const result = await lastValueFrom(this._updateMetaModel.mutate({ metaModelUpdateInput: this.tagForm.value }));

      if (result.errors)
        this.messages.error(result.errors, {
          close: false,
          onlyOne: true,
          displayMode: 'replace',
          target: this.messageContainerUpdate
        });

      if (result.data?.updateMetaModel) {
        this.tagForm.markAsPristine();
        this.language.value.set(result.data?.updateMetaModel);
        this.router.navigate([
          `/${this.language.value()!.owner?.username}/${this.language.value()!.tag}@${this.language.value()!.version}/settings/general`
        ]);
        this.messages.success('Tag successfully changed.', {
          onlyOne: true,
          displayMode: 'replace'
        });
      }

      this.tagSubmitLoading = false;
    } else {
      this.messages.error('Some values are invalid, please check.', {
        close: false,
        onlyOne: true,
        displayMode: 'replace',
        target: this.messageContainerUpdate
      });
    }
  }

  async deleteLanguage({ password, verificationCode }: any): Promise<void> {
    this.deleteSubmitLoading = true;

    const result = await lastValueFrom(
      this._deleteMetaModel.mutate({ id: this.language.value()!.id, password: password, code: verificationCode })
    );

    if (result.errors)
      this.messages.error(result.errors, {
        close: false,
        onlyOne: true,
        displayMode: 'replace',
        target: this.messageContainerDelete
      });

    if (result.data?.deleteMetaModel) {
      this.messages.success('Language successfully deleted.', {
        onlyOne: true,
        displayMode: 'replace'
      });
      this.router.navigate([`/${this.language.value()?.owner?.username}/languages`]);
    }

    this.deleteSubmitLoading = false;
  }
}
