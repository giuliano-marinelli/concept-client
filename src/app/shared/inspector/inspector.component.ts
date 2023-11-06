import { Component } from '@angular/core';
import { Instance, Token } from '../models/graph.model';
import _ from 'lodash';

@Component({
  selector: 'inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.scss']
})
export class InspectorComponent {

  tokens!: Token[];
  instance!: Instance;

  // returns the value object by a path string
  // path string example: "attributes.0.name", "person.name"
  getValue(path: string): any {
    let value = this.instance.values;
    path.split(".").forEach((key) => {
      value = value[key] as any;
    });
    return value;
  }

  // update the value when it's an array of basic type values
  updateValue(newValue: any, instance: any, parentToken: Token, index: number) {
    if (parentToken)
      instance[parentToken.name][index] = newValue;
  }

  trackIndex(index: number): any {
    return index;
  }

  addListItem(item: any, instance: any, token: Token, parentToken: Token, index: number) {
    if (item) {
      if (parentToken)
        instance[parentToken.name][index].push(_.clone(item));
      else
        instance[token.name].push(_.clone(item));
    }
  }

  deleteListItem(instance: any, token: Token, parentToken: Token, index: number) {
    if (parentToken)
      instance[parentToken.name].splice(index, 1);
    else
      instance[token.name].splice(index, 1);
  }

}
