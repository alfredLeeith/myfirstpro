import * as logger from "winston"
import Router = require('koa-router')
import { RedisLogin } from "./../redis/logindao"
import { sendErrMsg } from "./response"
function handleError(ctx: any, e: any) {
    if (e.code && !isNaN(e.code)) {
        ctx.status = e.code
    } else {
        ctx.status = 500
    }
    ctx.body = { error: e.message }
    logger.error("%s", e.stack.substring(0, 300))
}

async function checkLogin(ctx: Router.IRouterContext, next: () => Promise<any>) {
    let uuid = ctx.cookies.get("uuid")
    let token = ctx.cookies.get("token")
    if (!token && !uuid) {
        token = (ctx as any).headers.token
        uuid = (ctx as any).headers.uuid
    }
    try {
        // TODO login
        let res = await RedisLogin.getLoginAsync(uuid, token)
        if (res.info) {
            (ctx as any).request.loginInfo = res.info
            return next()
        }
        return sendErrMsg(ctx, res.error, 401)
    } catch (e) {
        handleError(ctx, e)
    }
}

export class RouterWrap {
    private router: Router
    constructor(opt?: any) {
        this.router = new Router(opt)
    }

    private register(method: string, userMiddleware: any, ...args: any[]) {
        let wrap = async (ctx: any, next: any) => {
            try {
                await userMiddleware(ctx, next)
            } catch (e) {
                handleError(ctx, e)
            }
        }
        switch (method) {
            case "get": (this.router.get as any)(...args, wrap); break
            case "post": (this.router.post as any)(...args, wrap); break
            case "put": (this.router.put as any)(...args, wrap); break
            case "patch": (this.router.patch as any)(...args, wrap); break
            case "delete": (this.router.delete as any)(...args, wrap); break
            case "all": (this.router.all as any)(...args, wrap); break
        }
    }

    public loginHandle(method: string, path: any, f: Router.IMiddleware) {
        this.register(method, f, path, checkLogin)
    }

    public handle(method: string, path: any, f: Router.IMiddleware) {
        this.register(method, f, path)
    }

    public routes() {
        return this.router.routes()
    }
}

