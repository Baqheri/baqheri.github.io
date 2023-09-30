export class ErrorWithFacllBack extends Error {
    constructor(message, {cause, fallback}) {
        super(message, {cause});
        this.fallback = fallback;
    }
}