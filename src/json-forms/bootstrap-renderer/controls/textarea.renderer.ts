import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isMultiLineControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'TextAreaControlRenderer',
  template: `
    <div class="form-floating mb-1" [style.display]="hidden ? 'none' : ''">
      <textarea
        class="form-control"
        [id]="id"
        [formControl]="form"
        [class.is-invalid]="error"
        [ngStyle]="{ height: '100px' }"
        (input)="onChange($event)"
      ></textarea>
      <label [for]="id">{{ label }}</label>
      <div *ngIf="error" class="invalid-feedback">{{ error }}</div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaControlRenderer extends JsonFormsControl {
  override getEventValue = (event: any) => event.target.value || undefined;
}
export const TextAreaControlRendererTester: RankedTester = rankWith(2, isMultiLineControl);
