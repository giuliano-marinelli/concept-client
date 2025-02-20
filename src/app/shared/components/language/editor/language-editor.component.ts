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

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'language-editor',
  templateUrl: './language-editor.component.html',
  styleUrl: './language-editor.component.scss'
})
export class LanguageEditorComponent implements OnInit {
  @Input() language?: MetaModel;

  @Output() onUpdate: EventEmitter<MetaModel> = new EventEmitter<MetaModel>();
  @Output() onCreate: EventEmitter<MetaModel> = new EventEmitter<MetaModel>();

  languageLoading: boolean = true;
  submitLoading: boolean = false;

  setValid: any = Global.setValid;

  languageForm!: FormGroup;
  id: any;
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);
  tag!: FormControl;
  description: FormControl = new FormControl('', [Validators.maxLength(200)]);
  logo = new FormControl('', []);
  logoFile = new FormControl<Blob | null>(null, []);

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    private _checkMetaModelTagExists: CheckMetaModelTagExists,
    private _updateMetaModel: UpdateMetaModel,
    private _createMetaModel: CreateMetaModel
  ) {}

  ngOnInit(): void {
    // tag form control needs to be created on init because it depends on the language id
    this.tag = new FormControl(
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern('[a-z0-9]*')],
      [ExtraValidators.metaModelTagExists(this._checkMetaModelTagExists, this.language?.id)]
    );

    this.languageForm = this.formBuilder.group({
      logo: this.logo,
      name: this.name,
      tag: this.tag,
      description: this.description
    });

    // set the form values and language id if language was provided
    if (this.language) {
      this.id = this.language.id;
      this.languageForm.patchValue(this.language);
    }

    this.languageLoading = false;
  }

  updateLanguage() {
    this.submitLoading = true;
    this.languageForm.markAllAsTouched();

    if (this.languageForm.valid) {
      this._updateMetaModel
        .mutate(
          {
            metaModelUpdateInput: Object.assign(this.languageForm.value, { id: this.id }),
            logoFile: this.logoFile.value
          },
          { context: { useMultipart: true } }
        )
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                onlyOne: true,
                displayMode: 'replace'
              });
            if (data?.updateMetaModel) {
              this.languageForm.markAsPristine();
              this.messages.success(`Language successfully saved.`, {
                onlyOne: true,
                displayMode: 'replace'
              });
              this.onUpdate.emit(data.updateMetaModel);
              this.activeModal.dismiss('Success');
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
      this.submitLoading = false;
    }
  }

  createLanguage() {
    this.submitLoading = true;
    this.languageForm.markAllAsTouched();

    if (this.languageForm.valid) {
      this._createMetaModel
        .mutate(
          {
            metaModelCreateInput: Object.assign(this.languageForm.value, { owner: { id: this.auth.user?.id } }),
            logoFile: this.logoFile.value
          },
          { context: { useMultipart: true } }
        )
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                onlyOne: true,
                displayMode: 'replace'
              });
            if (data?.createMetaModel) {
              this.languageForm.markAsPristine();
              this.messages.success(`Language successfully created.`, {
                onlyOne: true,
                displayMode: 'replace'
              });
              this.onCreate.emit(data.createMetaModel);
              this.activeModal.dismiss('Success');
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
      this.submitLoading = false;
    }
  }
}
