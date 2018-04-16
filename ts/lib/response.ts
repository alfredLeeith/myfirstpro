import { ReqError } from "../lib/reqerror"


export function sendError(ctx: any, e: Error): void {
       ctx.body = { error: e.message }
       ctx.status = e instanceof ReqError ? e.getCode() : 500
}

export function sendErrMsg(ctx: any, msg?: string, code?: number): void {
    sendError(ctx, new ReqError(msg ? msg : "资源重复", code? code: 400))
}

export function sendNoPerm(ctx: any, msg?: string): void {
    return sendError(ctx, new ReqError(msg ? msg : "没有权限", 401))
}

export function sendNotFound(ctx: any, msg?: string): void {
    sendError(ctx, new ReqError(msg ? msg : "资源不存在", 404))
}

export function sendOk(ctx: any, data: any): void {
    (ctx as any).response.send(JSON.stringify(data))
}

export function sendOK(ctx: any, data: any): void {
    delete data.del
    ctx.body =data
    return ctx.body
}

export function createdOk(ctx: any, data: any): void {
    (ctx as any).response.statusCode = 201
    sendOk((ctx as any).response, data)
}

export function deleteOK(ctx: any, data: any): void {
    (ctx as any).response.statusCode = 204
    sendOk((ctx as any).response, data)
}
