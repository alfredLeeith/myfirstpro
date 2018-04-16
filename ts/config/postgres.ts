export const pgOpt = {
    database: "AddressBook",
    username: "postgres",
    password: "123456",
    options: {
        dialect: "postgres",
        host: "192.168.0.91",
        port: 5432,
        timezone: "+8:00",
        pool: {
            maxConnections: 5,
            minConnections: 0,
            maxIdleTime: 100000
        }
    }
}
