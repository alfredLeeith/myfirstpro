import { UsersValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { validateCgi } from "../../lib/validator"  
import { Users } from "../../model/user/users"
import { LoginInfo, RedisLogin } from "../../redis/logindao"
export const router = new RouterWrap({ prefix: "/crm" })
import { BaseHandler } from "../lib/basehandler"
import { getRedisClientAsync } from "../../lib/redispool"
import { checkPassword, md5sum, getPageCount, redisWxUpdate,setArticlesync,getContactAsync } from "../../lib/utils"
import * as moment from "moment"
import Router = require('koa-router')

export class UsersOnCrm extends BaseHandler {

    //user login
    public static async login(args: any): Promise<any> {
        const { username, password } = args.request.body
        validateCgi({ username, password }, UsersValidator.login)  //vilidate user's account & password

        let user = await Users.getInstance().findByContactName(username)
        if (!user)
            return super.NotFound("not found user")

        checkPassword(user.password, md5sum(password))
        delete user.password

        let [now, uuid] = [new Date(), user.uuid]
        let [token, key] = [md5sum(`${now.getTime()}_${Math.random()}`), md5sum(`${now.getTime()}_${Math.random()}`)]

        let cache = new LoginInfo(uuid, key, token, now.toLocaleString(), username)  //add to the cache
        await RedisLogin.setLoginAsync(uuid, cache)   //add to the redis

        return { uuid: uuid, token: token, username: user.username, perm: user.perm } 
    }

    //logout
    public static async logout(args: any): Promise<any> {
        let loginInfo: LoginInfo = args.request.loginInfo
        RedisLogin.delLogin(loginInfo.getUuid())
        return { "msg": "ok" }
    }

    //add a contact
    public static async addContact(args: any): Promise<any> {
        let { username, nickname, state, sex, phone, email, address } = args.request.body
        let obj = { username, nickname, state, sex, phone, email, address }

        validateCgi(obj, UsersValidator.create)

        let user = await Users.getInstance().findByContactName(username)
        if (user)
            return super.NotAcceptable("contact already exist!")

        let newcount = await Users.getInstance().insertContact(obj)  //insert to database postgreSQL


        if (newcount) {
            delete newcount.password
        } else {
            return super.InternalServerError("add contact failed！")
        }

        return { msg: "add contact success！" }
    }

    //delete a contact
    public static async deleteContact(args: any): Promise<any> {
        let { uuid } = args.request.body    //delete the contact 

        validateCgi({ uuid }, UsersValidator.uuid)
        let user = await Users.getInstance().findContactByUuid(uuid)
        if (!user)
            return super.NotAcceptable("no such contact,please try again!")

        let row = await Users.getInstance().deleteContact(uuid)
        if (row > 0) {
            return { "msg": "delete success" }
        } else {
            return super.InternalServerError("delete failed!")
        }

    }

    public static async updateContact(args: any): Promise<any> {
        let { uuid, username,sex, phone, email, address } = args.request.body
        let obj = { uuid, username, sex, phone, email, address }

        validateCgi(obj, UsersValidator.create)
        validateCgi({ uuid }, UsersValidator.uuid)

        let user = await Users.getInstance().findContactByUuid(uuid)
        if (!user)
            return super.NotAcceptable("no such contact")

        if (user.username != username) {
            let duser = await Users.getInstance().findByContactName(username)
            if (duser)
                return super.NotAcceptable("contact alredy exist")
        }

        let newcount = await Users.getInstance().updateContact(uuid, obj)

        if (newcount) {
            delete newcount.password
            return { msg: "update success!" }
        } else {
            return super.InternalServerError("update failed")
        }
    }

    public static async contactList(args: any): Promise<any> {
        const { page, count } = args.query

        validateCgi({ page, count }, UsersValidator.findAll)
        let obj = getPageCount(page, count)
        let key = "contactsRedisList"
        let res = await getContactAsync(key, obj.cursor, obj.limit)  //get return data from redis
        return res
    }
}

/**
 *  the app router add delete update & list contacts
 */
router.handle("post", "/login", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await UsersOnCrm.login(ctx as any)))

router.loginHandle('post', "/logout", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await UsersOnCrm.logout(ctx as any)))

router.loginHandle("post", "/insertusers", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await UsersOnCrm.addContact(ctx as any)))

router.loginHandle("post", "/deleteusers", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await UsersOnCrm.deleteContact(ctx as any)))

router.loginHandle("get", "/userlist", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await UsersOnCrm.contactList(ctx.request)))

router.loginHandle("post", "/updateuser", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await UsersOnCrm.updateContact(ctx as any)))
