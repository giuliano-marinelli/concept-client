import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService } from '@jsonforms/angular';
import { HorizontalLayout, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';

import { LayoutRenderer } from './layout.renderer';

@Component({
  selector: 'HorizontalLayoutRenderer',
  template: `
    <div class="d-flex flex-row gap-2 pt-1" [style.display]="hidden ? 'none' : ''">
      <div *ngFor="let props of uischema | layoutChildrenRenderProps: schema : path; trackBy: trackElement">
        <jsonforms-outlet [renderProps]="props"></jsonforms-outlet>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalLayoutRenderer extends LayoutRenderer<HorizontalLayout> {
  constructor(jsonFormsService: JsonFormsAngularService, changeDetectionRef: ChangeDetectorRef) {
    super(jsonFormsService, changeDetectionRef);
  }
}
export const HorizontalLayoutTester: RankedTester = rankWith(1, uiTypeIs('HorizontalLayout'));
