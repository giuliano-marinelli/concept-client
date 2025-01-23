import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GModelElementSchema } from '@eclipse-glsp/protocol';
import { Layout } from '@jsonforms/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MetaElement } from '../../entities/meta-element.entity';
import { AModelConfig, GModelConfig, GModelContext, Global } from '../../global/global';
import { read } from 'fs';
import _ from 'lodash';

import { AModelElementSchema, AModelRootSchema } from '../../../../dynamic-glsp/protocol/amodel';

@Component({
  selector: 'language-editor',
  templateUrl: './language-editor.component.html',
  styleUrl: './language-editor.component.scss'
})
export class LanguageEditorComponent implements OnInit {
  @Input() element!: MetaElement;
  @Input() type: 'NODE' | 'EDGE' = 'NODE';

  gModelUtils = Global.GModelUtils;

  gModelConfig: GModelConfig = {
    nodes: {
      node: {
        icon: 'circle',
        children: true,
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
        children: true,
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
        children: false,
        schema: {
          properties: {
            type: { type: 'string', readOnly: true },
            text: { type: 'string' }
          }
        } as any,
        uiSchema: {
          type: 'VerticalLayout',
          elements: [
            { type: 'Control', scope: '#/properties/type' },
            { type: 'Control', scope: '#/properties/text' }
          ]
        } as any
      },
      comp: {
        icon: 'box-open',
        children: true,
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
      }
    },
    structures: {
      decision: {
        icon: 'arrows-turn-to-dots',
        fields: ['then', 'else'],
        schema: {
          properties: {
            type: { type: 'string', readOnly: true },
            condition: {
              type: 'object',
              properties: {
                eq: {
                  type: 'object',
                  properties: {
                    left: { type: 'string' },
                    right: { type: 'string' }
                  }
                }
              }
            }
          }
        } as any,
        uiSchema: {
          type: 'VerticalLayout',
          elements: [
            { type: 'Control', scope: '#/properties/type' },
            {
              type: 'Group',
              label: 'Condition',
              elements: [
                { type: 'Control', scope: '#/properties/condition/properties/eq/properties/left' },
                { type: 'Control', scope: '#/properties/condition/properties/eq/properties/right' }
              ]
            }
          ]
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
  };

  gModelContext!: GModelContext;

  gModelSelectedNode!: GModelElementSchema;

  aModel!: AModelRootSchema;

  aModelConfig: AModelConfig = {
    uiSchema: {
      type: 'VerticalLayout',
      elements: [{ type: 'Control', scope: '#/properties/properties' }]
    } as any
  };

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

    // set context with a gModel clone and config
    this.gModelContext = { gModel: _.cloneDeep(this.element.gModel)!, config: this.gModelConfig };

    // set aModel with a clone
    this.aModel = _.cloneDeep(this.element.aModel)!;

    console.log(this.gModelContext);

    console.log(this.aModel);
  }

  updateElement(): void {}

  onSelectedGModelNodeChange(path: string): void {
    this.gModelSelectedNode = this.gModelUtils.getNodeByPath(this.gModelContext, path);
  }
}
