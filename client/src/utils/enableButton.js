const enableButton = (button) => {
    if (button instanceof HTMLButtonElement) {
        button.disabled = false;
    }
};

export default enableButton;