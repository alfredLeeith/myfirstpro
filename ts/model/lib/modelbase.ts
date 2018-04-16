import { Sequelize } from "sequelize"

export class ModelBase {
    protected seqz: Sequelize
    protected modelName: string
    protected constructor(seqz: Sequelize, modelName: string) {
        if (!seqz)
            throw new Error("invalid seqz")
        this.seqz = seqz
        this.modelName = modelName
    }
    protected model() { return this.seqz.model(this.modelName) }
}