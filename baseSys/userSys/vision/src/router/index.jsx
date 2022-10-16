import { Navigate } from 'react-router-dom'

import Home from '@/view/Home'
import Login from '@/view/Login'

export default [
    // 路由表
    {
        path: '/home',
        element: <Home />,
        children:[
            {
                path: 'login',
                element: <Login />,
            }
        ]
    },
    {
        path: "",
        element: <Navigate to="home" replace />
    }
]