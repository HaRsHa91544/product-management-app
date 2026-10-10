import InputField from "./ui/InputField.jsx";
import '../styles/search-bar.css';

function SearchBar({ searchValue, setSearchValue }) {

    function searchInputHandler(e) {
        const value = e.target.value;
        setSearchValue(value);
    }

    return <div className="search-container">
        <InputField
            className='input-field'
            type={'text'}
            name={'searchInput'}
            id={'searchInput'}
            value={searchValue}
            changeHandler={searchInputHandler}
            placeholder={'Search for product'}
        ></InputField>
    </div>;
}

export default SearchBar;