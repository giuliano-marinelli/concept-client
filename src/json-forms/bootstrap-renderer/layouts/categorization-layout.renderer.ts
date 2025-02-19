import { Component, OnInit } from '@angular/core';

import { JsonFormsAngularService, JsonFormsBaseRenderer } from '@jsonforms/angular';
import {
  Categorization,
  Category,
  JsonFormsState,
  Labelable,
  RankedTester,
  and,
  categorizationHasCategory,
  defaultJsonFormsI18nState,
  deriveLabelForUISchemaElement,
  getAjv,
  isVisible,
  mapStateToLayoutProps,
  rankWith,
  uiTypeIs
} from '@jsonforms/core';

@Component({
  selector: 'CategorizationLayoutRenderer',
  template: `
    <div class="row" [style.display]="hidden ? 'none' : ''">
      <ul class="nav nav-tabs">
        <li
          class="nav-item"
          *ngFor="let category of visibleCategories; let i = index"
          [class.active]="i == activeCategory"
          (click)="activeCategory = i"
        >
          <a class="nav-link active">{{ categoryLabels[i] }}</a>
        </li>
      </ul>
      <div class="tab-content">
        <div
          class="tab-pane"
          *ngFor="let category of visibleCategories; let i = index"
          [class.active]="i == activeCategory"
        >
          <div *ngFor="let element of category.elements">
            <jsonforms-outlet [uischema]="element" [path]="path" [schema]="schema"></jsonforms-outlet>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategorizationTabLayoutRenderer extends JsonFormsBaseRenderer<Categorization> implements OnInit {
  hidden!: boolean;
  visibleCategories!: (Category | Categorization)[];
  categoryLabels!: (string | undefined)[];
  activeCategory: number = 0;

  constructor(private jsonFormsService: JsonFormsAngularService) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.jsonFormsService.$state.subscribe({
        next: (state: JsonFormsState) => {
          const props = mapStateToLayoutProps(state, this.getOwnProps());
          this.hidden = !props.visible;
          this.visibleCategories = this.uischema.elements.filter((category: Category | Categorization) =>
            isVisible(category, props.data, '', getAjv(state))
          );
          this.categoryLabels = this.visibleCategories.map((element) =>
            deriveLabelForUISchemaElement(
              element as Labelable<boolean>,
              state.jsonforms.i18n?.translate ?? defaultJsonFormsI18nState.translate
            )
          )!;
        }
      })
    );
  }
}

export const CategorizationTester: RankedTester = rankWith(
  2,
  and(uiTypeIs('Categorization'), categorizationHasCategory)
);
