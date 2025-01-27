import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { Actions, RankedTester, and, isEnumControl, isOneOfEnumControl, optionIs, or, rankWith } from '@jsonforms/core';

import { SelectControlRenderer } from './select.renderer';

@Component({
  selector: 'RadioControlRenderer',
  template: `
    <div class="mx-1" [style.display]="hidden ? 'none' : ''">
      <label class="form-label mb-0 text-muted small">{{ label }}</label>
      <div>
        <div class="form-check form-check-inline" *ngFor="let option of options">
          <input
            class="form-check-input"
            type="radio"
            [id]="getOptionId(option)"
            [formControl]="form"
            [name]="id"
            [value]="option.const"
            [checked]="option.const === data"
            [class.is-invalid]="error"
            (change)="onChange($event, option.const)"
          />
          <label class="form-check-label" [for]="getOptionId(option)">{{ option.title }}</label>
        </div>
        <div *ngIf="error" class="invalid-feedback">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioControlRenderer extends SelectControlRenderer {
  getOptionId = (option: any) => this.id + '-' + String(option.const).replace(/\s/g, '-');

  override onChange(ev: any, value?: string | number | boolean) {
    this.jsonFormsService.updateCore(Actions.update(this.propsPath, () => this.getEventValue(ev, value)));
    this.triggerValidation();
  }

  override getEventValue = (event: any, value?: string | number | boolean) => {
    if (this.scopedSchema.type === 'boolean') return value === 'true';
    if (this.scopedSchema.type === 'number') return Number(value);

    return String(value);
  };
}

export const RadioControlTester: RankedTester = rankWith(
  4,
  and(or(isEnumControl, isOneOfEnumControl), optionIs('format', 'radio'))
);
