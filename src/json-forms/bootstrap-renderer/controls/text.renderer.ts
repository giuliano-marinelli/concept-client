import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isStringControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'TextControlRenderer',
  template: `
    <div class="form-floating mb-1" [style.display]="hidden ? 'none' : ''">
      <input
        class="form-control"
        type="text"
        [id]="id"
        [formControl]="form"
        [type]="getTypeByFormat()"
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
export class TextControlRenderer extends JsonFormsControl {
  basicFormats: string[] = ['text', 'email', 'date', 'time', 'url'];
  extraFormats: { [format: string]: string } = {
    'date-time': 'datetime-local',
    duration: 'text',
    uri: 'url',
    'uri-reference': 'url',
    'uri-template': 'url',
    hostname: 'text',
    ipv4: 'text',
    ipv6: 'text',
    uuid: 'text',
    regex: 'text'
  };

  getTypeByFormat(): string {
    const format = this.uischema?.options?.['format']
      ? this.uischema.options['format']
      : this.scopedSchema?.format ?? 'text';
    return this.basicFormats.includes(format) ? format : this.extraFormats[format] ?? 'text';
  }

  override getEventValue = (event: any) => {
    return event.target.value;
  };
}
export const TextControlRendererTester: RankedTester = rankWith(1, isStringControl);
