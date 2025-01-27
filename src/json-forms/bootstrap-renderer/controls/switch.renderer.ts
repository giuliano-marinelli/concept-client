import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsAngularService } from '@jsonforms/angular';
import { RankedTester, and, isBooleanControl, optionIs, rankWith } from '@jsonforms/core';

import { CheckboxControlRenderer } from './checkbox.renderer';

@Component({
  selector: 'SwitchControlRenderer',
  template: `
    <div class="ps-1" [style.display]="hidden ? 'none' : ''">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchControlRenderer extends CheckboxControlRenderer {}

export const SwitchControlRendererTester: RankedTester = rankWith(3, and(isBooleanControl, optionIs('toggle', true)));
