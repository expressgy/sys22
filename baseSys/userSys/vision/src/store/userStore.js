import { observable, action, computed, makeObservable} from "mobx";
import {config} from "@/config/sys22";


class UserStore {
    //  系统配置
    config = config;
    token = '';
    name = 'kangkang000';
    sex =  '男';
    userObj = {
        name: 'kangkang000',
        age: 23,
        token: '12345689'
    }

    constructor() {
        // mobx6 和以前版本这是最大的区别
        makeObservable(this, {
            config: observable,
            token:observable,

            name: observable,
            sex: observable,
            userObj: observable,
            setName: action,
            titleName: computed
        });

    }

    setToken(token){
        window.localStorage.setItem('token',token)
        this.token = token
    }
    get token(){
        if(!this.token){
            this.token = window.localStorage.getItem('token')
            return this.token
        }else{
            return this.token
        }
    }



    setName(v) {
        console.log('触发action');
        this.name = v;
    }
    setUserObj(obj) {
        this.userObj = obj;
    }

    get titleName(){
        return this.name+'___111';
    }
    get userObject() {
        return this.userObj;
    }
}

export default UserStore