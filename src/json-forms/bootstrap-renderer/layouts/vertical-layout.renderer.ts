import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService } from '@jsonforms/angular';
import { RankedTester, VerticalLayout, rankWith, uiTypeIs } from '@jsonforms/core';

import { LayoutRenderer } from './layout.renderer';

@Component({
  selector: 'VerticalLayoutRenderer',
  template: `
    <div class="d-flex flex-column pt-0" [style.display]="hidden ? 'none' : ''">
      <div *ngFor="let props of uischema | layoutChildrenRenderProps: schema : path; trackBy: trackElement">
        <jsonforms-outlet [renderProps]="props"></jsonforms-outlet>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalLayoutRenderer extends LayoutRenderer<VerticalLayout> {
  constructor(jsonFormsService: JsonFormsAngularService, changeDetectionRef: ChangeDetectorRef) {
    super(jsonFormsService, changeDetectionRef);
  }
}
export const VerticalLayoutTester: RankedTester = rankWith(1, uiTypeIs('VerticalLayout'));
