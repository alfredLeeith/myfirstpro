let sequelize: any

export function setSeqz(seqz: any) {
    sequelize = seqz
}

export function getSeqz() {
    return sequelize
}
