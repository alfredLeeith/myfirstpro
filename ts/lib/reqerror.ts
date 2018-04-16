export class ReqError extends Error {
    private code: number
    constructor(msg: string, code = 401) {
        super(msg)
        this.code = code
    }

    getCode(): number {
        return this.code
    }
}