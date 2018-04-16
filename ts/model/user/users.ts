import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["micromall", "users"]
const modelName = `${schema}.${table}`
export const defineFunction = function (sequelize: Sequelize) {
    Users.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        nickname: DataTypes.CHAR(128),
        username: DataTypes.CHAR(128),
        sex: DataTypes.CHAR(12),
        phone: DataTypes.CHAR(24),
        email: DataTypes.CHAR(64),
        address: DataTypes.TEXT,
        ext: DataTypes.JSONB,
        created: DataTypes.TIME,
        modified: DataTypes.TIME,
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table
        })
}

export class Users extends ModelBase {
    private static instance: Users
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Users.instance)
            Users.instance = new Users(seqz, modelName)
        return Users.instance
    }


    public async  findByContactName(username: string) {
        let res = await this.model().findOne({ where: { username: username } })
        return res ? res.get() : undefined
    }

    public async  getByPhone(phone: string) {
        let res = await this.model().findOne({ where: { phone: phone } })
        return res ? res.get() : undefined
    }

    public async  insertContact(obj: Object) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    public async  deleteContact(uuid: any) {
        let res = await this.model().destroy({ where: { uuid: uuid } })
        return res ? res : undefined
    }

    public async  findContactByUuid(uuid: string) {
        let res = await this.model().findOne({ where: { uuid: uuid } })
        return res ? res.get() : undefined
    }

    public async  updateContact(uuid: any, obj: Object) {
        let [number, res] = await this.model().update(obj, { where: { uuid: uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async  getAll(cursor: number, limit: number) {
 	let res = await this.model().findAll({ offset:cursor,LIMIT:limit});
        return res ? res : undefined
    }
}