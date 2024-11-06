import { Component, EventEmitter, Input, Output } from '@angular/core';

import { angularMaterialRenderers } from '@jsonforms/angular-material';

@Component({
  selector: '[json-forms-renderer]',
  templateUrl: './json-forms-renderer.component.html',
  styleUrls: ['./json-forms-renderer.component.scss']
})
export class JsonFormsRendererComponent {
  @Input() elementId: string = '';
  @Input() data: any;
  @Input() schema: any;
  @Input() uiSchema: any;
  @Output() dataChange = new EventEmitter<any>();

  renderers = [...angularMaterialRenderers];

  onDataChange(event: any) {
    this.dataChange.emit({ elementId: this.elementId, newModel: event });
  }
}
