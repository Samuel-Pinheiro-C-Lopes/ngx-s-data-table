// Summary: class for the mapping of properties presents
// in objects from a data source.
export class PropertyMapping {
    private readonly _propertyName: string;
    private _columnName: string;
    private _isIgnored: boolean;
    private _isPrimaryKey: boolean;
    private _isExpandableContent: boolean;
    private _compositionPropertyName: string;

    constructor(propertyName: string, isIgnored: boolean = false) {
        this._propertyName = propertyName;
        this._columnName = this._propertyName;
        this._isIgnored = isIgnored;
        this._isPrimaryKey = false;
        this._isExpandableContent = false;
        this._compositionPropertyName = "";
    }

    public namedAs(columnName: string): PropertyMapping {
        this._columnName = columnName;
        return this;
    }

    public withCompositionProperty(compositionPropertyName: string): PropertyMapping {
        this._compositionPropertyName = compositionPropertyName;
        return this;
    }

    public beingPrimaryKey(isPrimaryKey: boolean = true): PropertyMapping {
        this._isPrimaryKey = isPrimaryKey;
        return this;
    }

    public beingIgnored(isIgnored: boolean = true): PropertyMapping {
        this._isIgnored = isIgnored;
        return this;
    }

    public beingExpandableContent(isExpandableContent: boolean = true): PropertyMapping {
        this._isExpandableContent = isExpandableContent;
        return this;
    }


    public get propertyName(): string { return this._propertyName; }
    public get columnName(): string { return this._columnName; }
    public get isIgnored(): boolean { return this._isIgnored; }
    public get isPrimaryKey(): boolean { return this._isPrimaryKey; }
    public get isExpandableContent(): boolean { return this._isExpandableContent; }
    public get compositionPropertyName(): string { return this._compositionPropertyName; }
}