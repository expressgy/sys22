import BPEMR from './index.module.scss'
import {useState, useEffect} from "react";

export default function Button(props) {
    // console.log(props)

    const [size, setSize] = useState(props.size)
    const [type, setType] = useState(props.type)
    const [loading, setLoading] = useState(props.loading)
    const [disable, setDisable] = useState(props.disable)
    if (props.onClick && typeof props.onClick === 'function') {

    } else {
        if (props.onClick) {
            throw new Error('onClick必须位函数')
        }
    }

    useEffect(() => {
        setSize(props.size ? props.size : 'default')
        setType(props.type ? props.type : 'default')
        setLoading(props.loading ? BPEMR.loading : '')
        setDisable(props.disable ? BPEMR.disable : '')
    }, [props.size, props.type, props.disable, props.loading, props.onClick])

    const sizeOp = {
        default: BPEMR.defaultsize,
        undersize: BPEMR.undersize,
        oversize: BPEMR.oversize,
    }
    const typeOp = {
        default: BPEMR.defaultColor,

        error: BPEMR.eColor,
        error2: BPEMR.e2Color,
        error3: BPEMR.e3Color,

        success: BPEMR.sColor,
        success2: BPEMR.s3Color,
        success3: BPEMR.s2Color,

        warning: BPEMR.wColor,
        warning1: BPEMR.w2Color,
        warning3: BPEMR.w3Color,
    }
    const classname = [BPEMR.BPEMR_button, loading, disable, sizeOp[size], typeOp[type]].join(' ')
    return (
        <div className={BPEMR.BPEMR_button_box}>
            <div className={classname} style={props.style} title={props.disable ? '当前不可用！' : ''} onClick={!props.disable ? props.onClick : () => {
            }}>{props.children}</div>
        </div>
    )
}