import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { JsonFormsAngularService } from '@jsonforms/angular';
import { GroupLayout, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';

import { LayoutRenderer } from './layout.renderer';

@Component({
  selector: 'GroupLayoutRenderer',
  template: `
    <div class="card mb-1" [style.display]="hidden ? 'none' : ''">
      <div class="card-body px-2 pb-1 pt-{{ label ? 1 : 2 }}">
        <label class="card-title ps-1 text-muted small" *ngIf="label">{{ label }}</label>
        <div *ngFor="let props of uischema | layoutChildrenRenderProps: schema : path; trackBy: trackElement">
          <jsonforms-outlet [renderProps]="props"></jsonforms-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupLayoutRenderer extends LayoutRenderer<GroupLayout> {
  constructor(jsonFormsService: JsonFormsAngularService, changeDetectionRef: ChangeDetectorRef) {
    super(jsonFormsService, changeDetectionRef);
  }
}
export const GroupLayoutTester: RankedTester = rankWith(1, uiTypeIs('Group'));
