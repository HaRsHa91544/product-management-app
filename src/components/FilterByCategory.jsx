function FilterByCategory({ categories, category, setCategory }) {
    
    function clearCategory() {
        setCategory('');
    }

    return <div>
        <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}>
            <option value=''>Select the category</option>
            {
                categories.map(c => <option key={c} value={c}>{c}</option>)
            }
        </select>
        <button onClick={clearCategory}>Clear Filter</button>
    </div>;
}

export default FilterByCategory;