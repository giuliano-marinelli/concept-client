import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, StatePropsOfControl, isEnumControl, isOneOfEnumControl, or, rankWith } from '@jsonforms/core';

@Component({
  selector: 'SelectControlRenderer',
  template: `
    <div class="form-floating mb-1" [style.display]="hidden ? 'none' : ''">
      <select class="form-select" [id]="id" [formControl]="form" (change)="onChange($event)">
        <option *ngFor="let option of options" [value]="option.const" [selected]="option.const === data">
          {{ option.title }}
        </option>
      </select>
      <label [for]="id">{{ label }}</label>
      <div *ngIf="error" class="invalid-feedback">{{ error }}</div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectControlRenderer extends JsonFormsControl {
  options!: { const: string | number | boolean; title: string | number | boolean }[];

  override getEventValue = (event: any) => {
    if (this.scopedSchema.type === 'boolean') return event.target.value === 'true';
    if (this.scopedSchema.type === 'number') return Number(event.target.value);
    return event.target.value;
  };

  override mapAdditionalProps(props: StatePropsOfControl) {
    this.options = props.schema.oneOf
      ? (props.schema.oneOf as { const: string | number | boolean; title: string | number | boolean }[])
      : props.schema.enum?.map((option: string | number | boolean) => ({
          const: option,
          title: option
        })) ?? [];
  }
}

export const SelectControlTester: RankedTester = rankWith(3, or(isEnumControl, isOneOfEnumControl));
