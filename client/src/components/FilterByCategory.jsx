import '../styles/filter-by-category.css';

function FilterByCategory({ categories, category, setCategory }) {

    function clearCategory() {
        setCategory('');
    }

    return <div className="filter-by-category-container">
        <select
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}>
            <option value=''>Select the category</option>
            {
                categories.map(c => <option key={c} value={c}>{c}</option>)
            }
        </select>
        <button
            className='action-negative-btn'
            onClick={clearCategory}>
            Clear
        </button>
    </div>;
}

export default FilterByCategory;