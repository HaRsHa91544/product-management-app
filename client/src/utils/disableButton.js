const disableButton = (button) => {
    if (button instanceof HTMLButtonElement) {
        button.disabled = true;
    }
};

export default disableButton;