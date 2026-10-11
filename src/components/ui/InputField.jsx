function InputField({ label, type, id, name, value, placeholder, changeHandler,
    readOnly = false, errors }) {
    return <div className="input-box">
        <label
            className="input-label"
            htmlFor={id}
        >{label}
        </label>

        <input
            className='input-field'
            type={type}
            name={name}
            id={id}
            value={value}
            onChange={changeHandler}
            readOnly={readOnly}
            placeholder={placeholder}
        />

        {errors && <span className="input-error">{errors}</span>}
    </div>;
}

export default InputField;