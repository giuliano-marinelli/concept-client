import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isBooleanControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'CheckboxControlRenderer',
  template: `
    <div class="ps-1" [style.display]="hidden ? 'none' : ''">
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          [id]="id"
          [formControl]="form"
          [checked]="this.data || false"
          [class.is-invalid]="error"
          (change)="onChange($event)"
        />
        <label class="form-check-label text-muted small" [for]="id">{{ label }}</label>
        <div *ngIf="error" class="invalid-feedback">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CheckboxControlRenderer extends JsonFormsControl {
  override getEventValue = (event: any) => event.target.checked;
}

export const CheckboxControlTester: RankedTester = rankWith(2, isBooleanControl);
