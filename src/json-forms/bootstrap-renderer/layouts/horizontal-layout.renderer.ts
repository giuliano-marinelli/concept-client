import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService } from '@jsonforms/angular';
import { HorizontalLayout, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';

import { LayoutRenderer } from './layout.renderer';

@Component({
  selector: 'HorizontalLayoutRenderer',
  template: `
    <div class="horizontal-layout" [style.display]="hidden ? 'none' : ''">
      <div *ngFor="let props of uischema | layoutChildrenRenderProps: schema : path; trackBy: trackElement">
        <jsonforms-outlet [renderProps]="props"></jsonforms-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .horizontal-layout {
        display: flex;
        gap: 16px;
        flex-flow: row wrap;
        align-items: flex-start;
        place-content: flex-start center;
      }
      .horizontal-layout > div {
        flex: 1 1 auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalLayoutRenderer extends LayoutRenderer<HorizontalLayout> {
  constructor(jsonFormsService: JsonFormsAngularService, changeDetectionRef: ChangeDetectorRef) {
    super(jsonFormsService, changeDetectionRef);
  }
}
export const HorizontalLayoutTester: RankedTester = rankWith(1, uiTypeIs('HorizontalLayout'));
