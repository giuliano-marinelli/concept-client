import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { JsonFormsAbstractControl, JsonFormsAngularService } from '@jsonforms/angular';
import {
  ArrayLayoutProps,
  ArrayTranslations,
  JsonFormsState,
  OwnPropsOfRenderer,
  Paths,
  RankedTester,
  Scopable,
  StatePropsOfArrayLayout,
  UISchemaElement,
  UISchemaTester,
  arrayDefaultTranslations,
  createDefaultValue,
  defaultJsonFormsI18nState,
  findUISchema,
  getArrayTranslations,
  isObjectArray,
  isObjectArrayWithNesting,
  isPrimitiveArrayControl,
  mapDispatchToArrayControlProps,
  mapStateToArrayLayoutProps,
  or,
  rankWith,
  setReadonly,
  unsetReadonly
} from '@jsonforms/core';

@Component({
  selector: 'ArrayControlRenderer',
  template: `
    <div class="card mb-1" [style.display]="hidden ? 'none' : ''" [class.bg-body-secondary]="!this.isEnabled()">
      <div class="card-body px-2 pb-1 pt-1">
        <div class="d-flex justify-content-between align-items-center mb-1">
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
        </div>
        <div *ngIf="noData">
          <p class="text-muted small text-center">
            This list is empty. Use <fa-icon [icon]="'plus'"></fa-icon> button for add items.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ArrayControlRenderer extends JsonFormsAbstractControl<StatePropsOfArrayLayout> implements OnInit {
  noData!: boolean;
  translations: ArrayTranslations = {};
  addItem!: (path: string, value: any) => () => void;
  moveItemUp!: (path: string, index: number) => () => void;
  moveItemDown!: (path: string, index: number) => () => void;
  removeItems!: (path: string, toDelete: number[]) => () => void;
  uischemas!: {
    tester: UISchemaTester;
    uischema: UISchemaElement;
  }[];

  constructor(jsonFormsService: JsonFormsAngularService) {
    super(jsonFormsService);
  }

  mapToProps(state: JsonFormsState): StatePropsOfArrayLayout & { translations: ArrayTranslations } {
    const props = mapStateToArrayLayoutProps(state, this.getOwnProps());
    const t = state.jsonforms.i18n?.translate ?? defaultJsonFormsI18nState.translate;
    const translations = getArrayTranslations(t, arrayDefaultTranslations, props.i18nKeyPrefix!, props.label);
    return { ...props, translations };
  }

  remove(index: number): void {
    this.removeItems(this.propsPath, [index])();
  }

  add(): void {
    this.addItem(this.propsPath, createDefaultValue(this.scopedSchema, this.rootSchema))();
  }

  up(index: number): void {
    this.moveItemUp(this.propsPath, index)();
  }

  down(index: number): void {
    this.moveItemDown(this.propsPath, index)();
  }

  getProps(index: number): OwnPropsOfRenderer {
    const uischema = findUISchema(
      this.uischemas,
      this.scopedSchema,
      this.uischema.scope,
      this.propsPath,
      undefined,
      this.uischema,
      this.rootSchema
    );

    if (this.isEnabled()) {
      unsetReadonly(uischema);
    } else {
      setReadonly(uischema);
    }

    // this allow array items to be primitive types
    if (uischema.type === 'Control') {
      (uischema as Scopable).scope = '#';
    }

    return {
      schema: this.scopedSchema,
      path: Paths.compose(this.propsPath, `${index}`),
      uischema
    };
  }

  trackByFn(index: number) {
    return index;
  }

  override ngOnInit() {
    super.ngOnInit();
    const { addItem, removeItems, moveUp, moveDown } = mapDispatchToArrayControlProps(
      this.jsonFormsService.updateCore.bind(this.jsonFormsService)
    );
    this.addItem = addItem;
    this.moveItemUp = moveUp!;
    this.moveItemDown = moveDown!;
    this.removeItems = removeItems!;
  }

  override mapAdditionalProps(props: ArrayLayoutProps & { translations: ArrayTranslations }) {
    this.noData = !props.data || props.data === 0;
    this.uischemas = props.uischemas!;
    this.translations = props.translations;
  }
}

export const ArrayControlRendererTester: RankedTester = rankWith(
  2,
  or(isObjectArray, isObjectArrayWithNesting, isPrimitiveArrayControl)
);
