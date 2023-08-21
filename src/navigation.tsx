function Nav() {
    return (
        <>
            <nav className="c-mainnav">
                <ul className="c-nav-list">
                    <li><a href="https://20stm.com/" className="c-nav--link">Logo</a></li>
                    <li><a href="/" className="c-nav--link">Home</a></li>
                    <li><a href="/about" className="c-nav--link">About</a></li>
                    <li><a href="/works" className="c-nav--link">Works</a></li>
                    <li><a href="/values" className="c-nav--link">Our values</a></li>
                    <li><a href="/contacts" className="c-nav--link">Contact</a></li>
                </ul>
            </nav>
        </>
    )
}

export default Nav