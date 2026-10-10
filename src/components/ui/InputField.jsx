function InputField({ className, label, type, id, name, value, placeholder, changeHandler,
    readOnly = false, errors }) {
    return <div>
        <label
            htmlFor={id}
        >{label}
        </label>

        <input
            className={className}
            type={type}
            name={name}
            id={id}
            value={value}
            onChange={changeHandler}
            readOnly={readOnly}
            placeholder={placeholder}
        />

        {errors && <p>{errors}</p>}
    </div>;
}

export default InputField;