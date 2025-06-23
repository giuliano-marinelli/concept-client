import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';

import { FindMetaModels } from '../entities/meta-model.entity';
import { map } from 'rxjs';

export const MetaModelExistsGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const _findMetaModels = inject(FindMetaModels);

  const username = segments[0].path; // assuming the user is the first segment of the path
  const language = segments[2].path; // assuming the language is the third segment of the path (it must be of form tag@version)

  // check if the language is of form tag@version (only has one @)
  if (language.split('@').length !== 2) return false;

  const [tag, version] = language.split('@'); // split the tag and version from the path

  return _findMetaModels
    .fetch({
      where: {
        tag: { eq: tag },
        version: { eq: version },
        owner: { username: { eq: username } }
      }
    })
    .pipe(
      map(({ data, errors }) => {
        if (errors) return false;
        if (data?.metaModels?.set) {
          return data.metaModels.set.length > 0; // check if any metaModel exists with the given language
        }
        return false; // no metaModel found
      })
    );
};
