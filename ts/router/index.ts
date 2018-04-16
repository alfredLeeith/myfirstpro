import * as koa from "koa"
import { stat } from "fs"
import { join } from "path"
import winston = require("winston")
import { promisify } from "bluebird"

export async function initRouter(app: koa) {
    const statAsync = promisify(stat)

    let paths = [
        "./crm/users"
    ]

    await Promise.all(paths.map(path => statAsync(join(__dirname, path) + ".js")))
    paths.forEach(path => app.use(require(path).router.routes()))
    winston.info("initRouter ok")
}
