function SearchBar({ searchValue, setSearchValue }) {

    function searchInputHandler(e) {
        const value = e.target.value;
        setSearchValue(value);
    }

    return <input type="text"
        placeholder="Search for product"
        value={searchValue}
        onChange={searchInputHandler}>
    </input>
}

export default SearchBar;