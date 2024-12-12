import {
  ArrayLayoutRenderer,
  ArrayLayoutRendererTester,
  AutocompleteControlRenderer,
  BooleanControlRenderer,
  CategorizationTabLayoutRenderer,
  DateControlRenderer,
  DateControlRendererTester,
  HorizontalLayoutRenderer,
  LabelRenderer,
  LabelRendererTester,
  MasterListComponent,
  RangeControlRenderer,
  RangeControlRendererTester,
  TableRenderer,
  TableRendererTester,
  TextAreaRenderer,
  TextAreaRendererTester,
  ToggleControlRenderer,
  ToggleControlRendererTester,
  VerticalLayoutRenderer,
  booleanControlTester,
  categorizationTester,
  enumControlTester,
  horizontalLayoutTester,
  masterDetailTester,
  verticalLayoutTester
} from '@jsonforms/angular-material';
import { RankedTester } from '@jsonforms/core';

import 'hammerjs';

import {
  NumberControlRenderer,
  NumberControlRendererTester,
  ObjectControlRenderer,
  ObjectControlRendererTester
} from './controls';
import { TextControlRenderer, TextControlRendererTester } from './controls/text.renderer';
import { GroupLayoutRenderer, groupLayoutTester } from './layouts';

export * from './controls';
// export * from './layouts';

export const bootstrapRenderers: {
  tester: RankedTester;
  renderer: any;
}[] = [
  // controls
  { tester: booleanControlTester, renderer: BooleanControlRenderer },
  { tester: TextControlRendererTester, renderer: TextControlRenderer },
  { tester: TextAreaRendererTester, renderer: TextAreaRenderer },
  { tester: NumberControlRendererTester, renderer: NumberControlRenderer },
  { tester: RangeControlRendererTester, renderer: RangeControlRenderer },
  { tester: DateControlRendererTester, renderer: DateControlRenderer },
  { tester: ToggleControlRendererTester, renderer: ToggleControlRenderer },
  { tester: enumControlTester, renderer: AutocompleteControlRenderer },
  { tester: ObjectControlRendererTester, renderer: ObjectControlRenderer },
  // layouts
  { tester: verticalLayoutTester, renderer: VerticalLayoutRenderer },
  { tester: groupLayoutTester, renderer: GroupLayoutRenderer },
  { tester: horizontalLayoutTester, renderer: HorizontalLayoutRenderer },
  { tester: categorizationTester, renderer: CategorizationTabLayoutRenderer },
  { tester: LabelRendererTester, renderer: LabelRenderer },
  { tester: ArrayLayoutRendererTester, renderer: ArrayLayoutRenderer },
  // other
  { tester: masterDetailTester, renderer: MasterListComponent },
  { tester: TableRendererTester, renderer: TableRenderer }
];
