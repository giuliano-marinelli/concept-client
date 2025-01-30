import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FaConfig, FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { JsonFormsModule } from '@jsonforms/angular';

import {
  ArrayControlRenderer,
  CheckboxControlRenderer,
  NumberControlRenderer,
  ObjectControlRenderer,
  RadioControlRenderer,
  RangeControlRenderer,
  SwitchControlRenderer,
  TextAreaControlRenderer,
  TextControlRenderer
} from './controls';
import { SelectControlRenderer } from './controls/select.renderer';
import {
  CategorizationTabLayoutRenderer,
  GroupLayoutRenderer,
  HorizontalLayoutRenderer,
  LabelRenderer,
  LayoutChildrenRenderPropsPipe,
  VerticalLayoutRenderer
} from './layouts';

@NgModule({
  imports: [CommonModule, JsonFormsModule, ReactiveFormsModule, FontAwesomeModule],
  declarations: [
    TextControlRenderer,
    TextAreaControlRenderer,
    NumberControlRenderer,
    RangeControlRenderer,
    CheckboxControlRenderer,
    SwitchControlRenderer,
    SelectControlRenderer,
    RadioControlRenderer,
    ObjectControlRenderer,
    ArrayControlRenderer,
    VerticalLayoutRenderer,
    HorizontalLayoutRenderer,
    GroupLayoutRenderer,
    CategorizationTabLayoutRenderer,
    LabelRenderer,
    LayoutChildrenRenderPropsPipe
  ],
  exports: [CommonModule, JsonFormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: []
})
export class JsonFormsBootstrapModule {
  constructor(fontawesomeLibrary: FaIconLibrary, fontawesomeConfig: FaConfig) {
    fontawesomeLibrary.addIconPacks(far, fas, fab);
    fontawesomeConfig.defaultPrefix = 'fas';
    fontawesomeConfig.fixedWidth = true;
  }
}
