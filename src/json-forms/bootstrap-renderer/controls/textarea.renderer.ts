import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, isMultiLineControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'TextAreaControlRenderer',
  template: `
    <div class="row w-100 ps-2" [style.display]="hidden ? 'none' : ''">
      <label class="form-label col-form-label-sm col-auto">{{ label }}</label>
      <div class="col-auto">
        <textarea
          class="form-control form-control-sm"
          rows="3"
          [id]="id"
          [formControl]="form"
          (input)="onChange($event)"
          (focus)="focused = true"
          (focusout)="focused = false"
        ></textarea>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaControlRenderer extends JsonFormsControl {
  focused = false;

  constructor(jsonformsService: JsonFormsAngularService) {
    super(jsonformsService);
  }

  override getEventValue = (event: any) => event.target.value || undefined;
}
export const TextAreaControlRendererTester: RankedTester = rankWith(2, isMultiLineControl);
