import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { TippyDirective } from '@ngneat/helipopper';

import {
  Attribute,
  AttributeColor,
  AttributeTextColor,
  Criteria,
  FixedAttribute,
  Search,
  SearchAttribute,
  Sort
} from '../../global/search';
import _ from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

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
  @Input() defaultTagColor: AttributeColor = 'body-secondary';
  @Input() defaultTagTitleColor: AttributeTextColor = 'body';
  @Input() defaultTagCategoryColor: AttributeTextColor = 'body-emphasis';
  //placeholders
  @Input() searchPlaceholder: string = 'Search...';
  @Input() searchAdvancedPlaceholder: string = 'Search by adding tags...';

  @Input() search: any;
  @Output() searchChange = new EventEmitter<any>();

  @Input() searchString?: string;
  @Output() searchStringChange = new EventEmitter<any>();

  @Input() searchAttributes: SearchAttribute[] = [];
  @Output() searchAttributesChange = new EventEmitter<SearchAttribute[]>();

  optional: boolean = false;
  advancedCollapsed: boolean = true;

  constructor() {}

  ngOnInit(): void {
    this.advancedCollapsed = !this.startAdvanced;
    setTimeout(() => {
      if (this.firstSearch) this.onSearch(false);
    }, 0);
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

  onSearch(isContinuous: boolean): void {
    if (this.advancedCollapsed) {
      if (!isContinuous || this.continuousSearching || this.continuousSearchingOnlySimple) {
        const searchInput: any = Search.searchInput(
          this.attributes,
          this.searchString,
          this.useLikeWildcard,
          this.fixedAttributes
        );
        this.searchChange.emit(searchInput);
        this.searchStringChange.emit(this.searchString);
      }
    } else {
      if (!isContinuous || this.continuousSearching) {
        const searchInputAdvanced: any = Search.searchInputAdvanced(
          this.searchAttributes,
          this.optional,
          this.useLikeWildcard,
          this.fixedAttributes
        );
        this.searchChange.emit(searchInputAdvanced);
        this.searchAttributesChange.emit(this.searchAttributes);
      }
    }
  }

  onKey(event: any): void {
    if (event.keyCode == 13) this.onSearch(false);
  }
}
