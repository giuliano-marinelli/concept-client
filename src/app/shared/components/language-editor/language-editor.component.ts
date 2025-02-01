import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { CenterAction, GModelElementSchema, RequestModelAction } from '@eclipse-glsp/protocol';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LanguageElement, LanguageElementType } from '../../../../dynamic-glsp/protocol/language';
import { MetaElement } from '../../entities/meta-element.entity';
import { Global } from '../../global/global';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { AModelElementSchema } from '../../../../dynamic-glsp/protocol/amodel';
import { RefreshModelOperation } from '../../../../dynamic-glsp/protocol/operation/refresh-model';
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
            schema: {
              properties: {
                type: { type: 'string', readOnly: true },
                layout: { type: 'string', enum: ['vbox', 'hbox'] }
              }
            } as any,
            uiSchema: {
              type: 'VerticalLayout',
              elements: [
                { type: 'Control', scope: '#/properties/type' },
                { type: 'Control', scope: '#/properties/layout' }
              ]
            } as any
          },
          edge: {
            icon: 'arrows-left-right',
            children: 'children',
            schema: {
              properties: {
                type: { type: 'string', readOnly: true }
              }
            } as any,
            uiSchema: {
              type: 'VerticalLayout',
              elements: [{ type: 'Control', scope: '#/properties/type' }]
            } as any
          },
          label: {
            icon: 'tag',
            descriptor: 'text',
            default: { text: 'Text' },
            schema: {
              properties: {
                type: { type: 'string', readOnly: true },
                text: { type: 'string' }
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
              }
            } as any,
            uiSchema: {
              type: 'VerticalLayout',
              elements: [
                { type: 'Control', scope: '#/properties/type' },
                { type: 'Control', scope: '#/properties/text' }
                // {
                //   type: 'Group',
                //   label: 'Test',
                //   elements: [
                //     { type: 'Control', scope: '#/properties/test/properties/text' },
                //     { type: 'Control', scope: '#/properties/test/properties/email' },
                //     { type: 'Control', scope: '#/properties/test/properties/url' },
                //     { type: 'Control', scope: '#/properties/test/properties/date' },
                //     { type: 'Control', scope: '#/properties/test/properties/time' },
                //     { type: 'Control', scope: '#/properties/test/properties/datetime' },
                //     { type: 'Control', scope: '#/properties/test/properties/duration' },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/textarea',
                //       options: { multi: true }
                //     },
                //     { type: 'Control', scope: '#/properties/test/properties/number' },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/range',
                //       options: { slider: true }
                //     },
                //     { type: 'Control', scope: '#/properties/test/properties/checkbox' },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/switch',
                //       options: { toggle: true }
                //     },
                //     { type: 'Control', scope: '#/properties/test/properties/select' },
                //     { type: 'Control', scope: '#/properties/test/properties/selectOneOf' },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/radio',
                //       options: { format: 'radio' }
                //     },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/radioOneOf',
                //       options: { format: 'radio' }
                //     }
                //   ]
                // }
                // {
                //   type: 'Group',
                //   label: 'Test Disabled',
                //   elements: [
                //     { type: 'Control', scope: '#/properties/test/properties/text', options: { readonly: true } },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/textarea',
                //       options: { multi: true, readonly: true }
                //     },
                //     { type: 'Control', scope: '#/properties/test/properties/number', options: { readonly: true } },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/range',
                //       options: { slider: true, readonly: true }
                //     },
                //     { type: 'Control', scope: '#/properties/test/properties/checkbox', options: { readonly: true } },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/switch',
                //       options: { toggle: true, readonly: true }
                //     },
                //     { type: 'Control', scope: '#/properties/test/properties/select', options: { readonly: true } },
                //     { type: 'Control', scope: '#/properties/test/properties/selectOneOf', options: { readonly: true } },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/radio',
                //       options: { format: 'radio', readonly: true }
                //     },
                //     {
                //       type: 'Control',
                //       scope: '#/properties/test/properties/radioOneOf',
                //       options: { format: 'radio', readonly: true }
                //     }
                //   ]
                // }
              ]
            } as any
          },
          comp: {
            icon: 'box-open',
            descriptor: 'layout',
            children: 'children',
            default: { layout: 'vbox' },
            schema: {
              properties: {
                type: { type: 'string', readOnly: true },
                layout: { type: 'string', enum: ['vbox', 'hbox'] }
              }
            } as any,
            uiSchema: {
              type: 'VerticalLayout',
              elements: [
                { type: 'Control', scope: '#/properties/type' },
                { type: 'Control', scope: '#/properties/layout' }
              ]
            } as any
          },
          decision: {
            icon: 'arrows-turn-to-dots',
            fields: ['then', 'else'],
            schema: {
              properties: {
                type: { type: 'string', readOnly: true },
                condition: { type: 'string' }
              }
            } as any,
            uiSchema: {
              type: 'VerticalLayout',
              elements: [{ type: 'Control', scope: '#/properties/type' }]
            } as any
          },
          iteration: {
            icon: 'arrows-rotate',
            fields: ['template'],
            schema: {
              properties: {
                type: { type: 'string', readOnly: true },
                iterable: { type: 'string' },
                iterand: { type: 'string' }
              }
            } as any,
            uiSchema: {
              type: 'VerticalLayout',
              elements: [
                { type: 'Control', scope: '#/properties/type' },
                { type: 'Control', scope: '#/properties/iterable' },
                { type: 'Control', scope: '#/properties/iterand' }
              ]
            } as any
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
    this.aModel = new JsonModel(_.cloneDeep(this.element.aModel) as AModelElementSchema, {
      defaultIcon: 'file',
      nodes: {
        object: {
          icon: 'list',
          descriptor: 'label',
          children: 'properties',
          childrenKey: 'key',
          schema: {
            properties: {
              type: { type: 'string', readOnly: true },
              label: { type: 'string' }
            }
          } as any,
          uiSchema: {
            type: 'VerticalLayout',
            elements: [
              { type: 'Control', scope: '#/properties/type' },
              { type: 'Control', scope: '#/properties/label' }
            ]
          } as any
        },
        array: {
          icon: 'bars',
          descriptor: 'label',
          fields: ['items'],
          schema: {
            properties: {
              type: { type: 'string', readOnly: true },
              label: { type: 'string' }
            }
          } as any,
          uiSchema: {
            type: 'VerticalLayout',
            elements: [
              { type: 'Control', scope: '#/properties/type' },
              { type: 'Control', scope: '#/properties/label' }
            ]
          } as any
        },
        string: {
          icon: 'font',
          descriptor: 'label',
          schema: {
            properties: {
              type: { type: 'string', readOnly: true },
              label: { type: 'string' },
              isEnum: { type: 'boolean' },
              enum: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    const: { type: 'string' }
                  }
                }
              }
            }
          } as any,
          uiSchema: {
            type: 'VerticalLayout',
            elements: [
              { type: 'Control', scope: '#/properties/type' },
              { type: 'Control', scope: '#/properties/label' },
              { type: 'Control', scope: '#/properties/isEnum', options: { toggle: true } },
              {
                type: 'Control',
                scope: '#/properties/enum',
                options: {
                  detail: {
                    type: 'HorizontalLayout',
                    elements: [
                      {
                        type: 'Control',
                        scope: '#/properties/title'
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/const',
                        label: 'Value'
                      }
                    ]
                  }
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
          } as any
        },
        integer: {
          icon: 'hashtag',
          descriptor: 'label',
          schema: {
            properties: {
              type: { type: 'string', readOnly: true },
              label: { type: 'string' }
            }
          } as any,
          uiSchema: {
            type: 'VerticalLayout',
            elements: [
              { type: 'Control', scope: '#/properties/type' },
              { type: 'Control', scope: '#/properties/label' }
            ]
          } as any
        },
        boolean: {
          icon: 'circle-half-stroke',
          descriptor: 'label',
          schema: {
            properties: {
              type: { type: 'string', readOnly: true },
              label: { type: 'string' }
            }
          } as any,
          uiSchema: {
            type: 'VerticalLayout',
            elements: [
              { type: 'Control', scope: '#/properties/type' },
              { type: 'Control', scope: '#/properties/label' }
            ]
          } as any
        }
      }
    });

    // subscribe to the aModel changes
    this._aModelSubscription = this.aModel.getModel().subscribe((newAModel: AModelElementSchema) => {
      this._aModel = newAModel;
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

    console.log(this.element.gModel);
    console.log(this.element.aModel);
  }

  onGModelNodeChange(event: any): void {
    this.gModel.setNode(this.gModelSelectedNodePath!, event.newModel);
  }

  onAModelNodeChange(event: any): void {
    this.aModel.setNode(this.aModelSelectedNodePath!, event.newModel);
  }

  updateShowcase(): void {
    this.showcaseLanguageElement = {
      type: this.type,
      name: this.element.tag ?? 'showcase',
      label: this.name.value ?? 'showcase',
      gModel: this._gModel,
      aModel: this._aModel,
      default: this.element.defaultModel
    };

    // send action for reload the language of the showcase
    this.showcase?.reloadLanguage();

    // send action for request the model of the showcase
    // this allow to update the showcase element render
    this.showcase?.sendAction(RefreshModelOperation.create());

    // send action for center the showcase element
    this.showcase?.sendAction(CenterAction.create(['showcase_element']));
  }

  updateElement(): void {
    //TODO: update the element on database
  }
}
