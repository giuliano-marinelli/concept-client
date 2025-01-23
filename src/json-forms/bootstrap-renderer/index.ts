import {
  MasterListComponent,
  TableRenderer,
  TableRendererTester,
  masterDetailTester
} from '@jsonforms/angular-material';
import { RankedTester } from '@jsonforms/core';

import 'hammerjs';

import {
  BooleanControlRenderer,
  BooleanControlTester,
  DateControlRenderer,
  DateControlRendererTester,
  NumberControlRenderer,
  NumberControlRendererTester,
  ObjectControlRenderer,
  ObjectControlRendererTester,
  RangeControlRenderer,
  RangeControlRendererTester,
  TextAreaControlRenderer,
  TextAreaControlRendererTester
} from './controls';
import { EnumControlRenderer, EnumControlTester } from './controls/enum.renderer';
import { TextControlRenderer, TextControlRendererTester } from './controls/text.renderer';
import { ToggleControlRenderer, ToggleControlRendererTester } from './controls/toggle.renderer';
import {
  GroupLayoutRenderer,
  GroupLayoutTester,
  HorizontalLayoutRenderer,
  HorizontalLayoutTester,
  LabelRenderer,
  LabelRendererTester,
  VerticalLayoutRenderer,
  VerticalLayoutTester
} from './layouts';
import { ArrayLayoutRenderer, ArrayLayoutRendererTester } from './layouts/array-layout.renderer';
import { CategorizationTabLayoutRenderer, CategorizationTester } from './layouts/categorization-layout.renderer';

export * from './controls';
export * from './layouts';

export const bootstrapRenderers: {
  tester: RankedTester;
  renderer: any;
}[] = [
  // controls
  { tester: BooleanControlTester, renderer: BooleanControlRenderer },
  { tester: TextControlRendererTester, renderer: TextControlRenderer },
  { tester: TextAreaControlRendererTester, renderer: TextAreaControlRenderer },
  { tester: NumberControlRendererTester, renderer: NumberControlRenderer },
  { tester: RangeControlRendererTester, renderer: RangeControlRenderer },
  { tester: DateControlRendererTester, renderer: DateControlRenderer },
  { tester: ToggleControlRendererTester, renderer: ToggleControlRenderer },
  { tester: ObjectControlRendererTester, renderer: ObjectControlRenderer },
  { tester: EnumControlTester, renderer: EnumControlRenderer },
  // layouts
  { tester: VerticalLayoutTester, renderer: VerticalLayoutRenderer },
  { tester: HorizontalLayoutTester, renderer: HorizontalLayoutRenderer },
  { tester: ArrayLayoutRendererTester, renderer: ArrayLayoutRenderer },
  { tester: GroupLayoutTester, renderer: GroupLayoutRenderer },
  { tester: CategorizationTester, renderer: CategorizationTabLayoutRenderer },
  { tester: LabelRendererTester, renderer: LabelRenderer }
  // other
  // { tester: TableRendererTester, renderer: TableRenderer }
  // { tester: masterDetailTester, renderer: MasterListComponent }
];
