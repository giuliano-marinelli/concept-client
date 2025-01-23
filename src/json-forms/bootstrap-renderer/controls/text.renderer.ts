import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isStringControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'TextControlRenderer',
  template: `
    <div class="row w-100 ps-2" [style.display]="hidden ? 'none' : ''">
      <label class="form-label col-form-label-sm col-auto">{{ label }}</label>
      <div class="col">
        <input
          class="form-control form-control-sm"
          type="text"
          [id]="id"
          [formControl]="form"
          [type]="getType()"
          [readonly]="disabled"
          (input)="onChange($event)"
          (focus)="focused = true"
          (focusout)="focused = false"
        />
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextControlRenderer extends JsonFormsControl implements OnInit {
  focused = false;

  constructor(jsonformsService: JsonFormsAngularService) {
    super(jsonformsService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('Text Props', this.getOwnProps());
  }

  override getEventValue = (event: any) => event.target.value || undefined;

  getType(): string {
    if (this.uischema.options && this.uischema.options['format']) {
      return this.uischema.options['format'];
    }

    if (this.scopedSchema && this.scopedSchema.format) {
      switch (this.scopedSchema.format) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        default:
          return 'text';
      }
    }
    return 'text';
  }
}
export const TextControlRendererTester: RankedTester = rankWith(1, isStringControl);
