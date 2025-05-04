import { PropertyMapping } from "./property-mapping.class";

export class FilterMapping {
    public inputFilter: string;
    private _propertyMapping: PropertyMapping;

    constructor(propertyMapping: PropertyMapping) {
        this.inputFilter = "";
        this._propertyMapping = propertyMapping;
    }

    public get propertyMapping(): PropertyMapping {
        return this._propertyMapping;
    }
}