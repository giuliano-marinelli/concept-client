import { NgModule } from '@angular/core';

import { NgbTag, NgbTagRemove, NgbTags, NgbTagsInput } from './tags';

export { NgbTags, NgbTagsInput, NgbTag, NgbTagRemove } from './tags';

const NGB_TAGS_DIRECTIVES = [NgbTags, NgbTagsInput, NgbTag, NgbTagRemove];

@NgModule({
  imports: NGB_TAGS_DIRECTIVES,
  exports: NGB_TAGS_DIRECTIVES
})
export class NgbTagsModule {}
