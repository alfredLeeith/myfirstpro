import logger = require("winston")
import { getRedisClientAsync } from "../lib/redispool"
const [MessagesDbOpt] = [{ db: 2 }]

export async function getSmsCode(username: string) {
    return await getRedisClientAsync(async rds => await rds.getAsync(username), MessagesDbOpt)
}

export async function saveSmsCode(username: string, content: string) {
    try {
        await getRedisClientAsync(async rds => await rds.setAsync(username, content, "ex", 600), MessagesDbOpt)
    } catch (e) {
        logger.error("saveSmsCode error", e.message)
    }
}

export async function removeSmsCode(username: string) {
    try {
        await getRedisClientAsync(async rds => await rds.delAsync(username), MessagesDbOpt)
    } catch (e) {
        logger.error("removeSmsCode error", e.message)
    }
}