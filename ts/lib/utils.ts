import { createHash, randomBytes } from "crypto"
import { ReqError } from "../lib/reqerror"
import * as winston from 'winston'
import { getAsync } from "../lib/request"
import * as Redis from 'ioredis'
import { Users } from "../model/user/users"
import { opt as config } from '../config/redis'
import { getRedisClientAsync } from "../lib/redispool"
import * as moment from "moment"
const [sessionDbOpt, Sessiontimeout] = [{ db: 0 }, 5]

export function checkPassword(real: string, current: string): void {
    let [a, b] = [real.length === 32 ? real : md5sum(real), current.length === 32 ? current : md5sum(current)]
    if (a !== b)
        throw new ReqError("密码不正确！", 400)
}

export function randomInt(from: number, to: number) {
    return Math.floor(Math.random() * (to - from) + from)
}

export function md5sum(str: string): string {
    return createHash('md5').update(str).digest("hex")
}

export function getSalt(): string {
    return randomBytes(128).toString('base64');
}

export function sleepAsync(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(() => resolve(), ms))
}

export function getPageCount(page: string, count?: string) {
    let limit = parseInt(count)
    let cursor = 0
    if (page) {
        cursor = (parseInt(page) - 1) * parseInt(count)
    }
    return { cursor, limit }
}

export function checkCursorLimit(cursor: number, limit: number) {
    if (cursor > -1 && limit > 0)
        return false
    return true
}

export async function checkreq(param: Array<any>, sign: string, next: any) {
    param.sort()
    let s = param.join(",")
    if (sign === md5sum(s)) {
        return next()
    }
    return "参数错误!"
}

export function getArray(url: any) {
    let reg_url = /^[^\?]+\?([\w\W]+)$/,
        reg_para = /([^&=]+)=([\w\W]*?)(&|$)/g, //g is very important
        arr_url = reg_url.exec(url);
    let ret: any = {};
    if (arr_url && arr_url[1]) {
        var str_para = arr_url[1], result;
        while ((result = reg_para.exec(str_para)) != null) {
            ret[result[1]] = result[2];
        }
    }
    return ret;
}

export async function getShortUrl(args: any) {
    let url = `http://api.t.sina.com.cn/short_url/shorten.json?source=3271760578&url_long=${args}`
    let body = await getAsync({ url: url })
    let arrObj = JSON.parse(body)
    return arrObj[0].url_short
}

export function getSign(order: any, key: string) {
    delete order.sign
    let arr = new Array<any>()
    for (let k in order) {
        arr.push(`${k}=${order[k]}`)
    }
    arr.sort()
    arr.push(`key=${key}`)
    return md5sum(arr.join("&")).toUpperCase()
}
export function numcheckundefined(num: any) {
    if (num == undefined) num = 0
    return num
}
export function strcheckundefined(str: any) {
    if (str == undefined) str = ''
    return str
}
export function getRendomQuestions(num: number, arr: any[]) {
    let indexarr: number[], resarr: any[]
    if (num < arr.length) {
        while (indexarr.length < num) {     //取num个小于arr.length的不重复随机数字
            let i = Math.round(Math.random() * (arr.length - 1))
            for (let j = 0; j < indexarr.length; j++) {
                if (i == indexarr[j]) break
                else if (j == indexarr.length - 1) indexarr.push(i)
            }
        }
        for (let i = 0; i < num; i++) {    //根据获取的随机送取得arr中的数据
            if (i >= arr.length) break
            resarr.push(arr[indexarr[i]])
        }
    } else {
        resarr = arr
    }
    return resarr
}

const logger =  winston;
const redisClient = new Redis({ host: config.host, port: config.port, family: 4, db: 0 });
export async function lpush(key: string, ...args: string[]): Promise<any>;
export async function lpush(key: string, arr: string[]): Promise<any>;
export async function lpush(key: any, arr: any) {
    try {
        return await redisClient.lpush(key, arr);
    } catch (e) {
        logger.error(`redis lpush error : ${e}`);
    }
}

export async function redisWxUpdate(opt: any, key: any) {
    try {
        if (typeof opt === 'object') {
            await redisClient.lpush(key, JSON.stringify(opt));
            console.log('111---------------');
        } else if (typeof opt === 'string') {
            console.log('222---------------');
            await redisClient.lpush(opt);
        }
    } catch (e) {
        logger.error(`redisWxUpdate Error: ${e}`);
    }
}

export async function getContactAsync(key: string, cursor: number, limit: number) {
    let res = await getRedisClientAsync(async rds => await rds.getAsync(key), sessionDbOpt)
    if (!res) {
        res = await setArticlesync(cursor, limit, key)
    }
    return JSON.parse(res)
}

export async function setArticlesync(cursor: number, limit: number, key: string) {
    let contacts = await Users.getInstance().getAll(cursor, limit)
    let res = JSON.stringify(contacts)
    await getRedisClientAsync(async rds => await rds.setAsync(key, res, 'ex', Sessiontimeout), sessionDbOpt)
    return res
}