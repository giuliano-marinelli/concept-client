import { RankedTester } from '@jsonforms/core';

import {
  ArrayControlRenderer,
  ArrayControlRendererTester,
  CheckboxControlRenderer,
  CheckboxControlTester,
  ConditionControlRenderer,
  ConditionControlRendererTester,
  NumberControlRenderer,
  NumberControlRendererTester,
  ObjectControlRenderer,
  ObjectControlRendererTester,
  RadioControlRenderer,
  RadioControlTester,
  RangeControlRenderer,
  RangeControlRendererTester,
  SelectControlRenderer,
  SelectControlTester,
  SwitchControlRenderer,
  SwitchControlRendererTester,
  TextAreaControlRenderer,
  TextAreaControlRendererTester,
  TextControlRenderer,
  TextControlRendererTester
} from './controls';
import {
  CategorizationTabLayoutRenderer,
  CategorizationTester,
  GroupLayoutRenderer,
  GroupLayoutTester,
  HorizontalLayoutRenderer,
  HorizontalLayoutTester,
  LabelRenderer,
  LabelRendererTester,
  VerticalLayoutRenderer,
  VerticalLayoutTester
} from './layouts';

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
  { tester: ArrayControlRendererTester, renderer: ArrayControlRenderer },
  { tester: ConditionControlRendererTester, renderer: ConditionControlRenderer },
  // layouts
  { tester: VerticalLayoutTester, renderer: VerticalLayoutRenderer },
  { tester: HorizontalLayoutTester, renderer: HorizontalLayoutRenderer },
  { tester: GroupLayoutTester, renderer: GroupLayoutRenderer },
  { tester: CategorizationTester, renderer: CategorizationTabLayoutRenderer },
  { tester: LabelRendererTester, renderer: LabelRenderer }
];
