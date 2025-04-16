import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { TippyDirective } from '@ngneat/helipopper';

import _ from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export type Color =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'primary-subtle'
  | 'secondary-subtle'
  | 'success-subtle'
  | 'danger-subtle'
  | 'warning-subtle'
  | 'info-subtle'
  | 'light-subtle'
  | 'dark-subtle'
  | 'body'
  | 'body-secondary'
  | 'body-tertiary'
  | 'black'
  | 'white'
  | 'transparent';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'primary-emphasis'
  | 'secondary-emphasis'
  | 'success-emphasis'
  | 'danger-emphasis'
  | 'warning-emphasis'
  | 'info-emphasis'
  | 'light-emphasis'
  | 'dark-emphasis'
  | 'body'
  | 'body-emphasis'
  | 'body-secondary'
  | 'body-tertiary'
  | 'black'
  | 'white'
  | 'muted';
export type Sort = 'ASC' | 'DESC' | null;
export type Criteria = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'ilike';

export interface Attribute {
  name: string;
  type: string | string[];
  title?: string;
  category?: string;
  simple?: boolean;
  color?: Color;
  titleColor?: TextColor;
  categoryColor?: TextColor;
}

export interface FixedAttribute {
  name: string;
  criteria: Criteria;
  value: string | boolean | null | undefined;
  enabled?: boolean;
}

export interface SearchAttribute {
  id: string;
  attribute: Attribute;
  value: string | boolean;
  criteria: Criteria;
  sort: Sort;
}

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  //search input attributes
  @Input() attributes: Attribute[] = [];
  @Input() fixedAttributes?: FixedAttribute[] = [];
  //options
  @Input() advanced: boolean = true;
  @Input() startAdvanced: boolean = false;
  @Input() continuousSearching: boolean = false;
  @Input() continuousSearchingOnlySimple: boolean = false;
  @Input() useLikeWildcard: boolean = true;
  @Input() firstSearch: boolean = false;
  //style configurations
  @Input() searchClass: string = '';
  @Input() searchInputClass: string = '';
  @Input() searchTagsClass: string = '';
  @Input() searchTagClass: string = '';
  @Input() searchTagEditClass: string = '';
  @Input() defaultTagColor: Color = 'body-secondary';
  @Input() defaultTagTitleColor: TextColor = 'body';
  @Input() defaultTagCategoryColor: TextColor = 'body-emphasis';
  //placeholders
  @Input() searchPlaceholder: string = 'Search...';
  @Input() searchAdvancedPlaceholder: string = 'Search by adding tags...';

  @Input() search: any;
  @Output() searchChange = new EventEmitter<any>();

  searchSimple: string = '';
  searchAttributes: SearchAttribute[] = [];
  optional: boolean = false;
  advancedCollapsed: boolean = true;

  constructor() {}

  ngOnInit(): void {
    this.advancedCollapsed = !this.startAdvanced;
    if (this.firstSearch) this.onSearch(false);
  }

  addSearchAttribute(attribute: Attribute): void {
    this.searchAttributes.push({
      id: uuidv4(),
      attribute: attribute,
      value: Array.isArray(attribute.type) ? attribute.type[0] : attribute.type == 'boolean' ? true : '',
      criteria: attribute.type == 'string' ? 'ilike' : 'eq',
      sort: null
    });
  }

  removeSearchAttribute(searchAttribute: SearchAttribute): void {
    this.searchAttributes = this.searchAttributes.filter((sa) => sa.id !== searchAttribute.id);
  }

  changeSort(searchAttribute: SearchAttribute): void {
    if (!searchAttribute.sort) searchAttribute.sort = 'ASC';
    else if (searchAttribute.sort === 'ASC') searchAttribute.sort = 'DESC';
    else searchAttribute.sort = null;
  }

  changeCriteria(searchAttribute: SearchAttribute, criteria: Criteria, tippy?: TippyDirective): void {
    searchAttribute.criteria = criteria;
    tippy?.hide();
  }

  criteriaByType(type: string | string[]): Criteria[] {
    if (Array.isArray(type)) return ['eq', 'ne'];
    switch (type) {
      case 'number':
      case 'Date':
        return ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'];
      case 'string':
        return ['eq', 'ne', 'ilike'];
      default:
        return ['eq'];
    }
  }

  inputByType(type: string | string[]): string {
    if (Array.isArray(type)) return 'select';
    switch (type) {
      case 'boolean':
        return 'checkbox';
      case 'number':
        return 'number';
      case 'Date':
        return 'datetime-local';
      case 'string':
      default:
        return 'text';
    }
  }

  typeAsArray(type: string | string[]): string[] {
    return Array.isArray(type) ? type : [type];
  }

  sortIcon(sort: Sort): IconProp {
    switch (sort) {
      case 'ASC':
        return 'sort-up';
      case 'DESC':
        return 'sort-down';
      default:
        return 'sort';
    }
  }

  criteriaIcon(criteria: Criteria): IconProp {
    switch (criteria) {
      case 'gt':
        return 'greater-than';
      case 'gte':
        return 'greater-than-equal';
      case 'lt':
        return 'less-than';
      case 'lte':
        return 'less-than-equal';
      case 'eq':
        return 'equals';
      case 'ne':
        return 'not-equal';
      case 'ilike':
        return 'star-of-life';
      default:
        return 'question';
    }
  }

  // receive a path like: 'profile.bio' and a value, and return a object:
  // { profile: { bio: value } }
  attrPathToWhereInput(attrPath: string, value: any): any {
    let whereInput: any = {};
    let attr: any = whereInput;
    if (!attrPath.includes('.')) return { [attrPath]: value };
    attrPath.split('.').forEach((subAttribute, index, array) => {
      if (index == array.length - 1) attr[subAttribute] = value;
      else {
        attr[subAttribute] = {};
        attr = attr[subAttribute];
      }
    });
    return whereInput;
  }

  // receive a path like: 'profile.bio' and a value, and add to a existing where input:
  // { profile: { bio: { and: { eq: 'someValue' } } }
  // => { profile: { bio: { and: [ { eq: 'someValue' }, { eq: 'anotherValue' } ] } }
  attrPathToExistingWhereInput(attrPath: string, value: any, whereInput: any): void {
    if (!attrPath.includes('.')) {
      if (!whereInput[attrPath]) whereInput[attrPath] = { and: [] };
      whereInput[attrPath]['and'].push(value);
    } else {
      attrPath.split('.').forEach((subAttribute, index, array) => {
        if (index == array.length - 1) {
          if (!whereInput[subAttribute]) whereInput[subAttribute] = { and: [] };
          whereInput[subAttribute]['and'].push(value);
        } else {
          if (!whereInput[subAttribute]) whereInput[subAttribute] = {};
          whereInput = whereInput[subAttribute];
        }
      });
    }
  }

  applyFixedAttributes(whereInput: any): any {
    console.log('applyFixedAttributes', whereInput, this.fixedAttributes);

    // if no fixed attributes, return the where input
    if (!this.fixedAttributes?.length) return whereInput;

    // create an AND object with the all fixed attributes
    const fixedAttributesAndObject = this.fixedAttributes?.reduce((and: any, fixedAttribute) => {
      if (!fixedAttribute.enabled) return and;
      return _.merge(
        and,
        this.attrPathToWhereInput(fixedAttribute.name, {
          [fixedAttribute.criteria]: fixedAttribute.value
        })
      );
    }, {});

    console.log('fixedAttributesAndObject', fixedAttributesAndObject);

    // if whereInput is null, return the fixed attributes
    if (!whereInput) return fixedAttributesAndObject;

    if (this.fixedAttributes?.length) {
      // if whereInput is an array, add the fixed attributes to each element
      if (Array.isArray(whereInput)) {
        whereInput = whereInput.map((where: any) => {
          return _.merge(where, fixedAttributesAndObject);
        });
      } else {
        // if whereInput is an object, add the fixed attributes to the object
        whereInput = _.merge(whereInput, fixedAttributesAndObject);
      }
    }

    return whereInput;
  }

  onSearch(isContinuous: boolean): void {
    if (this.advancedCollapsed) {
      if (!isContinuous || this.continuousSearching || this.continuousSearchingOnlySimple) {
        let whereInput: any = [];
        this.attributes.forEach((attribute) => {
          if (attribute.simple) {
            whereInput.push(
              this.attrPathToWhereInput(attribute.name, {
                ilike: this.useLikeWildcard ? '%' + this.searchSimple + '%' : this.searchSimple
              })
            );
          }
        });
        whereInput = this.applyFixedAttributes(whereInput);

        this.searchChange.emit({ where: whereInput });
      }
    } else {
      if (!isContinuous || this.continuousSearching) {
        let resultSearch: any = { order: [], where: this.optional ? [] : {} };
        this.searchAttributes.forEach((searchAttribute) => {
          let whereValue =
            searchAttribute.attribute.type == 'Date'
              ? moment(searchAttribute.value as string).toDate()
              : searchAttribute.value;
          whereValue =
            searchAttribute.criteria == 'ilike' && this.useLikeWildcard ? '%' + whereValue + '%' : whereValue;
          if (this.optional) {
            resultSearch.where.push(
              this.attrPathToWhereInput(searchAttribute.attribute.name, {
                [searchAttribute.criteria]: whereValue
              })
            );
          } else {
            this.attrPathToExistingWhereInput(
              searchAttribute.attribute.name,
              { [searchAttribute.criteria]: whereValue },
              resultSearch.where
            );
          }
          if (searchAttribute.sort) resultSearch.order.push({ [searchAttribute.attribute.name]: searchAttribute.sort });
        });
        if (!this.searchAttributes?.length && !this.fixedAttributes?.length) resultSearch = null;

        resultSearch.where = this.applyFixedAttributes(resultSearch.where);

        this.searchChange.emit(resultSearch);
      }
    }
  }

  onKey(event: any): void {
    if (event.keyCode == 13) this.onSearch(false);
  }
}
