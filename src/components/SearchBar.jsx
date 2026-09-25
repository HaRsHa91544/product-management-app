import InputField from "./ui/InputField.jsx";

function SearchBar({ searchValue, setSearchValue }) {

    function searchInputHandler(e) {
        const value = e.target.value;
        setSearchValue(value);
    }

    return <InputField
        type={'text'}
        name={'searchInput'}
        id={'searchInput'}
        value={searchValue}
        changeHandler={searchInputHandler}
        placeholder={'Search for product'}
    ></InputField>;
}

export default SearchBar;