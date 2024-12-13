import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, and, isBooleanControl, optionIs, rankWith } from '@jsonforms/core';

@Component({
  selector: 'ToggleControlRenderer',
  template: `
    <div class="ps-2" [style.display]="hidden ? 'none' : ''">
      <div class="form-check form-switch">
        <input
          type="checkbox"
          class="form-check-input"
          role="switch"
          [id]="id"
          [disabled]="!isEnabled()"
          [checked]="isChecked()"
          (change)="onChange($event)"
        />
        <label class="form-check-label" [for]="id">{{ label }}</label>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleControlRenderer extends JsonFormsControl {
  constructor(
    jsonformsService: JsonFormsAngularService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(jsonformsService);
  }

  isChecked = () => this.data || false;

  override getEventValue = (event: any) => event.target.checked;

  override mapAdditionalProps() {
    this.changeDetectorRef.markForCheck();
  }
}

export const ToggleControlRendererTester: RankedTester = rankWith(3, and(isBooleanControl, optionIs('toggle', true)));
