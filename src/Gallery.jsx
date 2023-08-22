import {useEffect, useState} from 'react';
import React from "react";

function GalleryPage() {
    let currentMedia;
    const [isLoaded, setLoaded] = useState(false)
    useEffect(() => {
        const baliseScript = document.createElement("script")
        baliseScript.src = "./scripts/gallery.js"
        baliseScript.type = "module"
        baliseScript.addEventListener("load", () => setLoaded(true))
        document.body.appendChild(baliseScript)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            // ...
        }
    }, [isLoaded])
    
    return (
        <>
            <div className="o-container" id="gallery-container">
                <div className="c-center_canvas-title">
                    <h1 className="splashscreen-title"></h1>
                    <a className="c-project--link" href="/smallthings">learn more</a>
                </div>
                <canvas className="gallery-view"></canvas>
            </div>
        </>
    );
}

export default GalleryPage;