import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { CenterAction, GModelElementSchema } from '@eclipse-glsp/protocol';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LanguageElement, LanguageElementType } from '../../../../dynamic-glsp/protocol/language';
import { RefreshModelOperation } from '../../../../dynamic-glsp/protocol/operation/model-refresh';
import { bootstrapRenderers } from '../../../../json-forms/bootstrap-renderer';
import { MetaElement } from '../../entities/meta-element.entity';
import { AModelToJSONForms } from '../../global/amodel-to-json-forms';
import { Global } from '../../global/global';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { AModelElementSchema } from '../../../../dynamic-glsp/protocol/amodel';
import { JsonModel, JsonModelConfig } from '../../global/json-model';

import { ModelEditorComponent } from '../model-editor/model-editor.component';

@Component({
  selector: 'language-editor',
  templateUrl: './language-editor.component.html',
  styleUrl: './language-editor.component.scss'
})
export class LanguageEditorComponent implements OnInit {
  @ViewChild('showcase') showcase!: ModelEditorComponent;

  @Input() element!: MetaElement;
  @Input() type: LanguageElementType = LanguageElementType.NODE;

  jsonFormsRenderers = [...bootstrapRenderers];

  gModel!: JsonModel<GModelElementSchema>;

  _gModel!: GModelElementSchema;
  _gModelSubscription?: Subscription;

  gModelSelectedNodePath?: string;
  gModelSelectedNodePathSubscription?: Subscription;

  gModelSelectedNode?: any;
  gModelSelectedNodeSubscription?: Subscription;

  gModelSelectedNodeConfig?: any;
  gModelSelectedNodeConfigSubscription?: Subscription;

  aModel!: JsonModel<AModelElementSchema>;

  _aModel!: AModelElementSchema;
  _aModelSubscription?: Subscription;

  aModelSelectedNodePath?: string;
  aModelSelectedNodePathSubscription?: Subscription;

  aModelSelectedNode?: any;
  aModelSelectedNodeSubscription?: Subscription;

  aModelSelectedNodeConfig?: any;
  aModelSelectedNodeConfigSubscription?: Subscription;

  aModelJsonSchema!: JsonSchema;
  aModelUISchema!: UISchemaElement;

  showcaseLanguageElement!: LanguageElement;

  elementLoading: boolean = true;
  submitLoading: boolean = false;

  setValid: any = Global.setValid;
  compareById: any = Global.compareById;

  elementForm!: FormGroup;
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);

  defaultModel: any;

  constructor(
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.elementForm = this.formBuilder.group({
      name: this.name
    });
    if (!this.element) this.activeModal.dismiss('No element provided');
    this.elementForm.patchValue(this.element);
    this.elementLoading = false;

    // set the default model
    this.defaultModel = _.cloneDeep(this.element.defaultModel);

    // create an instance of JsonModel with the gModel and config
    // for manage the access and modification of the gModel
    this.gModel = new JsonModel(
      _.cloneDeep(this.element.gModel) as GModelElementSchema,
      {
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
      } as JsonModelConfig
    );

    // subscribe to the gModel changes
    this._gModelSubscription = this.gModel.getModel().subscribe((newGModel: GModelElementSchema) => {
      this._gModel = newGModel;
      this.updateShowcase();
    });

    // subscribe to the gModel selected node path changes
    this.gModelSelectedNodePathSubscription = this.gModel
      .getSelectedNodePath()
      .subscribe((newGModelSelectedNodePath: string) => (this.gModelSelectedNodePath = newGModelSelectedNodePath));

    // subscribe to the gModel selected node changes
    this.gModelSelectedNodeSubscription = this.gModel
      .getSelectedNode()
      .subscribe((newGModelSelectedNode: any) => (this.gModelSelectedNode = newGModelSelectedNode));

    // subscribe to the gModel selected node config changes
    this.gModelSelectedNodeConfigSubscription = this.gModel
      .getSelectedNodeConfig()
      .subscribe((newGModelSelectedNodeConfig: any) => (this.gModelSelectedNodeConfig = newGModelSelectedNodeConfig));

    // create an instance of JsonModel with the aModel and config
    // for manage the access and modification of the aModel
    this.aModel = new JsonModel(
      _.cloneDeep(this.element.aModel) as AModelElementSchema,
      {
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
      } as JsonModelConfig
    );

    // subscribe to the aModel changes
    this._aModelSubscription = this.aModel.getModel().subscribe((newAModel: AModelElementSchema) => {
      this._aModel = newAModel;

      // generate the JSON Forms schema and UI schema from the aModel
      // for use in the default data editor
      const { schema, uiSchema } = AModelToJSONForms(this._aModel);
      this.aModelJsonSchema = schema;
      this.aModelUISchema = uiSchema;

      console.log('new aModel', this._aModel, this.aModelJsonSchema, this.aModelUISchema);

      this.updateShowcase();
    });

    // subscribe to the aModel selected node path changes
    this.aModelSelectedNodePathSubscription = this.aModel
      .getSelectedNodePath()
      .subscribe((newAModelSelectedNodePath: string) => (this.aModelSelectedNodePath = newAModelSelectedNodePath));

    // subscribe to the aModel selected node changes
    this.aModelSelectedNodeSubscription = this.aModel
      .getSelectedNode()
      .subscribe((newAModelSelectedNode: any) => (this.aModelSelectedNode = newAModelSelectedNode));

    // subscribe to the aModel selected node config changes
    this.aModelSelectedNodeConfigSubscription = this.aModel
      .getSelectedNodeConfig()
      .subscribe((newAModelSelectedNodeConfig: any) => (this.aModelSelectedNodeConfig = newAModelSelectedNodeConfig));
  }

  onGModelNodeChange(event: any): void {
    this.gModel.setNode(this.gModelSelectedNodePath!, event);
  }

  onAModelNodeChange(event: any): void {
    this.aModel.setNode(this.aModelSelectedNodePath!, event);
  }

  onDefaultModelChange(event: any): void {
    this.defaultModel = event;
    this.updateShowcase();
  }

  updateShowcase(): void {
    this.showcaseLanguageElement = {
      type: this.type,
      name: this.element.tag ?? 'showcase',
      label: this.name.value ?? 'showcase',
      gModel: this._gModel,
      aModel: this._aModel,
      default: this.defaultModel
    };

    // send action for reload the language of the showcase
    this.showcase?.reloadLanguage(this.showcaseLanguageElement);

    // send action for request the model of the showcase
    // this allow to update the showcase element render
    this.showcase?.sendAction(RefreshModelOperation.create());

    // send action for center the showcase element
    this.showcase?.sendAction(CenterAction.create(['showcase_element', 'source', 'target']));
  }

  updateElement(): void {
    //TODO: update the element on database
  }
}
