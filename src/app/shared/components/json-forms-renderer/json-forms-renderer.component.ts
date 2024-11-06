import { Component, Input } from '@angular/core';

import { angularMaterialRenderers } from '@jsonforms/angular-material';

@Component({
  selector: '[json-forms-renderer]',
  templateUrl: './json-forms-renderer.component.html',
  styleUrls: ['./json-forms-renderer.component.scss']
})
export class JsonFormsRendererComponent {
  @Input() uischema: any;

  @Input() schema: any;

  @Input() data: any;

  renderers = [...angularMaterialRenderers];
}
