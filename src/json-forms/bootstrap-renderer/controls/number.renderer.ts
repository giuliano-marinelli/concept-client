import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, StatePropsOfControl, isIntegerControl, isNumberControl, or, rankWith } from '@jsonforms/core';

import merge from 'lodash/merge';

@Component({
  selector: 'NumberControlRenderer',
  template: `
    <div class="form-floating mb-1" [style.display]="hidden ? 'none' : ''">
      <input
        class="form-control form-control-sm"
        type="number"
        [id]="id"
        [formControl]="form"
        [min]="min"
        [max]="max"
        [step]="step"
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
export class NumberControlRenderer extends JsonFormsControl {
  min!: number;
  max!: number;
  default: number = 0;
  step!: number;

  constructor(
    jsonformsService: JsonFormsAngularService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    super(jsonformsService);
  }

  override getEventValue = (event: any) => Number(event.target.value) || this.default;

  override mapAdditionalProps(props: StatePropsOfControl) {
    this.min = this.scopedSchema?.minimum || 0;
    this.max = this.scopedSchema?.maximum || Number.MAX_VALUE;
    this.step = this.scopedSchema.type == 'integer' ? 1 : this.scopedSchema.multipleOf || 0.1;
    this.default = this.scopedSchema.default || this.min;
    this.data = this.data || this.default;

    this.changeDetectionRef.markForCheck();
  }
}
export const NumberControlRendererTester: RankedTester = rankWith(2, or(isNumberControl, isIntegerControl));
