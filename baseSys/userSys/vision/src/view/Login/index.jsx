import css from './index.module.scss'
import {userStore, netStore} from "@/store";
import {useEffect, useRef, useState} from "react";
import next from './next.svg';
import Button from "@/components/Button";
import {useNavigate} from "react-router-dom";


export default function Login(){
    //  用户信息
    const [userInfo, setUserInfo] = useState('')
    //  用户输入长度确认
    const [userInfoState, setUserInfoState] = useState('')
    //  登录容器样式
    const [loginStyle, setLoginStyle] = useState(['animate__zoomIn', 'animate__animated', 'animate__faster'].join(' '))
    //  当前页
    const [pageNum, setPageNum] = useState(1)
    //  第一屏样式
    const [page1Style, setPage1Style] = useState(css.page1)
    //  第二屏样式
    const [page2Style, setPage2Style] = useState(css.page2)
    //  登录或者注册
    const [signInOrOut, setSignInOrOut] = useState(true)
    //  请求用户信息存在的状态
    const [checkUserInfoState, setCheckUserInfoState] = useState(true)
    //  登陆方式
    const [loginMethod, setLoginMethod] = useState('')
    //  密码
    const [password, setPassword] = useState('')
    //  验证码
    const [verfCode, setVerfCode] = useState('')
    //  发送验证码按钮状态
    const [sendBut, setSendBut] = useState(false)
    //  路由跳转
    const navigate = useNavigate();


    //  input
    const input1 = useRef()
    const input2 = useRef()
    const input3 = useRef()


    useEffect(() => {
        if(pageNum == 1){
            input1.current.focus()
        }
        if(!signInOrOut){
            setTimeout(() => {
                if(loginMethod == ''){
                    input2.current.focus()
                }else{
                    input3.current.focus()
                }
            },800)
        }
    }, [pageNum,signInOrOut])

    //  用户信息输入
    const userInfoInput = event => {
        if(event.target.value.length >= 8){
            setUserInfoState(css.temNextShow)
        }else if(event.target.value.length < 8){
            if(userInfo.length >= 8){
                setUserInfoState(css.temNextHide)
            }else{
                setUserInfoState('')
            }
        }
        setUserInfo(event.target.value)
    }
    const handleUserInfoKeyDown = event => {
        // console.log(event)
        switch (event.code){
            case 'Enter':
                checkUserInfo()
                break;
            case 'Tab':
                checkUserInfo()
                event.preventDefault()
                break;
        }
    }
    //  密码输入
    const passwordInput = event => {
        setPassword(event.target.value)
    }
    const handlePasswordKeyDown = event => {
        if(event.code == 'Enter'){
            signIn()
        }
    }
    //  验证码输入
    const verfCodeInput = event => {
        setVerfCode(event.target.value)
    }

    //  点击下一步，检验用户信息是否存在
    async function checkUserInfo(){
        if(!userInfoState && checkUserInfoState){
            return
        }
        setCheckUserInfoState(false)
        const state = await netStore.checkOnly({username: userInfo})
        setPage1Style([css.page1, css.temSlideOutLeft].join(' '))
        setPage2Style([css.page2, css.temSlideOutLeft].join(' '))
        setSignInOrOut(state)


    }
    //  返回按钮的状态控制，300ms内不允许点击
    let goBackPage1State = true
    //  返回第一页
    function goBackPage1(){
        if(goBackPage1State){
            goBackPage1State = false
            setTimeout(() => {
                goBackPage1State = true
            },300)
        }else{
            return
        }
        setSignInOrOut(true)
        setCheckUserInfoState(true)
        setPage1Style([css.page1, css.temSlideInLeft].join(' '))
        setPage2Style([css.page2, css.temSlideInLeft].join(' '))
    }
    //  切换登陆方式
    function changeLoginMethod(){
        loginMethod == '' ? setLoginMethod(css.left) : setLoginMethod('')
        loginMethod != '' ? input2.current.focus() : input3.current.focus()
    }
    //  发送验证码
    async function sendEmail(){
        setSendBut(true)
        let status = 60
        const sendEmailInterval = setInterval(() => {
            status--
            if(status == 0){
                setSendBut(false)
                clearInterval(sendEmailInterval)
            }
        },1000)
        const state = await netStore.sendCode({username:userInfo})
        console.log(state)
    }
    //  登录
    let signInState = true
    async function signIn(){
        console.log('点击登录')
        if(!signInState){
            return
        }
        setTimeout(() => {
            signInState = true
        },3000)
        const data = {
            username:userInfo
        }
        if(loginMethod == ''){
            //  密码登录
            data.password = password;
            if(password.length < 8){
                alert('密码长度不正确')
                return
            }
        }else{
            // 验证码登录
            if(password.length != 4){
                alert('验证码格式错误')
                return
            }
            data.code = verfCode;
        }
        const state = await netStore.signIn(data)
        signInState = true
        if(state){
            setLoginStyle(['animate__zoomOut', 'animate__animated', 'animate__faster'].join(' '))
            setTimeout(() => {
                navigate('/')
            },500)
        }else{
            alert('登陆失败')
        }
    }

    return(
        <div className={css.login}>
            <div className={loginStyle}>
                <div className={css.title}>{userStore.config.projectName}</div>
                <div className={css.icon}><img src={userStore.config.icon} alt=""/></div>
                <div>
                    {!signInOrOut && <div onClick={changeLoginMethod}>
                        <div className={loginMethod}></div>
                        <div>密<span style={{width:'1rem',display:'inline-block'}}></span>码</div>
                        <div>验证码</div>
                    </div>}
                </div>
                {/*登录页第一屏，输入用户信息*/}
                <div className={css.loginBox}>
                    <div className={page1Style}>
                        <div><input ref={input1} type="text" onChange={userInfoInput} onKeyDown={handleUserInfoKeyDown} value={userInfo} spellCheck ="false" placeholder={'请输入账户信息'}/></div>
                        <div className={userInfoState}>
                            <div onClick={checkUserInfo}>
                                <img src={next} alt=""/>
                            </div>
                        </div>
                    </div>
                    {/*登录页第二屏，输入验证信息或前往注册*/}
                    <div className={page2Style}>
                        {!signInOrOut &&
                        <div className={css.input}>
                            <div className={loginMethod == '' ? css.temTdShow : css.temTdHide}>
                                <div><input ref={input2} type="password" onChange={passwordInput} onKeyDown={handlePasswordKeyDown} value={password} spellCheck ="false" placeholder={'请输入密码'}/></div>
                            </div>
                            <div className={loginMethod != '' ? css.temTdShow2 : css.temTdHide2}>
                                <div>
                                    <div><input ref={input3} type="text" onChange={verfCodeInput} onKeyDown={handlePasswordKeyDown} value={verfCode} spellCheck ="false" placeholder={'请输入验证码'}/></div>
                                    <div><Button size='undersize' type='warning1' onClick={() => {
                                        sendEmail()}} disable={sendBut != 0}>发送验证码</Button></div>
                                </div>
                            </div>
                        </div>}
                        <div className={css.button}>
                            <div onClick={goBackPage1}>返回</div>
                            <div>
                                {!signInOrOut && <div onClick={signIn}>登录</div>}
                                {signInOrOut && <div>注册</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}