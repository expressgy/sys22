import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BPEMR from './index.module.scss';
import closeSvg from './close.svg'

export default function Dialog(props){
    const modalRoot = document.body.querySelector('#modalRoot')
    let node = window.document.createElement("div");
    if(modalRoot){
        node = modalRoot;
    }else{
        node.id='modalRoot'
        window.document.body.appendChild(node)
    }

    const [state, setState] = useState(props.state)
    if(typeof props.width === 'number' || Number(props.width) != 'NaN'){

    }else{
        throw new Error('width必须为数字')
    }
    const [width, setWidth] = useState(Number(props.width))

    const [temCloseAnimation, settemCloseAnimation] = useState(BPEMR.temModalShow)

    useEffect(() => {
        setState(props.state)
        setWidth(props.width)
        if(state){
            modalRoot.style.animation = ''
            modalRoot.style.display = 'flex'
        }else{
            modalRoot.style.display = 'none'
            settemCloseAnimation(BPEMR.temModalShow)
        }
    })

    useEffect(() => {
        modalRoot.style.animation = 'modalRootHide  ease-in-out 500ms forwards'
    },[temCloseAnimation])



    if(!props.close){
        throw new Error('缺少弹窗关闭参数。')
    }else if(typeof props.close != 'function'){
        throw new Error('弹窗必须返回关闭程序。')
    }



    function close(){
        settemCloseAnimation(BPEMR.temModalHide)
        setTimeout(() => {
            props.close(false)
        }, 500)
    }

    const className = [BPEMR.BPEMR_Dialog_Tem, temCloseAnimation].join(' ')

    return createPortal(
        <div className={className} style={{width:width + 'px', height:width * 0.618 + 'px'}}>
            <div className={BPEMR.close} onClick={close}><img src={closeSvg} alt=""/></div>
            <div>{props.children}</div>
        </div>,
        node
    );
}