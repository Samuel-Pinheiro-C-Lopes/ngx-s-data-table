import { TemplateRef } from "@angular/core";
import { Class } from "../types/class.type";
import { Obj } from "../types/obj.type";
import { ErrorMessages } from "./error-messages.class";
import { PropertyMapping } from "./property-mapping.class";
import { ValidationResult } from "./validation-result.class";

export class Validate {

    // static
    private constructor() { }

    public static checkExpansionAndClickOptions = 
    (instance: Obj, useExpansion: boolean, useClick: boolean, 
    keyProperty: string, expandedContent: TemplateRef<any>, expandableProperty: string) =>
    {
      if (useExpansion || useClick) {
        if (!keyProperty)
          return new ValidationResult(true, ErrorMessages.useExpandOrClickButNoKeyProperty);
        else if (useExpansion && !expandedContent && !expandableProperty)
          return new ValidationResult(true, ErrorMessages.useExpandButNoPropertyOrContent);
        else if (!this.checkIfHasAndIsntFunction(instance, expandableProperty))
          return new ValidationResult(true, ErrorMessages.invalidExpandableProperty);
      }

      return new ValidationResult();
    }

    public static checkIfIsDate = (obj: any): obj is Date => obj instanceof Date;

    public static checkIfHas = (instance: Obj, propertyName: string): boolean => {
      if (propertyName in instance) {
        return true;
      }
  
      for (let key in instance)
        if (typeof instance[key] === 'object' && this.checkIfHas(instance[key], propertyName))
          return true;
  
      return false;
    }
  
    public static checkIfHasAndIsntFunction = (instance: Obj, propertyName: string): boolean => {
      if (propertyName in instance 
        && typeof instance[propertyName] != 'function') 
        return true;
  
      for (let key in instance)
        if (typeof instance[key] === 'object' && Validate.checkIfHas(instance[key], propertyName))
          return true;
  
      return false;
    }
  
    // Summary: validates the clazz providaded
    public static validateClazz = (clazz: Class| null): ValidationResult => 
      clazz ? new ValidationResult() : new ValidationResult(true, ErrorMessages.noClass);
  
    // Summary: verifies if in an array of objects the value of a said key property is being repeated among
    // the records provided.
    public static validateUniquenessOfKeyProperty = (data: Obj[], keyProperty: string | undefined)
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
    public static validateDataProvided = (data: any[], clazz: Class | null)
    :ValidationResult => {
      if (data.find(obj => typeof obj != "object") != undefined)
        return new ValidationResult(true, ErrorMessages.dataFromSourceIsntObject);
      else if (data.find(obj => !this.checkInstance(obj, clazz)) != undefined)
          return new ValidationResult(true, ErrorMessages.objIsNotInstanceOfClazz);
      return new ValidationResult(false);
    }
  
    // Summary checks if the provided object is an instance of a class pŕovided
    public static checkInstance(obj: any, clazz: Class | null): boolean {
      if (typeof clazz === 'function') 
        return obj instanceof clazz;
      return false;
    }
  
  
    // Summary: validates an array of property mappings provided based on an instance of a class.
    // If there is more than one mapping for primary key, more than one for expand key, or any property that
    // doesn't exists in the instance or is a function, it returns a validation result with an error.
    public static validatePropertyMappings = (instance: Obj, params: PropertyMapping[])
    : ValidationResult => {
      let result: ValidationResult = new ValidationResult();
      let primaryKeyAppeared: PropertyMapping | undefined = undefined;
      let expandKeyAppeared: PropertyMapping | undefined = undefined;
      params.forEach((p) => {
        if (!Validate.checkIfHasAndIsntFunction(instance, p.propertyName)) {
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
  }