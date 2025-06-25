import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import {
  AModelElementSchema,
  AModelObjectSchema,
  Type as AModelType,
  DynamicTypes,
  LanguageConstraint,
  LanguageElement,
  LanguageElementType,
  RefreshModelOperation
} from '@dynamic-glsp/protocol';
import { CenterAction, DefaultTypes, GModelElementSchema } from '@eclipse-glsp/protocol';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { bootstrapRenderers } from '../../../../../json-forms/bootstrap-renderer';
import { MetaElement } from '../../../entities/meta-element.entity';
import {
  CheckMetaElementTagExists,
  CreateMetaElement,
  MetaModel,
  UpdateMetaElement
} from '../../../entities/meta-model.entity';
import { ajvOptions } from '../../../global/ajv-validator';
import { AModelToJSONForms } from '../../../global/amodel-to-json-forms';
import { Global } from '../../../global/global';
import { ExtraValidators } from '../../../validators/validators';
import { Ajv } from 'ajv';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { JsonModel, JsonModelConfig } from '../../../global/json-model';

import { ModelEditorComponent } from '../../model/editor/model-editor.component';

import { MessagesService } from '../../../../services/messages.service';

export interface LanguageConstraintsTree {
  type: 'constraints';
  constraints: LanguageConstraint[];
}

@Component({
  selector: 'language-element-editor',
  templateUrl: './language-element-editor.component.html',
  styleUrl: './language-element-editor.component.scss'
})
export class LanguageElementEditorComponent implements OnInit, OnDestroy {
  @ViewChild('showcase') showcase!: ModelEditorComponent;

  @Input() language!: MetaModel;
  @Input() element?: MetaElement;
  @Input() type: LanguageElementType = LanguageElementType.NODE;

  @Output() onUpdate: EventEmitter<MetaElement> = new EventEmitter<MetaElement>();
  @Output() onCreate: EventEmitter<MetaElement> = new EventEmitter<MetaElement>();

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

  constraintsTree!: JsonModel<LanguageConstraintsTree>;

  constraints!: LanguageConstraint[];
  constraintsSubscription?: Subscription;

  constraintsSelectedNodePath?: string;
  constraintsSelectedNodePathSubscription?: Subscription;

  constraintsSelectedNode?: any;
  constraintsSelectedNodeSubscription?: Subscription;

  constraintsSelectedNodeConfig?: any;
  constraintsSelectedNodeConfigSubscription?: Subscription;

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
    Validators.maxLength(15),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);
  tag!: FormControl;

  constructor(
    public messages: MessagesService,
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    private _checkMetaElementTagExists: CheckMetaElementTagExists,
    private _updateMetaElement: UpdateMetaElement,
    private _createMetaElement: CreateMetaElement
  ) {}

  ngOnInit(): void {
    // tag form control needs to be created on init because it depends on the language and element ids
    this.tag = new FormControl(
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(15), Validators.pattern('[a-z0-9]*')],
      [ExtraValidators.metaElementTagExists(this._checkMetaElementTagExists, this.language.id!, this.element?.id)]
    );

    this.elementForm = this.formBuilder.group({
      name: this.name,
      tag: this.tag
    });

    // set the form values and element id if element was provided
    if (this.element) {
      this.id = this.element.id;
      this.elementForm.patchValue(this.element);
    }

    // set the default model
    this.defaultModel = this.element ? _.cloneDeep(this.element.defaultModel) : {};

    const gModelElement = (
      this.element?.gModel
        ? _.cloneDeep(this.element.gModel)
        : {
            type: this.type,
            layout: 'vbox',
            layoutOptions: { resizable: true, vAlign: 'center', hAlign: 'center' },
            children: []
          }
    ) as GModelElementSchema;

    // create an instance of JsonModel with the gModel and config
    // for manage the access and modification of the gModel
    this.gModelTree = new JsonModel(gModelElement, {
      defaultIcon: 'circle',
      defaultChildrenTypes: [
        DynamicTypes.SHAPE,
        DefaultTypes.LABEL,
        DefaultTypes.COMPARTMENT,
        DynamicTypes.DECISION,
        DynamicTypes.ITERATION
      ],
      nodes: {
        [DefaultTypes.NODE]: {
          icon: 'vector-square',
          descriptor: (node: any) => (node.layout == 'vbox' ? 'vertical' : 'horizontal'),
          children: 'children',
          default: { layout: 'vbox', layoutOptions: { resizable: true, vAlign: 'center', hAlign: 'center' } },
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              {
                key: 'layout',
                label: 'Content orientation',
                type: 'string',
                style: 'radio',
                enum: [
                  { title: 'vertical', const: 'vbox' },
                  { title: 'horizontal', const: 'hbox' }
                ]
              },
              {
                key: 'layoutOptions',
                label: 'Layout',
                type: 'object',
                properties: [
                  { key: 'resizable', type: 'boolean', default: true },
                  {
                    key: 'vAlign',
                    label: 'Vertical Align',
                    type: 'string',
                    enum: ['top', 'center', 'bottom'],
                    default: 'center'
                  },
                  {
                    key: 'hAlign',
                    label: 'Horizontal Align',
                    type: 'string',
                    enum: ['left', 'center', 'right'],
                    default: 'center'
                  }
                ]
              }
            ]
          }
        },
        [DefaultTypes.EDGE]: {
          icon: 'arrows-left-right',
          children: 'children',
          aModel: {
            type: 'object',
            properties: [{ key: 'type', type: 'string', readOnly: true }]
          }
        },
        [DynamicTypes.SHAPE]: {
          icon: (node?: any) => {
            if (!node) return 'shapes';
            switch (node.args?.shape) {
              case 'circle':
              case 'ellipse':
                return 'circle';
              case 'diamond':
                return 'diamond';
              case 'rectangle':
              default:
                return 'square';
            }
          },
          label: 'shape',
          descriptor: (node: any) => node.args?.shape + (node.args?.fill ? ` (${node.args.fill})` : ''),
          children: 'children',
          default: {
            args: { shape: 'rectangle', fill: 'white', stroke: 'black', strokeWidth: 1 },
            layoutOptions: {
              absolute: true,
              relWidth: '100%',
              relHeight: '100%',
              relX: '0',
              relY: '0'
            }
          },
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              {
                key: 'args',
                label: 'Styling',
                type: 'object',
                properties: [
                  {
                    key: 'shape',
                    type: 'string',
                    enum: [
                      { title: 'Rectangle', const: 'rectangle' },
                      { title: 'Circle', const: 'circle' },
                      { title: 'Ellipse', const: 'ellipse' },
                      { title: 'Diamond', const: 'diamond' }
                    ],
                    default: 'rectangle'
                  },
                  { key: 'fill', label: 'Background Color', type: 'string', format: 'color' },
                  { key: 'stroke', label: 'Border Color', type: 'string', format: 'color' },
                  { key: 'strokeWidth', label: 'Border Width', type: 'integer', default: 1 }
                ]
              },
              {
                key: 'layoutOptions',
                label: 'Layout',
                type: 'object',
                properties: [
                  { key: 'absolute', type: 'boolean', default: true },
                  { key: 'relWidth', label: 'Width', type: 'string', default: '100%' },
                  { key: 'relHeight', label: 'Height', type: 'string', default: '100%' },
                  { key: 'relX', label: 'Left', type: 'string', default: '0' },
                  { key: 'relY', label: 'Top', type: 'string', default: '0' }
                ]
              }
            ]
          }
        },
        [DefaultTypes.LABEL]: {
          icon: 'tag',
          descriptor: 'text',
          default: { text: 'Text', edgePlacement: { rotate: true, side: 'top', position: 0.5, offset: 0 } },
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'text', type: 'string' },
              {
                key: 'edgePlacement',
                label: 'Placement (for edges)',
                type: 'object',
                properties: [
                  { key: 'rotate', type: 'boolean', default: true },
                  {
                    key: 'side',
                    type: 'string',
                    enum: [
                      { title: 'Left', const: 'left' },
                      { title: 'Right', const: 'right' },
                      { title: 'Top', const: 'top' },
                      { title: 'Bottom', const: 'bottom' },
                      { title: 'On', const: 'on' }
                    ],
                    default: 'bottom'
                  },
                  { key: 'position', type: 'integer', style: 'range', default: 0, minimum: 0, maximum: 1 },
                  { key: 'offset', type: 'integer', default: 0 }
                ]
              }
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
        [DefaultTypes.COMPARTMENT]: {
          icon: 'box-open',
          descriptor: (node: any) => (node.layout == 'vbox' ? 'vertical' : 'horizontal'),
          children: 'children',
          default: {
            layout: 'vbox',
            layoutOptions: {
              vAlign: 'center',
              hAlign: 'center',
              absolute: false
            }
          },
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              {
                key: 'layout',
                label: 'Content orientation',
                type: 'string',
                style: 'radio',
                enum: [
                  { title: 'vertical', const: 'vbox' },
                  { title: 'horizontal', const: 'hbox' }
                ]
              },
              {
                key: 'layoutOptions',
                label: 'Layout',
                type: 'object',
                properties: [
                  {
                    key: 'vAlign',
                    label: 'Vertical Align',
                    type: 'string',
                    enum: ['top', 'center', 'bottom'],
                    default: 'center'
                  },
                  {
                    key: 'hAlign',
                    label: 'Horizontal Align',
                    type: 'string',
                    enum: ['left', 'center', 'right'],
                    default: 'center'
                  },
                  { key: 'absolute', type: 'boolean', default: true },
                  { key: 'relWidth', label: 'Width', type: 'string', default: '100%' },
                  { key: 'relHeight', label: 'Height', type: 'string', default: '100%' },
                  { key: 'relX', label: 'Left', type: 'string', default: '0' },
                  { key: 'relY', label: 'Top', type: 'string', default: '0' }
                ]
              }
            ]
          }
        },
        [DynamicTypes.DECISION]: {
          icon: 'arrows-turn-to-dots',
          descriptor: 'condition',
          fields: ['then', 'else'],
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'condition', type: 'string' }
            ]
          }
        },
        [DynamicTypes.ITERATION]: {
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
    this.gModelSubscription = this.gModelTree.getClearModel().subscribe((newGModel: GModelElementSchema) => {
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
      this.element?.aModel ? _.cloneDeep(this.element.aModel) : { type: 'object', properties: [] }
    ) as AModelElementSchema;

    // create an instance of JsonModel with the aModel and config
    // for manage the access and modification of the aModel
    this.aModelTree = new JsonModel(aModelElement, {
      defaultIcon: 'file',
      nodes: {
        [AModelType.OBJECT]: {
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
        [AModelType.ARRAY]: {
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
        [AModelType.STRING]: {
          icon: 'font',
          descriptor: 'label',
          defaultKey: 'data',
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' },
              { key: 'default', type: 'string', label: 'Default Value' },
              { key: 'minLength', type: 'integer', default: 0 },
              { key: 'maxLength', type: 'integer', default: 0 },
              { key: 'style', type: 'string', enum: ['input', 'textarea'], default: 'input' },
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
        [AModelType.INTEGER]: {
          icon: 'hashtag',
          descriptor: 'label',
          defaultKey: 'data',
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' },
              { key: 'default', type: 'integer', label: 'Default Value' },
              { key: 'minimum', type: 'integer' },
              { key: 'maximum', type: 'integer' },
              { key: 'style', type: 'string', enum: ['input', 'range'], default: 'input' }
            ]
          }
        },
        [AModelType.BOOLEAN]: {
          icon: 'circle-half-stroke',
          descriptor: 'label',
          defaultKey: 'data',
          aModel: {
            type: 'object',
            properties: [
              { key: 'type', type: 'string', readOnly: true },
              { key: 'label', type: 'string' },
              { key: 'default', type: 'boolean', label: 'Default Value' },
              { key: 'style', type: 'string', enum: ['checkbox', 'switch'], default: 'checkbox' }
            ]
          }
        }
      }
    } as JsonModelConfig);

    // subscribe to the aModel changes
    this.aModelSubscription = this.aModelTree.getClearModel().subscribe((newAModel: AModelElementSchema) => {
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

    const constraintsElement = (
      this.element?.constraints
        ? { type: 'constraints', constraints: _.cloneDeep(this.element.constraints) }
        : { type: 'constraints', constraints: [] }
    ) as LanguageConstraintsTree;

    // create an instance of JsonModel with the constraints and config
    // for manage the access and modification of the constraints
    this.constraintsTree = new JsonModel(constraintsElement, {
      nodes: {
        constraints: {
          icon: 'list',
          children: 'constraints',
          childrenTypes: ['constraint'],
          aModel: {
            type: 'object',
            properties: []
          }
        },
        constraint: {
          icon: 'arrow-down-up-across-line',
          default: { source: [], target: [] },
          aModel: {
            type: 'object',
            properties: [
              {
                key: 'source',
                type: 'array',
                items: { type: 'string', label: 'Node type' }
              },
              {
                key: 'target',
                type: 'array',
                items: { type: 'string', label: 'Node type' }
              }
            ]
          }
        }
      }
    } as JsonModelConfig);

    // subscribe to the constraints changes
    this.constraintsSubscription = this.constraintsTree.getClearModel().subscribe((newConstraints: any) => {
      this.constraints = newConstraints.constraints;
      console.log(this.constraints);
    });

    // subscribe to the constraints selected node path changes
    this.constraintsSelectedNodePathSubscription = this.constraintsTree
      .getSelectedNodePath()
      .subscribe(
        (newConstraintsSelectedNodePath: string) => (this.constraintsSelectedNodePath = newConstraintsSelectedNodePath)
      );

    // subscribe to the constraints selected node changes
    this.constraintsSelectedNodeSubscription = this.constraintsTree
      .getSelectedNode()
      .subscribe((newConstraintsSelectedNode: any) => (this.constraintsSelectedNode = newConstraintsSelectedNode));

    // subscribe to the constraints selected node config changes
    this.constraintsSelectedNodeConfigSubscription = this.constraintsTree
      .getSelectedNodeConfig()
      .subscribe(
        (newConstraintsSelectedNodeConfig: any) =>
          (this.constraintsSelectedNodeConfig = newConstraintsSelectedNodeConfig)
      );

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

    this.constraintsSubscription?.unsubscribe();
    this.constraintsSelectedNodePathSubscription?.unsubscribe();
    this.constraintsSelectedNodeSubscription?.unsubscribe();
    this.constraintsSelectedNodeConfigSubscription?.unsubscribe();
  }

  onGModelNodeChange(event: any): void {
    this.gModelTree.setNode(this.gModelSelectedNodePath!, event);
  }

  onAModelNodeChange(event: any): void {
    this.aModelTree.setNode(this.aModelSelectedNodePath!, event);
  }

  onConstraintsNodeChange(event: any): void {
    this.constraintsTree.setNode(this.constraintsSelectedNodePath!, event);
  }

  onDefaultModelChange(event: any): void {
    this.defaultModel = event;
    this.updateShowcase();
  }

  async updateShowcase(): Promise<void> {
    this.showcaseLanguageElement = {
      type: this.type,
      name: this.tag.value && this.tag.value != '' ? this.tag.value : 'showcase',
      label: this.name.value && this.name.value != '' ? this.name.value : 'showcase',
      gModel: this.gModel,
      aModel: this.aModel,
      default: this.defaultModel
    };

    // send action for reload the language of the showcase
    await this.showcase?.loadLanguage(this.showcaseLanguageElement);

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
            id: this.id,
            type: this.type,
            gModel: this.gModel,
            aModel: this.aModel,
            defaultModel: this.defaultModel,
            constraints: this.constraints,
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
              this.messages.success(`${this.capitalizeFirstLetter(this.type)} successfully saved.`, {
                onlyOne: true,
                displayMode: 'replace'
              });
              this.onUpdate.emit(data.updateMetaElement);
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

  async createElement(): Promise<void> {
    this.submitLoading = true;
    this.elementForm.markAllAsTouched();
    await this.updateShowcase();
    if (this.elementForm.valid) {
      this._createMetaElement
        .mutate({
          metaElementCreateInput: Object.assign(this.elementForm.value, {
            metaModel: { id: this.language.id },
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
            if (data?.createMetaElement) {
              this.elementForm.markAsPristine();
              this.messages.success(`${this.capitalizeFirstLetter(this.type)} successfully created.`, {
                onlyOne: true,
                displayMode: 'replace'
              });
              this.onCreate.emit(data.createMetaElement);
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

  isAModelEmpty(): boolean {
    return !(this.aModel as AModelObjectSchema)?.properties?.length;
  }
}
