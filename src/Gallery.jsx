import {useEffect, useState} from 'react';


function GalleryPage() {
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
                    <a href="#">learn more</a>
                </div>
                <canvas className="gallery-view"></canvas>
            </div>
        </>
    );
}

export default GalleryPage;