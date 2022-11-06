import {useNavigate, useLocation} from "react-router-dom";
import {useEffect} from "react";

export default function RouterAuth(props){
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const path = window.location.pathname
        // console.log(location)
        if(path == '/home'){
            navigate('/home/login')
        }
    })
    return props.children
}