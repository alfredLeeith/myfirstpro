import * as winston from "winston"
import * as moment from "moment"
const [Console, File] = [winston.transports.Console, winston.transports.File]

// https://www.npmjs.com/package/winston
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
const logdir = "logs"

function timestamp() {
    return moment().format("YYYYMMDD HH:mm:ss")
}

export const config = {
    transports: [
        new Console({
            level: "silly",
            timestamp: timestamp
        }),
        new File({
            json: false,
            filename: `${logdir}/debug.log`,
            name: "debug-file",
            maxFiles: 8,
            maxsize: 1024 * 1024,
            // zippedArchive: true,
            level: "debug",
            tailable: true,
            timestamp: timestamp
        }),

        new File({
            json: false,
            filename: `${logdir}/warn.log`,
            name: "warn-file",
            maxFiles: 8,
            maxsize: 1024 * 1024,
            // zippedArchive: true,
            level: "warn",
            tailable: true,
            timestamp: timestamp
        })
    ],
    exceptionHandlers: [
        new File({
            filename: `${logdir}/exceptions.log`,
        })
    ]
}
