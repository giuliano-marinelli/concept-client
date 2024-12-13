import { Component, OnInit } from '@angular/core';

import { JsonFormsAngularService, JsonFormsBaseRenderer } from '@jsonforms/angular';
import {
  JsonFormsState,
  LabelElement,
  OwnPropsOfLabel,
  RankedTester,
  mapStateToLabelProps,
  rankWith,
  uiTypeIs
} from '@jsonforms/core';

@Component({
  selector: 'LabelRenderer',
  template: `<label class="form-label col-form-label-sm col-auto">{{ label }}</label>`,
  styles: [``]
})
export class LabelRenderer extends JsonFormsBaseRenderer<LabelElement> implements OnInit {
  label!: string;
  visible!: boolean;

  constructor(private jsonFormsService: JsonFormsAngularService) {
    super();
  }
  ngOnInit() {
    this.addSubscription(
      this.jsonFormsService.$state.subscribe({
        next: (state: JsonFormsState) => {
          const props = mapStateToLabelProps(state, this.getOwnProps() as OwnPropsOfLabel);
          this.visible = props.visible;
          this.label = props.text;
        }
      })
    );
  }
}

export const LabelRendererTester: RankedTester = rankWith(4, uiTypeIs('Label'));
