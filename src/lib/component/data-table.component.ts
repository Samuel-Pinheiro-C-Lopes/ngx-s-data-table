// Angular
import { Component, ContentChild, EventEmitter, 
  Input, Output, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// classes
import {  PropertyMapping } from '../classes/property-mapping.class';
import { ValidationResult } from '../classes/validation-result.class';
import { ErrorMessages } from '../classes/error-messages.class';

// types
import { Class } from '../types/class.type';
import { Obj } from '../types/obj.type';

@Component({
  selector: 'lib-data-table',
  standalone: false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent {
  @ContentChild('expandedContent', { read: TemplateRef }) expandedContent!: TemplateRef<any>;
  
  @Output() clickEvent: EventEmitter<any> = new EventEmitter<any>();

  @Input() dataClazz: Class | null = null;
  @Input() dataSource: Obj[] = [];
  @Input() mappingParams: PropertyMapping[] = [];
  @Input() defaultCompositionProperty: string = "";

  mapping: PropertyMapping[] = [];

  @Input() primaryKeyProperty: string = "";
  @Input() expandableProperty: string = "";

  @Input() usePagination: boolean = false;
  @Input() useExpantion: boolean = false;
  @Input() useClick: boolean = false;
  @Input() useFilter: boolean = false;
  @Input() useColumnsFilter: boolean = false;

  expandedPropertyAsSafe: SafeHtml = "";
  lastExpandedKey: any = null;

  filterInput: string = "";

  filteredData: Obj[] = [];
  paginatedData: Obj[] = [];

  @Input() pageSize: number = 20;

  labelTotalElements: string = "";
  labelActualPage: string = "";
  labelTotalPages: string = "";
  page: number = 1;
  maxPage: number = 1;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    let result = new ValidationResult();

    result = this.validateClazz(this.dataClazz);
    if (result.error) {
      console.error(result.errorMessage);
      return;
    }

    result = this.validateDataProvided(this.dataSource, this.dataClazz);
    if (result.error) {
      console.error(result.errorMessage);
      return;
    }

    let instance: Obj = new (this.dataClazz as Class)();

    result = this.validatePropertyMappings(instance, this.mappingParams);
    if (result.error) {
      console.error(result.errorMessage);
      return;
    }

    this.mapping = [...this.mappingParams, 
      ...this.mapClass(instance, this.mappingParams.map(p => p.propertyName))];

    const primaryKeyMapping = this.mapping.find(m => m.isPrimaryKey);

    if (primaryKeyMapping) {
      result = this.validateUniquenessOfKeyProperty(this.dataSource, primaryKeyMapping.propertyName);
      if (result.error) {
        console.error(result.errorMessage);
        return;
      }
      this.primaryKeyProperty = primaryKeyMapping.propertyName;
    }

    this.filteredData = this.dataSource;
    this.paginatedData = this.filteredData.slice(0, this.pageSize);

    if (!this.primaryKeyProperty)
      this.primaryKeyProperty = this.mapping.find(m => m.isPrimaryKey)?.propertyName ?? "";
    if (!this.expandableProperty)
      this.expandableProperty = this.mapping.find(m => m.isExpandableContent)?.propertyName ?? "";

    this.mapping = this.mapping.filter(m => !m.isIgnored);

    this.maxPage = Math.ceil(this.dataSource.length/this.pageSize);

    this.labelActualPage = `Page: ${this.page}`;
    this.labelTotalPages = `Total Pages: ${this.maxPage}`;
    this.labelTotalElements = `Entries: ${this.dataSource.length}`
  }

  obtainProperValue = (propertyValue: any, propertyMapping: PropertyMapping):string => {
    if (Array.isArray(propertyValue)) {
      if (typeof propertyValue[0] != 'object')
        return propertyValue.toString();
      else
        return propertyValue.map(obj => obj[propertyMapping.compositionPropertyName]).toString();
    } else if (typeof propertyValue === 'object') {
      return `${propertyValue[propertyMapping.compositionPropertyName]}`;
    } else {
      return `${propertyValue}`;
    }
  }

  checkIfHas = (instance: Obj, propertyMapping: PropertyMapping): boolean => {
    if (propertyMapping.propertyName in instance) {
      return true;
    }

    for (let key in instance)
      if (typeof instance[key] === 'object' && this.checkIfHas(instance[key], propertyMapping))
        return true;

    return false;
  }

  checkIfHasAndIsntFunction = (instance: Obj, propertyMapping: PropertyMapping): boolean => {
    if (propertyMapping.propertyName in instance 
      && typeof instance[propertyMapping.propertyName] != 'function') 
      return true;

    for (let key in instance)
      if (typeof instance[key] === 'object' && this.checkIfHas(instance[key], propertyMapping))
        return true;

    return false;
  }

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

  // Summary: validates the clazz providaded
  validateClazz = (clazz: { new (...any: any): any} | null): ValidationResult => 
    clazz ? new ValidationResult() : new ValidationResult(true, ErrorMessages.noClass);

  // Summary: verifies if in an array of objects the value of a said key property is being repeated among
  // the records provided.
  validateUniquenessOfKeyProperty = (data: Obj[], keyProperty: string | undefined)
  : ValidationResult => {
    const keys: Set<any> = new Set();
    if (keyProperty == undefined)
      return new ValidationResult();
    for (let i = 0; i < data.length; i++) 
      keys.add(data[i][keyProperty])
    if (keys.size != data.length)
      return new ValidationResult(true, ErrorMessages.multipleElementsWithSameKey);
    else 
      return new ValidationResult();
  } 

  // summary: verifies if there is any object in the data provided isn't an object or instance
  // of the clazz providaded
  validateDataProvided = (data: any[], clazz: Class | null)
  :ValidationResult => {
    if (data.find(obj => typeof obj != "object") != undefined)
      return new ValidationResult(true, ErrorMessages.dataFromSourceIsntObject);
    else if (data.find(obj => !this.checkInstance(obj, clazz)) != undefined)
        return new ValidationResult(true, ErrorMessages.objIsNotInstanceOfClazz);
    return new ValidationResult(false);
  }

  // Summary checks if the provided object is an instance of a class pŕovided
  checkInstance(obj: any, clazz: Class | null): boolean {
    if (typeof clazz === 'function') 
      return obj instanceof clazz;
    return false;
  }


  // Summary: validates an array of property mappings provided based on an instance of a class.
  // If there is more than one mapping for primary key, more than one for expand key, or any property that
  // doesn't exists in the instance or is a function, it returns a validation result with an error.
  validatePropertyMappings = (instance: Obj, params: PropertyMapping[])
  : ValidationResult => {
    let result: ValidationResult = new ValidationResult();
    let primaryKeyAppeared: PropertyMapping | undefined = undefined;
    let expandKeyAppeared: PropertyMapping | undefined = undefined;
    params.forEach((p) => {
      if (!this.checkIfHasAndIsntFunction(instance, p)) {
        result = new ValidationResult(true, ErrorMessages.paramNameIsntValidPropertyForClazz + 
          `. ${p.propertyName} doesn't exist in the dataClazz or is a function.`);
        return;
      }

      if (p.isPrimaryKey && primaryKeyAppeared) {
        result = new ValidationResult(true, ErrorMessages.twoOrMoreParamsWithPrimaryKeyAssigned + 
          `. ${p.propertyName} and ${primaryKeyAppeared.propertyName} were found.`);
        return;
      } else if (p.isPrimaryKey){
        primaryKeyAppeared = p;
      }

      if (p.isExpandableContent && expandKeyAppeared) {
        result = new ValidationResult(true, ErrorMessages.twoOrMoreParamsWithExpandAssigned + 
          `. ${p.propertyName} and ${expandKeyAppeared.propertyName} were found.`);
        return;
      } else if (p.isExpandableContent) {
        expandKeyAppeared = p;
      }
    });

    return result;
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

  target = (element: Obj) => this.clickEvent.emit(element[this.primaryKeyProperty]);

  expand = (element: Obj) => {
    let wasExpanded:HTMLElement | null = null;

    if (!this.primaryKeyProperty)
      return;
    
    const toBeExpanded:HTMLElement | null = document.querySelector(`[keyValue="${element[this.primaryKeyProperty]}"]`);
    this.expandedPropertyAsSafe = this.sanitizer.bypassSecurityTrustHtml("");
    if (this.lastExpandedKey != null)
      wasExpanded = document.querySelector(`[keyValue="${this.lastExpandedKey}"]`);
    console.info(wasExpanded);

    if (!toBeExpanded) {
      console.error(`the key: ${element[this.primaryKeyProperty]} couldn't be found`);
      return;
    }

    if (wasExpanded) {
      wasExpanded.classList.add("minimized");
      wasExpanded.classList.remove("visible");
      setTimeout(() => {
        wasExpanded.classList.remove("minimized");
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

  filterData = () => {
    if (this.filterInput) {
      this.filteredData = this.dataSource.filter(el => this.mapping.some(m => {
        const val = this.findPropertyValue(el, m);
        if (typeof val === 'string') 
          return val.toLocaleLowerCase()
            .includes(this.filterInput.toLocaleLowerCase());
        else 
          return false;
      }));
    } else {
      this.filteredData = this.dataSource;
    }
  }

  previousPage = () => this.page > 1 ? (this.page--, this.labelActualPage = `Page: ${this.page}`, 
    this.updatePaginatedItens()) : null;

  nextPage = () => this.page < this.maxPage ? (this.page++, this.labelActualPage = `Page: ${this.page}`,
     this.updatePaginatedItens()) : null;

  updatePaginatedItens = () => {
    let offset: number = (this.page - 1) * this.pageSize;
    this.paginatedData = this.filteredData.slice(offset, offset + this.pageSize);
  }
}
