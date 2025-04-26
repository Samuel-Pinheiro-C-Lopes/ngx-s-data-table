export class ValidationResult {
    public readonly error: boolean;
    public readonly errorMessage: string;

    constructor(error: boolean = false, errorMessage: string = "") {
        this.error = error;
        this.errorMessage = errorMessage;
    }
}