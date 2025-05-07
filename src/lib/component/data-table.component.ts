// Angular
import { Component, ContentChild, EventEmitter, 
  Input, Output, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// classes
import {  PropertyMapping } from '../classes/property-mapping.class';
import { ValidationResult } from '../classes/validation-result.class';
import { ErrorMessages } from '../classes/error-messages.class';
import { Validate } from '../classes/validate.class';

// types
import { Class } from '../types/class.type';
import { Obj } from '../types/obj.type';
import { formatDate } from '@angular/common';
import { FilterMapping } from '../classes/filter-mapping.class';

@Component({
  selector: 'ngx-s-data-table',
  standalone: false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent {

  // base
  @Input() dataClass: Class | null = null;
  @Input() dataSource: Obj[] = [];
  @Input() mappingParams: PropertyMapping[] = [];
  @Input() defaultCompositionProperty: string = "";
  @Input() dateFormat: string = "";
  mapping: PropertyMapping[] = [];


  // expand / click
  @ContentChild('expandedContent', { read: TemplateRef }) expandedContent!: TemplateRef<any>;
  @Output() clickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() primaryKeyProperty: string = "";
  @Input() expandableProperty: string = "";
  @Input() useExpantion: boolean = false;
  @Input() useClick: boolean = false;
  expandedPropertyAsSafe: SafeHtml = "";
  lastExpandedKey: any = null;

  // filter
  @Input() useGeneralFilter: boolean = false;
  @Input() useColumnsFilter: boolean = false;
  filterInput: string = "";
  filterMapping: FilterMapping[] = [];
  filteredData: Obj[] = [];

  // pagination
  @Input() usePagination: boolean = true;
  @Input() pageSize: number = 20;
  labelTotalElements: string = "";
  labelActualPage: string = "";
  labelTotalPages: string = "";
  page: number = 1;
  maxPage: number = 1;
  paginatedData: Obj[] = [];

  // Selection
  @Output() selectedActionEvent: EventEmitter<Obj[]> = new EventEmitter<Obj[]>();
  @Input() useSelection: boolean = false;
  selectedElements: Obj[] = [];

  // Style
  @Input() headBackgroundColor: string = "rgb(128, 0, 32)"


  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    let result = new ValidationResult();

    result = Validate.validateClazz(this.dataClass);
    if (result.error) {
      console.error(result.errorMessage);
      return;
    }

    result = Validate.validateDataProvided(this.dataSource, this.dataClass);
    if (result.error) {
      console.error(result.errorMessage);
      return;
    }

    let instance: Obj = new (this.dataClass as Class)();

    result = Validate.validatePropertyMappings(instance, this.mappingParams);
    if (result.error) {
      console.error(result.errorMessage);
      return;
    }

    this.mapping = [...this.mappingParams, 
      ...this.mapClass(instance, this.mappingParams.map(p => p.propertyName))];

    const primaryKeyName = this.mapping.find(m => m.isPrimaryKey)?.propertyName ?? this.primaryKeyProperty;

    if (this.useClick || this.useExpantion)
      if (!this.primaryKeyProperty) {
        console.error(ErrorMessages.useExpandOrClickButNoKeyProperty)
        return;
      }

    if (primaryKeyName) {
      result = Validate.validateUniquenessOfKeyProperty(this.dataSource, primaryKeyName);
      if (result.error) {
        console.error(result.errorMessage);
        return;
      }
      this.primaryKeyProperty = primaryKeyName;
    }

    if (!this.primaryKeyProperty)
      this.primaryKeyProperty = this.mapping.find(m => m.isPrimaryKey)?.propertyName ?? "";
    if (!this.expandableProperty)
      this.expandableProperty = this.mapping.find(m => m.isExpandableContent)?.propertyName ?? "";

    result = Validate.checkExpansionAndClickOptions(new (this.dataClass as Class)(), this.useExpantion, this.useClick, 
      this.primaryKeyProperty, this.expandedContent, this.expandableProperty);
    if (result.error) {
      console.error(result.errorMessage);
      return;
    }

    if (this.useExpantion && !this.expandedContent && !this.expandableProperty) {
      console.error(ErrorMessages.useExpandButNoPropertyOrContent);
      return;
    }

    this.filteredData = this.dataSource;
    this.paginatedData = this.filteredData.slice(0, this.pageSize);

    this.mapping = this.mapping.filter(m => !m.isIgnored);

    if (this.useColumnsFilter) {
      this.filterMapping = this.mapping.map(m => new FilterMapping(m));
    }

    this.updatePagination();
  }

  // Summary: returns the value to be displayed in the table for one property of any type
  obtainProperValue = (propertyValue: any, propertyMapping: PropertyMapping):string => {
    if (Array.isArray(propertyValue)) {
      if (typeof propertyValue[0] != 'object')
        return propertyValue.toString();
      else
        return propertyValue.map(obj => obj[propertyMapping.compositionPropertyName]).join(", ");
    } else if (typeof propertyValue === 'object') {
      if (Validate.checkIfIsDate(propertyValue)) 
        return this.dateFormat ? formatDate(propertyValue, this.dateFormat, 'en-US') : propertyValue.toLocaleString();
      return `${propertyValue[propertyMapping.compositionPropertyName]}`;
    } else {
      return `${propertyValue}`;
    }
  }

  // Summary: finds the value in the object assigned to a property
  findPropertyValue = (instance: Obj, propertyMapping: PropertyMapping): any => {
    if (instance[propertyMapping.propertyName] !== undefined) 
      return this.obtainProperValue(instance[propertyMapping.propertyName], propertyMapping);
  
    for (let key in instance) {
      if (typeof instance[key] === 'object' && instance[key] !== null) {
        const found = this.findPropertyValue(instance[key], propertyMapping);
        if (found !== undefined) 
          return found;
      }
    }
  
    return undefined;
  }

  mapClass = (instance: Obj, propsToIgnore: string[]): PropertyMapping[] => {
    const clazzMapping: PropertyMapping[] = [];

    for (let key in instance) 
      if (!propsToIgnore.includes(key) && typeof instance[key] != 'function')
        clazzMapping.push(new PropertyMapping(key).withCompositionProperty(this.defaultCompositionProperty));

    return clazzMapping;
  }

  rowClicked = (element: Obj) => {
    if (this.useExpantion)
      this.expand(element);
    else if (this.useClick)
      this.target(element);
  }

  private target = (element: Obj) => this.clickEvent.emit(element[this.primaryKeyProperty]);

  private expand = (element: Obj) => {
    let wasExpanded:HTMLElement | null = null;

    if (!this.primaryKeyProperty)
      return;
    
    const toBeExpanded:HTMLElement | null = document.querySelector(`[keyValue="${element[this.primaryKeyProperty]}"]`);
    this.expandedPropertyAsSafe = this.sanitizer.bypassSecurityTrustHtml("");
    if (this.lastExpandedKey != null)
      wasExpanded = document.querySelector(`[keyValue="${this.lastExpandedKey}"]`);

    if (!toBeExpanded) {
      console.error(`the key: ${element[this.primaryKeyProperty]} couldn't be found`);
      return;
    }

    if (wasExpanded) {
      wasExpanded.classList.add("minimized");
      wasExpanded.classList.remove("visible");
      setTimeout(() => {
        (wasExpanded as HTMLElement).classList.remove("minimized");
      }, 250);
    }

    toBeExpanded.classList.add("minimized");
    this.expandedPropertyAsSafe = this.sanitizer.bypassSecurityTrustHtml(element[this.expandableProperty]);
    this.lastExpandedKey = element[this.primaryKeyProperty];
    if (wasExpanded != toBeExpanded) {
      toBeExpanded.classList.add("minimized");
      setTimeout(() => {
        toBeExpanded.classList.add("visible");
      }, 10);
    } else {
      this.lastExpandedKey = null;
    }
  }

  // Summary: filters the data accordingly to the filter options provided by the user.
  // The priority is to filter by specific columns and then apply the general filter.
  filterData = () => {
    if (this.useColumnsFilter && this.useGeneralFilter) {
      this.filteredData = this.filterDataByGeneral(this.filterDataByColumns(this.dataSource));
    }
    else if (this.useColumnsFilter) {
      this.filteredData = this.filterDataByColumns(this.dataSource);
    } else if (this.useGeneralFilter) {
      this.filteredData = this.filterDataByGeneral(this.dataSource);
    }

    this.updatePagination();
  }

  filterDataByColumns = (data: Obj[]): Obj[] => {
    if (this.filterMapping.some(m => m.inputFilter != '')) {
      return data.filter(el => this.filterMapping.every(m => {
        const val = this.findPropertyValue(el, m.propertyMapping);
        if (typeof val === 'string')
          return val.toLocaleLowerCase().includes(m.inputFilter.toLocaleLowerCase());
        else 
          return false;
      }));
    } else {
      return data;
    }
  }

  filterDataByGeneral = (data: Obj[]): Obj[] => {
    if (this.filterInput) {
      return data.filter(el => this.mapping.some(m => {
        const val = this.findPropertyValue(el, m);
        if (typeof val === 'string') 
          return val.toLocaleLowerCase()
            .includes(this.filterInput.toLocaleLowerCase());
        else 
          return false;
      }));
    } else {
      return data;
    }
  }

  previousPage = () => this.page > 1 ? (this.page--, this.updatePagination()) : null;

  nextPage = () => this.page < this.maxPage ? (this.page++, this.updatePagination()) : null;

  updatePagination = () => {
    let offset: number = (this.page - 1) * this.pageSize;

    this.maxPage = Math.ceil(this.filteredData.length/this.pageSize);

    if (this.maxPage === 0)
      this.maxPage = 1;
    
    if (this.page > this.maxPage)
      this.page = this.maxPage;
    
    this.paginatedData = this.filteredData.slice(offset, offset + this.pageSize);
    this.updateLabels();
  }

  updateLabels = () => {
    this.labelActualPage = `Page: ${this.page}`;
    this.labelTotalPages = `Pages: ${this.maxPage}`;
    this.labelTotalElements = `Entries: ${this.filteredData.length}`;
  }

  selectElement = (event: Event, element: Obj) => {
    event.stopPropagation();
    const t = event.target as HTMLInputElement;

    if (t.checked) 
      this.selectedElements.push(element)
    else
      this.selectedElements.splice(this.selectedElements.findIndex(i => element[this.primaryKeyProperty] == i[this.primaryKeyProperty]), 1);
  }

  selectedAction = () => this.selectedActionEvent.emit(this.selectedElements);
}