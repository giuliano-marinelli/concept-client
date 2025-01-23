import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { OwnPropsOfControl, RankedTester, isEnumControl, rankWith } from '@jsonforms/core';

@Component({
  selector: 'EnumControlRenderer',
  template: `
    <div class="ps-2" [style.display]="hidden ? 'none' : ''">
      <label class="form-label">{{ label }}</label>
      <div class="form-check form-check-inline" *ngFor="let option of options">
        <input
          type="radio"
          class="form-check-input"
          [id]="id"
          [disabled]="!isEnabled()"
          [readonly]="disabled"
          (change)="onChange($event)"
        />
        <label class="form-check-label" [for]="id">{{ label }}</label>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumControlRenderer extends JsonFormsControl implements OnInit {
  @Input() options!: string[];
  focused = false;

  constructor(jsonformsService: JsonFormsAngularService) {
    super(jsonformsService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('Enum Props', this.getOwnProps());
  }

  override getEventValue = (event: any) => event.target.value;

  override getOwnProps(): OwnPropsOfEnum {
    return {
      ...super.getOwnProps(),
      options: this.options
    };
  }
}

export const EnumControlTester: RankedTester = rankWith(2, isEnumControl);

interface OwnPropsOfEnum extends OwnPropsOfControl {
  options: string[];
}
