import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isStringControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'TextControlRenderer',
  template: `
    <div class="form-floating mb-1" [style.display]="hidden ? 'none' : ''">
      <input
        class="form-control"
        type="text"
        [id]="id"
        [formControl]="form"
        [type]="getType()"
        [class.is-invalid]="error"
        (input)="onChange($event)"
      />
      <label [for]="id">{{ label }}</label>
      <div *ngIf="error" class="invalid-feedback">{{ error }}</div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextControlRenderer extends JsonFormsControl {
  override getEventValue = (event: any) => event.target.value || undefined;

  getType(): string {
    if (this.uischema.options && this.uischema.options['format']) {
      return this.uischema.options['format'];
    }

    if (this.scopedSchema && this.scopedSchema.format) {
      switch (this.scopedSchema.format) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        default:
          return 'text';
      }
    }
    return 'text';
  }
}
export const TextControlRendererTester: RankedTester = rankWith(1, isStringControl);
