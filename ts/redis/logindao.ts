import assert = require("assert")
import { ReqError } from "../lib/reqerror"
export class LoginInfo {
    private uuid: string
    private username: string
    private key: string
    private token: string
    private login: string

    constructor(uuid: string, key: string, token: string, login: string, username: any) {
        [this.uuid, this.key, this.token, this.login, this.username] = [uuid, key, token, login, username]
    }

    public static valueOf(s: string): LoginInfo {
        assert(typeof s === "string")

        let obj = JSON.parse(s)
        if (!obj)
            throw new ReqError("invalid LoginInfo format")

        let { uuid, key, token, login, username } = obj

        return new LoginInfo(uuid, key, token, login, username)
    }

    public getUuid() { return this.uuid }
    public getKey() { return this.key }
    public getToken() { return this.token }
    public getLogin() { return this.login }
}

import logger = require("winston")
import { getRedisClientAsync } from "../lib/redispool"

// import { sendError } from "../lib/response"

const [sessionDbOpt, Sessiontimeout] = [{ db: 0 }, 86400]

export class RedisLogin {
    public static async setLoginAsync(uuid: string, loginInfo: LoginInfo) {
        const content = JSON.stringify(loginInfo)
        await getRedisClientAsync(async rds => await rds.setAsync(uuid, content, "ex", Sessiontimeout), sessionDbOpt)
    }

    public static async getLoginAsync(uuid: string, token: string): Promise<any> {
        if (!uuid || !token)
            return { error: "please login first!" }

        let s = await getRedisClientAsync(async rds => await rds.getAsync(uuid), sessionDbOpt)
        if (!s)
            return { error: "please login first!" }

        let info = LoginInfo.valueOf(s)
        if (token !== info.getToken())
            return { error: "your account had logined in other place" }

        return { info }
    }

    public static async delLogin(uuid: string) {
        try {
            await getRedisClientAsync(async rds => rds.delAsync(uuid), sessionDbOpt)
        } catch (e) {
            logger.error("delLogin error", e.message)
        }
    }
}
