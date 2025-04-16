import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  CheckMetaModelTagExists,
  CreateMetaModel,
  MetaModel,
  UpdateMetaModel
} from '../../../entities/meta-model.entity';
import { Global } from '../../../global/global';
import { ExtraValidators } from '../../../validators/validators';
import { lastValueFrom } from 'rxjs';

import { AuthService } from '../../../../services/auth.service';
import { LanguageService } from '../../../../services/language.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'language-editor',
  templateUrl: './language-editor.component.html',
  styleUrl: './language-editor.component.scss'
})
export class LanguageEditorComponent implements OnInit {
  submitLoading: boolean = false;

  setValid: any = Global.setValid;

  languageForm!: FormGroup;
  name = new FormControl(this.language.value()?.name, [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);
  tag: FormControl = new FormControl(
    this.language.value()?.tag,
    [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern('[a-z0-9]*')],
    [ExtraValidators.metaModelTagExists(this._checkMetaModelTagExists, this.language.value()?.id)]
  );
  description: FormControl = new FormControl(this.language.value()?.description, [Validators.maxLength(200)]);
  logo = new FormControl(this.language.value()?.logo, []);
  logoFile = new FormControl<Blob | null>(null, []);

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    public language: LanguageService,
    private _checkMetaModelTagExists: CheckMetaModelTagExists,
    private _updateMetaModel: UpdateMetaModel,
    private _createMetaModel: CreateMetaModel
  ) {}

  ngOnInit(): void {
    this.languageForm = this.formBuilder.group({
      name: this.name,
      tag: this.tag,
      description: this.description,
      logo: this.logo
    });
  }

  async updateLanguage(): Promise<void> {
    this.languageForm.markAllAsTouched();

    if (this.languageForm.valid) {
      this.submitLoading = true;

      const result = await lastValueFrom(
        this._updateMetaModel.mutate(
          {
            metaModelUpdateInput: Object.assign(this.languageForm.value, { id: this.language.value()?.id }),
            logoFile: this.logoFile.value
          },
          { context: { useMultipart: true } }
        )
      );

      if (result.errors)
        this.messages.error(result.errors, {
          onlyOne: true,
          displayMode: 'replace'
        });

      if (result.data?.updateMetaModel) {
        this.languageForm.markAsPristine();
        this.language.value.set(result.data?.updateMetaModel);
        this.messages.success(`Language successfully saved.`, {
          onlyOne: true,
          displayMode: 'replace'
        });
        this.activeModal.dismiss('Success');
      }

      this.submitLoading = false;
    } else {
      this.messages.error('Some values are invalid, please check.', {
        onlyOne: true,
        displayMode: 'replace'
      });
    }
  }

  async createLanguage(): Promise<void> {
    this.languageForm.markAllAsTouched();

    if (this.languageForm.valid) {
      this.submitLoading = true;

      const result = await lastValueFrom(
        this._createMetaModel.mutate(
          {
            metaModelCreateInput: Object.assign(this.languageForm.value, { owner: { id: this.auth.user?.id } }),
            logoFile: this.logoFile.value
          },
          { context: { useMultipart: true } }
        )
      );

      if (result.errors)
        this.messages.error(result.errors, {
          onlyOne: true,
          displayMode: 'replace'
        });

      if (result.data?.createMetaModel) {
        this.languageForm.markAsPristine();
        this.language.value.set(result.data?.createMetaModel);
        this.messages.success(`Language successfully created.`, {
          onlyOne: true,
          displayMode: 'replace'
        });
        this.activeModal.dismiss('Success');
      }

      this.submitLoading = false;
    } else {
      this.messages.error('Some values are invalid, please check.', {
        onlyOne: true,
        displayMode: 'replace'
      });
    }
  }
}
