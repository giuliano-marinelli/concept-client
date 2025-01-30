import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, StatePropsOfControl, isIntegerControl, isNumberControl, or, rankWith } from '@jsonforms/core';

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
  changeDetection: ChangeDetectionStrategy.Default
})
export class NumberControlRenderer extends JsonFormsControl {
  readonly MAXIMUM_FRACTIONAL_DIGITS = 20;

  min!: number;
  max!: number;
  default: number = 0;
  step!: number;

  locale!: string;
  numberFormat!: Intl.NumberFormat;
  decimalSeparator!: string;
  lastValue!: string;

  constructor(
    jsonformsService: JsonFormsAngularService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    super(jsonformsService);
  }

  override getEventValue = (event: any) => {
    const value = event.target.value;
    console.log('number event value', value);
    if (!isNaN(value)) {
      console.log('is a number');
      return Number(value);
    }
    return value;
  };

  // determineDecimalSeparator(): void {
  //   const example = this.numberFormat.format(1.1);
  //   this.decimalSeparator = example.charAt(1);
  // }

  // getValue = () => {
  //   if (this.data !== undefined && this.data !== null) {
  //     if (typeof this.data === 'number') {
  //       return this.numberFormat.format(this.data);
  //     }
  //     return this.data;
  //   }
  //   return '';
  // };

  // override onChange(ev: any) {
  //   const data = this.lastValue ? ev.target.value.replace(this.lastValue, '') : ev.target.value;

  //   // ignore these
  //   if (
  //     data === '.' ||
  //     data === ',' ||
  //     data === ' ' ||
  //     // if the value is 0 and we already have a value then we ignore
  //     (data === '0' &&
  //       this.getValue() !== '' &&
  //       // a 0 in the first place
  //       ((ev.target.selectionStart === 1 && ev.target.selectionEnd === 1) ||
  //         // or in the last place as this doesn't change the value (when there is a separator)
  //         (ev.target.selectionStart === ev.target.value.length &&
  //           ev.target.selectionEnd === ev.target.value.length &&
  //           ev.target.value.indexOf(this.decimalSeparator) !== -1)))
  //   ) {
  //     this.lastValue = ev.target.value;
  //     return;
  //   }

  //   console.log('number event value', ev.target.value);

  //   super.onChange(ev);

  //   this.lastValue = this.getValue();
  // }

  // override getEventValue = (event: any) => {
  //   const cleanPattern = new RegExp(`[^-+0-9${this.decimalSeparator}]`, 'g');
  //   const cleaned = event.target.value.replace(cleanPattern, '');
  //   const normalized = cleaned.replace(this.decimalSeparator, '.');

  //   if (normalized === '') {
  //     return undefined;
  //   }

  //   // convert to number
  //   const number = +normalized;

  //   // if not a number just return the string
  //   if (Number.isNaN(number)) {
  //     return event.target.value;
  //   }

  //   return number;
  // };

  override mapAdditionalProps(props: StatePropsOfControl) {
    this.min = this.scopedSchema?.minimum || 0;
    this.max = this.scopedSchema?.maximum || Number.MAX_VALUE;
    this.step = this.scopedSchema.type == 'integer' ? 1 : this.scopedSchema.multipleOf || 0.1;
    this.default = this.scopedSchema.default || this.min;
    this.data = this.data || this.default;

    // this is used for determining the decimal separator
    // this.locale = this.jsonFormsService.getLocale()!;
    // this.numberFormat = new Intl.NumberFormat(this.locale, {
    //   useGrouping: false,
    //   maximumFractionDigits: this.MAXIMUM_FRACTIONAL_DIGITS
    // });
    // this.determineDecimalSeparator();

    this.changeDetectionRef.markForCheck();
  }
}
export const NumberControlRendererTester: RankedTester = rankWith(2, or(isNumberControl, isIntegerControl));
