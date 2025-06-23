import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsControl } from '@jsonforms/angular';
import { RankedTester, rankWith } from '@jsonforms/core';

import { isConditionControl } from '../testers';

@Component({
  selector: 'ConditionControlRenderer',
  template: `
    <div class="card mb-1" [style.display]="hidden ? 'none' : ''" [class.bg-body-secondary]="!this.isEnabled()">
      <div class="card-body px-2 pb-1 pt-1">
        <!-- <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="card-title ps-1 mb-0 text-muted small">{{ label }}</label>
          <button class="btn btn-sm p-0 text-body no-outline" (click)="this.isEnabled() && add()">
            <fa-icon [icon]="'plus'"></fa-icon>
          </button>
        </div>
        <div
          class="card mb-1"
          [class.bg-body-secondary]="!this.isEnabled()"
          *ngFor="let item of [].constructor(data); let idx = index; trackBy: trackByFn; last as last; first as first"
        >
          <div class="card-body px-2 pb-1 pt-2">
            <div class="d-flex align-items-start">
              <div class="d-flex flex-column align-items-center">
                <button
                  class="btn btn-sm p-0 pe-2 text-body no-outline"
                  (click)="this.isEnabled() && up(idx)"
                  [disabled]="first"
                >
                  <fa-icon [icon]="'arrow-up'"></fa-icon>
                </button>
                <button
                  class="btn btn-sm p-0 pe-2 text-body no-outline"
                  (click)="this.isEnabled() && down(idx)"
                  [disabled]="last"
                >
                  <fa-icon [icon]="'arrow-down'"></fa-icon>
                </button>
              </div>
              <div class="flex-grow-1 small">
                <jsonforms-outlet [renderProps]="getProps(idx)"></jsonforms-outlet>
              </div>
              <button class="btn btn-sm p-0 ps-2 text-body no-outline" (click)="this.isEnabled() && remove(idx)">
                <fa-icon [icon]="'xmark'"></fa-icon>
              </button>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ConditionControlRenderer extends JsonFormsControl {
  override getEventValue = (event: any) => {
    return event.target.value;
  };
}
export const ConditionControlRendererTester: RankedTester = rankWith(2, isConditionControl);
