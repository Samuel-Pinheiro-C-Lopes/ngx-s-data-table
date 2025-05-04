export class ErrorMessages {

    private constructor() { }

    public static noClass: string = `No class provided for the s-data-table component. 
    Please provide a valid class`;
    
    public static paramNameIsntValidPropertyForClazz: string = `One of the mappings provided doesn't 
    have a property name that's valid for the dataClazz - maybe said name represents a function or 
    doesn't exists in the class provided. Compositions within the class provided were also checked.`;
    
    public static twoOrMoreParamsWithPrimaryKeyAssigned: string = `At least two mappings were found in 
    which there
    were a primary key flag assigned. Only one parameter can be assigned as a primary key simultaneously.`;
    
    public static twoOrMoreParamsWithExpandAssigned: string = `At least two mappings were found in which 
    there were a expandContent flag assigned. Only one paramater can be assigned as a expand key simultaneosly.`
    
    public static objIsNotInstanceOfClazz: string = `One of the objects provided can't be defined as an 
    instance of the dataClazz provided. Please verify the integrity of the data source.`;
    
    public static dataFromSourceIsntObject: string = `Some data provided by the data source wasn't an object 
    array. 
    Please verify the integrity of the source provided.`;
    
    public static dataFromSourceIsntRecordStringAny: string = `Some data provided by the data source couldn't 
    be handled as a Record<string, any> array. Please verify the integrity of the source provided`;
    
    public static rowClickedWithoutKeyPropertyDefined: string = `Tried to emit click event of table row 
    without a specified key to emit from it. Please verify if a valid unique key was defined.`;
    
    public static multipleElementsWithSameKey: string = `There's more than one element with the same key value. 
    The property key should be unique to assure expected behavior. Please check the key provided to the table and
    the value assigned to said key in each element.`;
    
    public static useClickButNoKeyProperty: string = `The 'UseClick' feature requires a key property to be 
    provided. 
    Please add a valid [keyProperty] to the table with the value of the property name that represents an 
    unique key`;
    
    public static useExpandOrClickButNoKeyProperty: string = `The 'UseExpand' and 'UseClick' feature require a 
    key property to be provided. 
    Please assure that a valid [primaryKeyProperty] is being assigned with the property name of the unique 
    field the class is meant to have`;
    
    /*
    public static  useClickAndUseExpand: string = `For now this table doesn't support both 'useClick' and 
    'useExpand' feature simultaneously.`;
    */

    public static useExpandButNoPropertyOrContent: string = `No rendering available for expansion of a row.
    The 'useExpand' works rendering the content of a property, specified through the propertyMapping input 
    property or expandableProperty input, or a ng-template's content with 'expandedContent' as id. Please provide
    what to render once a row is expanded.`;

    public static invalidExpandableProperty: string = `The provided expandable property isn't present in
    the dataClazz or compositions within. Please verify the property name and the class to assure it's a valid
    property.`;
}