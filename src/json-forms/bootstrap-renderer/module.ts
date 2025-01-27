import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { JsonFormsModule } from '@jsonforms/angular';

import {
  CheckboxControlRenderer,
  DateControlRenderer,
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
  imports: [
    CommonModule,
    JsonFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  declarations: [
    TextControlRenderer,
    TextAreaControlRenderer,
    NumberControlRenderer,
    RangeControlRenderer,
    CheckboxControlRenderer,
    SwitchControlRenderer,
    RadioControlRenderer,
    SelectControlRenderer,
    DateControlRenderer,
    ObjectControlRenderer,
    VerticalLayoutRenderer,
    HorizontalLayoutRenderer,
    GroupLayoutRenderer,
    CategorizationTabLayoutRenderer,
    LabelRenderer,
    LayoutChildrenRenderPropsPipe
  ],
  exports: [
    CommonModule,
    JsonFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: []
})
export class JsonFormsBootstrapModule {}
