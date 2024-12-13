import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import {
  JsonFormsState,
  RankedTester,
  StatePropsOfControl,
  defaultDateFormat,
  isDateControl,
  rankWith
} from '@jsonforms/core';

import { MyFormat } from '../utils/date-format';
import { DayJsDateAdapter } from '../utils/dayjs-date-adapter';

@Component({
  selector: 'DateControlRenderer',
  template: `
    <div class="row w-100 ps-2" [style.display]="hidden ? 'none' : ''">
      <label class="form-label col-form-label-sm col-auto">{{ label }}</label>
      <div class="col-auto">
        <input
          type="datetime-local"
          class="form-control form-control-sm"
          (dateChange)="onChange($event)"
          [id]="id"
          [formControl]="form"
          (focus)="focused = true"
          (focusout)="focused = false"
        />
      </div>
    </div>
  `,
  styles: [``],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DateAdapter,
      useClass: DayJsDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useClass: MyFormat
    }
  ]
})
export class DateControlRenderer extends JsonFormsControl {
  focused = false;
  views: string[] = [];
  startView = '';
  panelClass = '';

  constructor(
    jsonformsService: JsonFormsAngularService,
    @Inject(MAT_DATE_FORMATS) private dateFormat: MyFormat,
    @Inject(DateAdapter) private dateAdapter: DayJsDateAdapter
  ) {
    super(jsonformsService);
  }

  override getEventValue = (event: any) => {
    const value = event.value ? event.value : event;
    return this.dateAdapter.toSaveFormat(value);
  };

  override mapToProps(state: JsonFormsState): StatePropsOfControl {
    const props = super.mapToProps(state);
    const saveFormat = this.uischema?.options?.['dateSaveFormat']
      ? this.uischema.options['dateSaveFormat']
      : defaultDateFormat;
    this.views = this.uischema?.options?.['views'] ? this.uischema.options['views'] : ['year', 'month', 'day'];
    this.setViewProperties();

    const dateFormat = this.uischema?.options?.['dateFormat'];

    if (dateFormat) {
      this.dateFormat.setDisplayFormat(dateFormat);
    }

    this.dateAdapter.setSaveFormat(saveFormat);
    if (this.jsonFormsService.getLocale()) {
      this.dateAdapter.setLocale(this.jsonFormsService.getLocale());
    }
    const date = this.dateAdapter.parseSaveFormat(props.data);
    return { ...props, data: date };
  }

  yearSelected($event: any, datepicker: MatDatepicker<DayJsDateAdapter>) {
    if (!this.views.includes('day') && !this.views.includes('month')) {
      this.onChange($event);
      datepicker.close();
    }
  }

  monthSelected($event: any, datepicker: MatDatepicker<DayJsDateAdapter>) {
    if (!this.views.includes('day')) {
      this.onChange($event);
      datepicker.close();
    }
  }

  setViewProperties() {
    if (!this.views.includes('day')) {
      this.startView = 'multi-year';
      this.panelClass = 'no-panel-navigation';
    } else {
      this.startView = 'month';
    }
  }
}

export const DateControlRendererTester: RankedTester = rankWith(2, isDateControl);
