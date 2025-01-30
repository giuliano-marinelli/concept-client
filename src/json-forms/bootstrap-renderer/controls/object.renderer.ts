import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JsonFormsAngularService, JsonFormsControlWithDetail } from '@jsonforms/angular';
import {
  ControlWithDetailProps,
  Generate,
  GroupLayout,
  RankedTester,
  UISchemaElement,
  findUISchema,
  isObjectControl,
  rankWith,
  setReadonly
} from '@jsonforms/core';

import { cloneDeep } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';

@Component({
  selector: 'ObjectRenderer',
  template: `
    <div class="" [style.display]="hidden ? 'none' : ''">
      <jsonforms-outlet [uischema]="detailUiSchema" [schema]="scopedSchema" [path]="propsPath"></jsonforms-outlet>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ObjectControlRenderer extends JsonFormsControlWithDetail {
  detailUiSchema!: UISchemaElement;

  constructor(jsonformsService: JsonFormsAngularService) {
    super(jsonformsService);
  }

  override mapAdditionalProps(props: ControlWithDetailProps) {
    this.detailUiSchema = findUISchema(
      props.uischemas!,
      props.schema,
      props.uischema.scope,
      props.path,
      () => {
        const newSchema = cloneDeep(props.schema);
        // delete unsupported operators
        delete newSchema.oneOf;
        delete newSchema.anyOf;
        delete newSchema.allOf;
        return Generate.uiSchema(newSchema, 'Group', undefined, this.rootSchema);
      },
      props.uischema,
      props.rootSchema
    );

    if (isEmpty(props.path)) {
      this.detailUiSchema.type = 'VerticalLayout';
    } else {
      const propLabel = props.path.split('.').pop();
      (this.detailUiSchema as GroupLayout).label = startCase(propLabel);
    }

    if (!this.isEnabled()) {
      setReadonly(this.detailUiSchema);
    }
  }
}
export const ObjectControlRendererTester: RankedTester = rankWith(2, isObjectControl);
