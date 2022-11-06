import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter} from "react-router-dom";
import App from './App'
import '@/assets/index.css'
import RouterAuth from "./components/RouterAuth";

import {config} from "./config/sys22";

// console.log(config)

document.title = config.projectName
changeFavicon(config.icon)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <RouterAuth>
                <App/>
            </RouterAuth>
        </BrowserRouter>
    </React.StrictMode>
)

function changeFavicon(link){
    let $favicon = document.querySelector('link[rel="icon"]');
    // If a <link rel="icon"> element already exists,
    // change its href to the given link.
    if ($favicon !== null) {
        $favicon.href = link;
        // Otherwise, create a new element and append it to <head>.
    } else {
        $favicon = document.createElement("link");
        $favicon.rel = "icon";
        $favicon.href = link;
        document.head.appendChild($favicon);
    }
};