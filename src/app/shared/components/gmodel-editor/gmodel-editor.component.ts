import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

import { GModelElementSchema } from '@eclipse-glsp/protocol';

import { GModelElementConfig } from '../../global/global';

import { JsonFormsRendererComponent } from '../json-forms-renderer/json-forms-renderer.component';

@Component({
  selector: 'gmodel-editor',
  templateUrl: './gmodel-editor.component.html',
  styleUrl: './gmodel-editor.component.scss'
})
export class GModelEditorComponent implements OnInit, OnChanges {
  @Input() gModel?: GModelElementSchema;
  @Input() gModelConfig?: GModelElementConfig;

  @Output() gModelChange = new EventEmitter<GModelElementSchema>();

  @ViewChild('renderer') renderer!: JsonFormsRendererComponent;

  ngOnInit(): void {
    // if (!this.gModel) this.gModel = { type: 'NODE' } as GModelElementSchema;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gModel']) {
      // this.renderer
    }
  }
}
