import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { CenterAction, GModelElementSchema } from '@eclipse-glsp/protocol';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LanguageElement, LanguageElementType } from '../../../../dynamic-glsp/protocol/language';
import { RefreshModelOperation } from '../../../../dynamic-glsp/protocol/operation/model-refresh';
import { bootstrapRenderers } from '../../../../json-forms/bootstrap-renderer';
import { MetaElement } from '../../entities/meta-element.entity';
import { CheckMetaElementTagExists, MetaModel, UpdateMetaElement } from '../../entities/meta-model.entity';
import { ajvOptions } from '../../global/ajv-validator';
import { AModelToJSONForms } from '../../global/amodel-to-json-forms';
import { Global } from '../../global/global';
import { ExtraValidators } from '../../validators/validators';
import { Ajv } from 'ajv';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { AModelElementSchema } from '../../../../dynamic-glsp/protocol/amodel';
import { JsonModel, JsonModelConfig } from '../../global/json-model';

import { ModelEditorComponent } from '../model-editor/model-editor.component';

import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: 'language-editor',
  templateUrl: './language-editor.component.html',
  styleUrl: './language-editor.component.scss'
})
export class LanguageEditorComponent implements OnInit, OnDestroy {
  @ViewChild('showcase') showcase!: ModelEditorComponent;

  @Input() language!: MetaModel;
  @Input() element!: MetaElement;
  @Input() type: LanguageElementType = LanguageElementType.NODE;

  jsonFormsRenderers = [...bootstrapRenderers];
  ajv = new Ajv(ajvOptions);

  gModelTree!: JsonModel<GModelElementSchema>;

  gModel!: GModelElementSchema;
  gModelSubscription?: Subscription;

  gModelSelectedNodePath?: string;
  gModelSelectedNodePathSubscription?: Subscription;

  gModelSelectedNode?: any;
  gModelSelectedNodeSubscription?: Subscription;

  gModelSelectedNodeConfig?: any;
  gModelSelectedNodeConfigSubscription?: Subscription;

  aModelTree!: JsonModel<AModelElementSchema>;

  aModel!: AModelElementSchema;
  aModelSubscription?: Subscription;

  aModelSelectedNodePath?: string;
  aModelSelectedNodePathSubscription?: Subscription;

  aModelSelectedNode?: any;
  aModelSelectedNodeSubscription?: Subscription;

  aModelSelectedNodeConfig?: any;
  aModelSelectedNodeConfigSubscription?: Subscription;

  aModelJsonSchema!: JsonSchema;
  aModelUISchema!: UISchemaElement;

  defaultModel: any;

  showcaseLanguageElement!: LanguageElement;

  elementLoading: boolean = true;
  submitLoading: boolean = false;

  setValid: any = Global.setValid;
  compareById: any = Global.compareById;
  capitalizeFirstLetter: any = Global.capitalizeFirstLetter;

  elementForm!: FormGroup;
  id: any;
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);
  tag!: FormControl;

  constructor(
    public messages: MessagesService,
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    private _checkMetaElementTagExists: CheckMetaElementTagExists,
    private _updateMetaElement: UpdateMetaElement
  ) {}

  ngOnInit(): void {
    // tag form control needs to be created on init because it depends on the language and element ids
    this.tag = new FormControl(
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern('[a-z0-9]*')],
      [ExtraValidators.metaElementTagExists(this._checkMetaElementTagExists, this.language.id!, this.element.id!)]
    );

    this.elementForm = this.formBuilder.group({
      id: this.id,
      name: this.name,
      tag: this.tag
    });
    if (!this.element) this.activeModal.dismiss('No element provided');
    this.elementForm.patchValue(this.element);

    // set the default model
    this.defaultModel = _.cloneDeep(this.element.defaultModel);

    const gModelElement = (
      this.element.gModel ? _.cloneDeep(this.element.gModel) : { type: this.type, children: [] }
    ) as GModelElementSchema;

    // create an instance of JsonModel with the gModel and config
    // for manage the access and modification of the gModel
    this.gModelTree = new JsonModel(gModelElement, {
      defaultIcon: 'circle',
      nodes: {
        node: {
          icon: 'circle',
          descriptor: 'layout',
          children: 'children',
          default: { layout: 'vbox' },
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'layout', type: 'string', enum: ['vbox', 'hbox'] }
            ]
          }
        },
        edge: {
          icon: 'arrows-left-right',
          children: 'children',
          aModel: {
            type: 'object',
            properties: [{ key: 'type', type: 'string', readOnly: true }]
          }
        },
        label: {
          icon: 'tag',
          descriptor: 'text',
          default: { text: 'Text' },
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'text', type: 'string' }
              // test: {
              //   type: 'object',
              //   properties: {
              //     text: { type: 'string' },
              //     email: { type: 'string', format: 'email' },
              //     url: { type: 'string', format: 'url' },
              //     date: { type: 'string', format: 'date' },
              //     time: { type: 'string', format: 'time' },
              //     datetime: { type: 'string', format: 'date-time' },
              //     duration: { type: 'string', format: 'duration' },
              //     textarea: { type: 'string' },
              //     number: { type: 'number', multipleOf: 0.1 },
              //     range: { type: 'number', minimum: 1, maximum: 5, default: 3, multipleOf: 1 },
              //     checkbox: { type: 'boolean' },
              //     switch: { type: 'boolean' },
              //     select: { type: 'string', enum: ['option 1', 'option 2'] },
              //     selectOneOf: {
              //       type: 'number',
              //       oneOf: [
              //         { const: 1, title: 'Algo 1' },
              //         { const: 2, title: 'Algo 2' }
              //       ]
              //     },
              //     radio: { type: 'string', enum: ['option 1', 'option 2'] },
              //     radioOneOf: {
              //       type: 'number',
              //       oneOf: [
              //         { const: 1, title: 'Algo 1' },
              //         { const: 2, title: 'Algo 2' }
              //       ]
              //     }
              //   }
              // }
            ]
          }
        },
        comp: {
          icon: 'box-open',
          descriptor: 'layout',
          children: 'children',
          default: { layout: 'vbox' },
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'layout', type: 'string', enum: ['vbox', 'hbox'] }
            ]
          }
        },
        decision: {
          icon: 'arrows-turn-to-dots',
          fields: ['then', 'else'],
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'condition', type: 'string' }
            ]
          }
        },
        iteration: {
          icon: 'arrows-rotate',
          descriptor: (node: any) => (node.iterable ?? '·') + ' -> ' + (node.iterand ?? '·'),
          fields: ['template'],
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'iterable', type: 'string' },
              { key: 'iterand', type: 'string' }
            ]
          }
        }
      }
    } as JsonModelConfig);

    // subscribe to the gModel changes
    this.gModelSubscription = this.gModelTree.getModel().subscribe((newGModel: GModelElementSchema) => {
      this.gModel = newGModel;
      this.updateShowcase();
    });

    // subscribe to the gModel selected node path changes
    this.gModelSelectedNodePathSubscription = this.gModelTree
      .getSelectedNodePath()
      .subscribe((newGModelSelectedNodePath: string) => (this.gModelSelectedNodePath = newGModelSelectedNodePath));

    // subscribe to the gModel selected node changes
    this.gModelSelectedNodeSubscription = this.gModelTree
      .getSelectedNode()
      .subscribe((newGModelSelectedNode: any) => (this.gModelSelectedNode = newGModelSelectedNode));

    // subscribe to the gModel selected node config changes
    this.gModelSelectedNodeConfigSubscription = this.gModelTree
      .getSelectedNodeConfig()
      .subscribe((newGModelSelectedNodeConfig: any) => (this.gModelSelectedNodeConfig = newGModelSelectedNodeConfig));

    const aModelElement = (
      this.element.aModel ? _.cloneDeep(this.element.aModel) : { type: 'object', properties: [] }
    ) as AModelElementSchema;

    // create an instance of JsonModel with the aModel and config
    // for manage the access and modification of the aModel
    this.aModelTree = new JsonModel(aModelElement, {
      defaultIcon: 'file',
      nodes: {
        object: {
          icon: 'list',
          descriptor: 'label',
          children: 'properties',
          childrenKey: 'key',
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' }
            ]
          }
        },
        array: {
          icon: 'bars',
          descriptor: 'label',
          fields: ['items'],
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' }
            ]
          }
        },
        string: {
          icon: 'font',
          descriptor: 'label',
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' },
              { key: 'isEnum', type: 'boolean' },
              {
                key: 'enum',
                type: 'array',
                items: {
                  type: 'object',
                  properties: [
                    { key: 'title', type: 'string' },
                    { key: 'const', type: 'string', label: 'Value' }
                  ]
                },
                rule: {
                  effect: 'SHOW',
                  condition: {
                    scope: '#/properties/isEnum',
                    schema: {
                      const: true
                    },
                    failWhenUndefined: true
                  }
                }
              }
            ]
          }
        },
        integer: {
          icon: 'hashtag',
          descriptor: 'label',
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' }
            ]
          }
        },
        boolean: {
          icon: 'circle-half-stroke',
          descriptor: 'label',
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' }
            ]
          }
        }
      }
    } as JsonModelConfig);

    // subscribe to the aModel changes
    this.aModelSubscription = this.aModelTree.getModel().subscribe((newAModel: AModelElementSchema) => {
      this.aModel = newAModel;

      // generate the JSON Forms schema and UI schema from the aModel
      // for use in the default data editor
      const { schema, uiSchema } = AModelToJSONForms(this.aModel);
      this.aModelJsonSchema = schema;
      this.aModelUISchema = uiSchema;

      // validate the default model with the schema for apply validations and filter the unused data
      this.ajv.validate(schema, this.defaultModel);

      this.updateShowcase();
    });

    // subscribe to the aModel selected node path changes
    this.aModelSelectedNodePathSubscription = this.aModelTree
      .getSelectedNodePath()
      .subscribe((newAModelSelectedNodePath: string) => (this.aModelSelectedNodePath = newAModelSelectedNodePath));

    // subscribe to the aModel selected node changes
    this.aModelSelectedNodeSubscription = this.aModelTree
      .getSelectedNode()
      .subscribe((newAModelSelectedNode: any) => (this.aModelSelectedNode = newAModelSelectedNode));

    // subscribe to the aModel selected node config changes
    this.aModelSelectedNodeConfigSubscription = this.aModelTree
      .getSelectedNodeConfig()
      .subscribe((newAModelSelectedNodeConfig: any) => (this.aModelSelectedNodeConfig = newAModelSelectedNodeConfig));

    this.elementLoading = false;
  }

  ngOnDestroy(): void {
    this.gModelSubscription?.unsubscribe();
    this.gModelSelectedNodePathSubscription?.unsubscribe();
    this.gModelSelectedNodeSubscription?.unsubscribe();
    this.gModelSelectedNodeConfigSubscription?.unsubscribe();

    this.aModelSubscription?.unsubscribe();
    this.aModelSelectedNodePathSubscription?.unsubscribe();
    this.aModelSelectedNodeSubscription?.unsubscribe();
    this.aModelSelectedNodeConfigSubscription?.unsubscribe();
  }

  onGModelNodeChange(event: any): void {
    this.gModelTree.setNode(this.gModelSelectedNodePath!, event);
  }

  onAModelNodeChange(event: any): void {
    this.aModelTree.setNode(this.aModelSelectedNodePath!, event);
  }

  onDefaultModelChange(event: any): void {
    this.defaultModel = event;
    this.updateShowcase();
  }

  async updateShowcase(): Promise<void> {
    this.showcaseLanguageElement = {
      type: this.type,
      name: this.element.tag ?? 'showcase',
      label: this.name.value ?? 'showcase',
      gModel: this.gModel,
      aModel: this.aModel,
      default: this.defaultModel
    };

    // send action for reload the language of the showcase
    await this.showcase?.reloadLanguage(this.showcaseLanguageElement);

    // send action for request the model of the showcase
    // this allow to update the showcase element render
    await this.showcase?.sendAction(RefreshModelOperation.create());

    // send action for center the showcase element
    await this.showcase?.sendAction(CenterAction.create(['showcase_element', 'source', 'target']));
  }

  async updateElement(): Promise<void> {
    this.submitLoading = true;
    this.elementForm.markAllAsTouched();
    await this.updateShowcase();
    if (this.elementForm.valid) {
      this._updateMetaElement
        .mutate({
          metaElementUpdateInput: Object.assign(this.elementForm.value, {
            type: this.type,
            gModel: this.gModel,
            aModel: this.aModel,
            defaultModel: this.defaultModel,
            preview: this.showcase?.getSVG()
          })
        })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors)
              this.messages.error(errors, {
                onlyOne: true,
                displayMode: 'replace'
              });
            if (data?.updateMetaElement) {
              this.elementForm.markAsPristine();
              // this.getMetaElement();
              this.messages.success(`${this.capitalizeFirstLetter(this.type)} successfully saved.`, {
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
      this.submitLoading = false;
    }
  }
}
