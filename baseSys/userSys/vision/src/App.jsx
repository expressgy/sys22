import {useState} from 'react'
import { useRoutes } from 'react-router-dom'
import indexRouterList from "@/router"


export default function App() {
    const indexRoute = useRoutes(indexRouterList)
    return (
        <div className="App">
            {indexRoute}
        </div>
    )
}

