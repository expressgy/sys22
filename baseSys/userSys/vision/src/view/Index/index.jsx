import css from './index.module.scss'
import background from './background.jpg'
import { useNavigate } from "react-router-dom";
import 'animate.css'
import {useState} from "react";



export default function Index(){
    const navigate = useNavigate();
    const [goOutAnimate, setGoOutAnimate] = useState('animate__fadeInDown')
    function go(){
        setGoOutAnimate('animate__fadeOutUp');
        setTimeout(() => {
            navigate('/login')
        },900)
    }
    return (<div className={[css.Index, 'animate__animated', goOutAnimate].join(' ')} onClick={go} >
        <div>
            <div className={css.title}>幽意</div>
        </div>
    </div>)
}