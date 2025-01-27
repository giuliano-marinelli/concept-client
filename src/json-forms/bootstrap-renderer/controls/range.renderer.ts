import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService } from '@jsonforms/angular';
import { RankedTester, StatePropsOfControl, isRangeControl, rankWith } from '@jsonforms/core';

import merge from 'lodash/merge';

import { NumberControlRenderer } from './number.renderer';

@Component({
  selector: 'RangeControlRenderer',
  template: `
    <div class="mx-1" [style.display]="hidden ? 'none' : ''">
      <label class="form-label mb-0 text-muted small">{{ label }}</label>
      <input
        class="form-range form-control-sm"
        type="range"
        [id]="id"
        [formControl]="form"
        [min]="min"
        [max]="max"
        [step]="step"
        [class.is-invalid]="error"
        (input)="onChange($event)"
      />
      <div class="d-flex justify-content-between small mb-1" [ngStyle]="{ marginTop: '-15px' }">
        <span>{{ min }}</span>
        <span>{{ data }}</span>
        <span>{{ max }}</span>
      </div>
      <div *ngIf="error" class="invalid-feedback">{{ error }}</div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeControlRenderer extends NumberControlRenderer {}

export const RangeControlRendererTester: RankedTester = rankWith(4, isRangeControl);
