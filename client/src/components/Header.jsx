import { useProductFormOpen } from '../context/ProductFormOpenContext.jsx';
import '../styles/header.css';

function Header() {
    const { setFormOpened } = useProductFormOpen();
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