# Data table with filtering, pagination, checkbox selection, click event and expandable row.

### Table of Contents
---
- [Description](#description)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API](#api)

# Description
Data table with support for essential features such as filtering, pagination, row selection, row expansion and checkbox based selection that works based on a class and data source provided. Has high customization and robust built-in validation.
Needs a class and its instances as a data source to work with.

# Features
 - **Pagination**: The data is paginated based on the quantity per page provided.
 - **Filtering**: Generic or column based filters to specify the displayed data.
 - **Click**: Click event to handle actions based on an element selected by the user.
 - **Expand**: Expandable rows that display a property value and/or ng-template content specified as HTML.
 - **Checkbox Selection**: Emit a list of elements selected by the user.
 - **Composition of Classes**: Display data from composed objects based on a property mapping provided.
 - **Date Format**: Formats dates based on input provided.
 - **Built-in Validation**: Automatically performs multiple validations to ensure proper functionality, providing explanation in the console.
 - **Robust Customization**: Use the PropertyMapping exported class to specify how the table should handle the data provided.

# Getting Started
### Step 1 - Installing ngx-s-data-table:
**NPM**
```bash
npm install ngx-s-data-table
```
#### Step2 - Importing the module:
**example.component.ts**
```typescript
import  { Component }  from  '@angular/core';
import  { DataTableModule }  from  'ngx-s-data-table';

@Component({
selector:  'app-example',
imports:  [DataTableModule],
templateUrl:  './example.component.html',
styleUrl:  './example.component.css'
})

export  class  ExampleComponent { }
```
**example.module.ts**
```typescript
import  { NgModule }  from  '@angular/core';
import  { CommonModule }  from  '@angular/common';
import  { ExampleComponent }  from  './example.component';
import  { DataTableModule }  from  'ngx-s-data-table';

@NgModule({

declarations:  [ExampleComponent],
imports:  [
CommonModule,
DataTableModule
],

exports:  [ExampleComponent]
})
export  class  ExampleModule  {  }
```
# Usage
***Basic***:

Use the ngx-s-data-table component with a data source and corresponding class:

```typescript
import  { Component }  from  '@angular/core';
import  { users }  from  './sample-data.data';
import  { User }  from  '../classes/user.class';

@Component({
selector:  'app-example',
standalone:  false,
templateUrl:  './example.component.html',
styleUrl:  './example.component.css'

})

export  class  ExampleComponent  {
	// Replace the class and data source with your own.
	dataClass  =  User;
	dataSource  =  users;
}
```
In template use the ngx-s-data-table providing the source and class

```html
<ngx-s-data-table
	[dataClass]="dataClass"
	[dataSource]="dataSource"
>
</ngx-s-data-table>
```
The table should be filled with the data provided.

***Customization and compositions***
The library exports a PropertyMapping class that allows you to specify how the table should handle the data. Especially useful when working with complex or nested data structures.

```typescript
import  { Component }  from  '@angular/core';
import  { orders }  from  './sample-data.data';
import  { Order }  from  '../classes/order.class';
import  { PropertyMapping }  from  'ngx-s-data-table';

@Component({
	selector:  'app-example',
	standalone:  false,
	templateUrl:  './example.component.html',
	styleUrl:  './example.component.css'
})

export  class  ExampleComponent  {
	dataClass  =  Order;
	dataSource  =  orders;

	propertyMappings:  PropertyMapping[]  =  [
		// both are compositions, this is telling the table to display the "name"
		// property for each one of them
		new  PropertyMapping("user")
			.withCompositionProperty("name"),
		new  PropertyMapping("products")
			.withCompositionProperty("name"),
		// this is adding a collumn that will display the price of each product
		new  PropertyMapping("products").namedAs("prices")
			.withCompositionProperty("price"),
		// this tells the table that the id will be unique and is meant to not
		// be displayed
		new  PropertyMapping("id")
			.beingPrimaryKey().beingIgnored()
	];
}
```
And then input the mappings specified to the component
```html
<ngx-s-data-table
	[dataClass]="dataClass"
	[dataSource]="dataSource"
	[mappingParams]="propertyMappings"
>
</ngx-s-data-table>
```
To handle compositions with same property meant to be displayed, it's possible to input the component with a default one.
Many more default behaviors can be assigned inputing data to the component, see the API for further information.
```html
<ngx-s-data-table
	[dataClass]="dataClass"
	[dataSource]="dataSource"
	[mappingParams]="propertyMappings"
	[defaultCompositionProperty]="'name'"
	[primaryKeyProperty]="'id'"
	[expandableProperty]="'htmlDescription'"
	[headBackgroundColor]="'rgb(150, 150, 150)'"
>
</ngx-s-data-table>
```
***Options***
The table by default won't have click, expansion, filtering or pagination features enabled, needing you to specify which features to use and, possibly, define a valid primary key to assure proper behavior.
```html
<ngx-s-data-table
	[dataClass]="dataClass"
	[dataSource]="dataSource"
	[primaryKeyProperty]="'id'"

	[expandableProperty]="'htmlDescription'"
	[useExpantion]="true"
	
	[useGeneralFilter]="true"
	[useColumnsFilter]="true"
	
	[usePagination]="true"
	[pageSize]="25"
	
	[useSelection]="true"
	(selectedActionEvent)="handleSelectedItens($event)"
>
</ngx-s-data-table>
``` 
Again, look for the API for further information.



# API

### DataTable component API
| Input | Type| Usage 
|----------|----------|----------|
| [dataClass] | new  (...args:  any[])  =>  any | Class of the data source.  | 
| [dataSource] | Record<string,  any>[] | Data source, an array of objects to be displayed. | 
| [mappingParams] | PropertyMapping[]  |  Specific configuration for the properties to be displayed. |   
| [headBackgroundColor] |  string |  background-color css attribute value for the thead element. |   
| [primaryKeyProperty] | string | Name of the property that is unique across the source of data. |
|  [defaultCompositionProperty] | string | Name of the default property to be displayed whenever there is a composition.      |
| [expandableProperty] | string  | Name of the property which value is to be displayed as HTML whenever a row is expanded.  |
| [useExpantion] | boolean  | Enables the row expantion feature.  | 
| [useGeneralFilter] | boolean  | Enables a general filter.   |
| [useColumnsFilter] | boolean  | Enables a column based filter. |
| [useSelection] | boolean  | Enables a checkbox based selection.  |
| [usePagination] | boolean  | Enables pagination.  |
| [useClick] | boolean  |  Enables emitting click events by clicking a row. |               
| [pageSize]  | number | Number of rows to be displayed by page. Default is 50. |
| [dateFormat] | string  | Date format. Example: "MM/dd/yyyy".  |                
---
| [Output] | Event type | Usage  
| -------|-------|------|
| (clickEvent) |  any |  emits the value of the primary key property from the clicked row object | 
| (selectedActionEvent) | Record<string, any>[]  | emits the selected rows objects  |                             



### PropertyMapping class API
| Method | Usage | 
|----------|----------|
| new PropertyMapping(propertyName:  string,  isIgnored:  boolean  =  false)| PropertyMapping class constructor, defines the mapped property name | 
| namedAs(columnName: string) |  Defines the column name for the property specified  |
| withCompositionProperty(compositionPropertyName:  string) | Defines which property within the object should be displayed by the table |
| beingPrimaryKey(isPrimaryKey:  boolean  =  true) | Defines the property as a primary key |
| beingIgnored(isIgnored:  boolean  =  true)  |  Defines that the property shouldn't be displayed |
| beingExpandableContent(isExpandableContent:  boolean  =  true)  |  Defines the property as the content to be displayed when the row's object is expanded  |
| get  propertyName() | gets the property name |
| get columnName() | gets the column name |
| isIgnored() | gets if the property is to be ignored |
| isPrimaryKey | gets if the property is a primary key |
| isExpandableContent | gets if the property is expandable content |
| compositionPropertyName | gets the name of the property whose value is to be displayed  |
|

