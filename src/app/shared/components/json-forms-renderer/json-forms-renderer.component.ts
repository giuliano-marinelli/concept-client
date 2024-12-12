import { Component, EventEmitter, Input, Output } from '@angular/core';

import { angularMaterialRenderers } from '@jsonforms/angular-material';

import { bootstrapRenderers } from '../../../../json-forms/bootstrap-renderer';

@Component({
  selector: 'json-forms-renderer',
  templateUrl: './json-forms-renderer.component.html',
  styleUrl: './json-forms-renderer.component.scss'
})
export class JsonFormsRendererComponent {
  @Input() elementId: string = '';
  @Input() data: any;
  @Input() schema: any;
  @Input() uiSchema: any;
  @Output() dataChange = new EventEmitter<any>();

  renderers = [...bootstrapRenderers];

  onDataChange(event: any) {
    this.dataChange.emit({ elementId: this.elementId, newModel: event });
  }
}
