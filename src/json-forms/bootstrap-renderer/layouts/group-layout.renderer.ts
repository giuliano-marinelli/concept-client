import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService } from '@jsonforms/angular';
import { GroupLayout, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';

import { LayoutRenderer } from './layout.renderer';

@Component({
  selector: 'GroupLayoutRenderer',
  template: `
    <div class="card mx-1 mb-3" [style.display]="hidden ? 'none' : ''">
      <div class="card-body px-2 pb-2 pt-1" [class.pt-3]="!label">
        <label class="card-title ps-1 py-1" *ngIf="label">{{ label }}</label>
        <div *ngFor="let props of uischema | layoutChildrenRenderProps: schema : path; trackBy: trackElement">
          <jsonforms-outlet [renderProps]="props"></jsonforms-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .group-layout {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
      .group-layout > div {
        flex: 1 1 auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupLayoutRenderer extends LayoutRenderer<GroupLayout> {
  constructor(jsonFormsService: JsonFormsAngularService, changeDetectionRef: ChangeDetectorRef) {
    super(jsonFormsService, changeDetectionRef);
  }
}
export const GroupLayoutTester: RankedTester = rankWith(1, uiTypeIs('Group'));
