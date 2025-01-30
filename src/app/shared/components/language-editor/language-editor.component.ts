import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GModelElementSchema } from '@eclipse-glsp/protocol';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MetaElement } from '../../entities/meta-element.entity';
import { Global } from '../../global/global';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { AModelElementSchema } from '../../../../dynamic-glsp/protocol/amodel';
import { JsonModel, JsonModelConfig } from '../../global/json-model';

@Component({
  selector: 'language-editor',
  templateUrl: './language-editor.component.html',
  styleUrl: './language-editor.component.scss'
})
export class LanguageEditorComponent implements OnInit {
  @Input() element!: MetaElement;
  @Input() type: 'NODE' | 'EDGE' = 'NODE';

  gModel!: JsonModel<GModelElementSchema>;
  aModel!: JsonModel<AModelElementSchema>;

  gModelSelectedNodePath?: string;
  gModelSelectedNodePathSubscription?: Subscription;

  gModelSelectedNode?: any;
  gModelSelectedNodeSubscription?: Subscription;

  gModelSelectedNodeConfig?: any;
  gModelSelectedNodeConfigSubscription?: Subscription;

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
    this.aModel = new JsonModel(_.cloneDeep(this.element.aModel) as AModelElementSchema);
  }

  onGModelNodeChange(event: any): void {
    this.gModel.setNode(this.gModelSelectedNodePath!, event.newModel);
  }

  updateElement(): void {
    //TODO: update the element on database
  }
}
