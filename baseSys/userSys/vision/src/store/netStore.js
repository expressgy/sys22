import {observable, action, computed, makeObservable} from "mobx";
import {config} from "@/config/sys22";
import {userStore} from "./index";

import {net} from "@/api";


class NetStore {
    //  系统配置
    // config = config;

    constructor() {
        // mobx6 和以前版本这是最大的区别
        makeObservable(this, {
            // config: observable,
            // name: observable,
            // sex: observable,
            // userObj: observable,
            // setName: action,
            // titleName: computed
        });

    }

    //  用户名查重
    checkOnly(data) {
        return new Promise(res => {
            net.get('/will/checkOnly', data).then(
                response => {
                    console.log(response)
                    res(response.status)
                },
                e => {
                    console.log(e)
                }
            )
        })
    }

    //  登录
    signIn(data) {
        return new Promise(res => {
            net.post('/will/signIn', data).then(
                response => {
                    console.log(response)
                    res(response.status)
                    if (response.status) {
                        userStore.setToken(response.data.token)
                    }
                },
                e => {
                    console.log(e)
                }
            )
        })
    }

    //  发送验证码
    sendCode(data, type = 'signIn') {
        return new Promise(res => {
            net.get('/will/sendCode', {
                ...data,
                type
            }).then(
                response => {
                    console.log(response)
                    res(response.status)
                },
                e => {
                    console.log(e)
                }
            )
        })
    }

    // setName(v) {
    //     console.log('触发action');
    //     this.name = v;
    // }
    // setUserObj(obj) {
    //     this.userObj = obj;
    // }
    //
    // get titleName(){
    //     return this.name+'___111';
    // }
    // get userObject() {
    //     return this.userObj;
    // }
}

export default NetStore