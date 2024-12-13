import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewRef } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isBooleanControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'BooleanControlRenderer',
  template: `
    <div class="ps-2" [style.display]="hidden ? 'none' : ''">
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          [id]="id"
          [disabled]="!isEnabled()"
          [checked]="isChecked()"
          (change)="onChange($event)"
        />
        <label class="form-check-label" [for]="id">{{ label }}</label>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooleanControlRenderer extends JsonFormsControl {
  constructor(
    jsonformsService: JsonFormsAngularService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    super(jsonformsService);
  }

  isChecked = () => this.data || false;

  override getEventValue = (event: any) => event.target.checked;

  override mapAdditionalProps() {
    if (!(this.changeDetectionRef as ViewRef).destroyed) {
      this.changeDetectionRef.markForCheck();
    }
  }
}

export const BooleanControlTester: RankedTester = rankWith(2, isBooleanControl);
