import { ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform } from '@angular/core';

import { JsonFormsAngularService, JsonFormsBaseRenderer } from '@jsonforms/angular';
import {
  JsonFormsState,
  JsonSchema,
  Layout,
  OwnPropsOfRenderer,
  UISchemaElement,
  mapStateToLayoutProps
} from '@jsonforms/core';

@Component({
  template: ''
})
export class LayoutRenderer<T extends Layout> extends JsonFormsBaseRenderer<T> implements OnInit {
  hidden: boolean = false;
  label: string | undefined;

  constructor(
    private jsonFormsService: JsonFormsAngularService,
    protected changeDetectionRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.jsonFormsService.$state.subscribe({
        next: (state: JsonFormsState) => {
          const props = mapStateToLayoutProps(state, this.getOwnProps());
          this.label = props.label;
          this.hidden = !props.visible;
          this.changeDetectionRef.markForCheck();
        }
      })
    );
  }

  trackElement(_index: number, renderProp: OwnPropsOfRenderer): string | null {
    return renderProp ? renderProp.path + JSON.stringify(renderProp.uischema) : null;
  }
}

@Pipe({ name: 'layoutChildrenRenderProps' })
export class LayoutChildrenRenderPropsPipe implements PipeTransform {
  transform(uischema: Layout, schema: JsonSchema, path: string): OwnPropsOfRenderer[] {
    const elements = (uischema.elements || []).map((el: UISchemaElement) => ({
      uischema: el,
      schema: schema,
      path: path
    }));
    return elements;
  }
}
