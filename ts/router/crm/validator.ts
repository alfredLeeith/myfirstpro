const uuid = {
    isUUID: {
        errmsg: "uuid有误！",
        param: 1
    }
}

const username = {
    isLength: {
        errmsg: "用户名错误！",
        param: [1, 20]
    }
}

const phone = {
    isLength: {
        errmsg: "手机号码错误！",
        param: [11, 11]
    }
}
const password = {
    isLength: {
        errmsg: "密码长度错误！",
        param: [4, 64]
    }
}

const page = {
    isLength: {
        errmsg: "分页开始参数有误",
        param: [0, 8]
    }
}

const count = {
    isLength: {
        errmsg: "分页长度有误",
        param: [0, 8]
    }
}


export const UsersValidator = {
    orderuuid: {
        orderuuid: uuid,
    },
    uuid: {
        uuid: uuid,
    },
    login: {
        username: username,
        password: password
    },
    create: {
        username,
        password,
        phone,
    },
    findAll: {
        page: page,
        count: count
    }
}
