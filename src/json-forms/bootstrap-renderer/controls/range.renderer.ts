import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isRangeControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'RangeControlRenderer',
  template: `
    <div class="row w-100 ps-2" [style.display]="hidden ? 'none' : ''">
      <label class="form-label col-form-label-sm col-auto">{{ label }}</label>
      <div class="col-auto">
        <input
          type="range"
          class="form-range form-control-sm"
          [id]="id"
          [disabled]="!isEnabled()"
          [max]="max"
          [min]="min"
          [step]="multipleOf"
          [readonly]="disabled"
          (valueChange)="onChange($event)"
        />
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeControlRenderer extends JsonFormsControl {
  min!: number;
  max!: number;
  multipleOf!: number;
  focused = false;

  constructor(
    jsonformsService: JsonFormsAngularService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(jsonformsService);
  }
  override getEventValue = (event: number) => Number(event);

  override mapAdditionalProps() {
    if (this.scopedSchema) {
      this.min = this.scopedSchema.minimum!;
      this.max = this.scopedSchema.maximum!;
      this.multipleOf = this.scopedSchema.multipleOf || 1;
    }
    this.changeDetectorRef.markForCheck();
  }
}
export const RangeControlRendererTester: RankedTester = rankWith(4, isRangeControl);
