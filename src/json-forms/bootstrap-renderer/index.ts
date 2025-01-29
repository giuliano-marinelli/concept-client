import {
  MasterListComponent,
  TableRenderer,
  TableRendererTester,
  masterDetailTester
} from '@jsonforms/angular-material';
import { RankedTester } from '@jsonforms/core';

import 'hammerjs';

import {
  CheckboxControlRenderer,
  CheckboxControlTester,
  NumberControlRenderer,
  NumberControlRendererTester,
  ObjectControlRenderer,
  ObjectControlRendererTester,
  RangeControlRenderer,
  RangeControlRendererTester,
  TextAreaControlRenderer,
  TextAreaControlRendererTester
} from './controls';
import { RadioControlRenderer, RadioControlTester } from './controls/radio.renderer';
import { SelectControlRenderer, SelectControlTester } from './controls/select.renderer';
import { SwitchControlRenderer, SwitchControlRendererTester } from './controls/switch.renderer';
import { TextControlRenderer, TextControlRendererTester } from './controls/text.renderer';
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
  { tester: TextControlRendererTester, renderer: TextControlRenderer },
  { tester: TextAreaControlRendererTester, renderer: TextAreaControlRenderer },
  { tester: NumberControlRendererTester, renderer: NumberControlRenderer },
  { tester: RangeControlRendererTester, renderer: RangeControlRenderer },
  { tester: CheckboxControlTester, renderer: CheckboxControlRenderer },
  { tester: SwitchControlRendererTester, renderer: SwitchControlRenderer },
  { tester: SelectControlTester, renderer: SelectControlRenderer },
  { tester: RadioControlTester, renderer: RadioControlRenderer },
  { tester: ObjectControlRendererTester, renderer: ObjectControlRenderer },
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
