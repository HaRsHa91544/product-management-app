import '../styles/header.css';

function Header({ setFormOpened }) {
    return <header>
        <h1 className='header-title'>Product Management App</h1>
        <button
            onClick={() => setFormOpened(true)}
            className='action-positive-btn'>
            + Product
        </button>
    </header>;
}

export default Header;