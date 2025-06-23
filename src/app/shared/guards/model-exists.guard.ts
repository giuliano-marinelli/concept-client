import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';

import { FindModels } from '../entities/model.entity';
import { map } from 'rxjs';

export const ModelExistsGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const _findModels = inject(FindModels);

  const username = segments[0].path; // assuming the user is the first segment of the path
  const model = segments[2].path; // assuming the model is the third segment of the path (it must be of form tag@version)

  // check if the model is of form tag@version (only has one @)
  if (model.split('@').length !== 2) return false;

  const [tag, version] = model.split('@'); // split the tag and version from the path

  return _findModels
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
        if (data?.models?.set) {
          return data.models.set.length > 0; // check if any model exists with the given model
        }
        return false; // no model found
      })
    );
};
