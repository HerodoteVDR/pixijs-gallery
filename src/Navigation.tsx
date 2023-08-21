import React from "react";
function Navigation() {
    return (
        <>
            <nav className="c-mainnav o-container">
                <div><a href="#"><img width="100" src="https://20stm.com/_nuxt/img/20stm_logo.08a6418.png" alt=""/></a></div>
                <ul className="c-nav-list">
                    <li><a href="/" className="c-nav--link">Home</a></li>
                    <li><a href="/about" className="c-nav--link">About</a></li>
                    <li><a href="/works" className="c-nav--link">Works</a></li>
                    <li><a href="/values" className="c-nav--link">Our values</a></li>
                    <li><a href="/contacts" className="c-nav--link c-contact--button">Contact</a></li>
                </ul>
            </nav>
        </>
    )
}

export default Navigation;