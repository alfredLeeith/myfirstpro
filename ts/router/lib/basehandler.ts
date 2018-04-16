export class BaseHandler {
    // 参照HTTP标准，此处为例外， 不使用小驼峰写法
    public static BadRequest(err?: string): any {
        return { err: err ? err : "Bad Reques", code: 400 }
    }

    public static Unauthorized(err: string): any {
        return { err: err ? err : "Unauthorized", code: 401 }
    }

    public static Forbidden(err: string): any {
        return { err: err ? err : "Forbidden", code: 403 }
    }

    public static NotFound(err: string): any {
        return { err: err ? err : "Not Found", code: 404 }
    }

    public static NotAcceptable(err: string): any {
        return { err: err ? err : "Not Acceptable", code: 405 }
    }

    public static InternalServerError(err: string): any {
        return { err: err ? err : "Internal Server Error", code: 500 }
    }

    public static getLoginInfo(ctx: any): any {
        return ctx.request.loginInfo
    }

    public static handlerResult(ctx: any, res: { err: string, code: number } | any) {
        if (res.err) {
            ctx.body = { error: res.err }
            ctx.status = res.code
            return
        }

        ctx.body = res
    }
}
