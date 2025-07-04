// Toggle password visibility
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
let passwordVisible = false;
togglePassword.addEventListener('click', function () {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? 'text' : 'password';
    this.src = passwordVisible
        ? 'assets/icons/preview.svg' // You can use a different icon for "hide" if you have one
        : 'assets/icons/preview.svg';
});

// Radio button functionality
document.querySelectorAll('input[name="school-type"]').forEach(radio => {
    radio.addEventListener('change', function () {
        // You can add logic here to show/hide different form fields based on selection
        console.log('Selected:', this.value);
    });
});

// Form submission
document.querySelector('.login-button').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Login functionality would be implemented here');
});

function updateRadioImages() {
    const district = document.getElementById('district');
    const independent = document.getElementById('independent');
    document.getElementById('radio-district-img').src = district.checked
        ? 'assets/icons/radio-button-on.svg'
        : 'assets/icons/radio-button-off.svg';
    document.getElementById('radio-independent-img').src = independent.checked
        ? 'assets/icons/radio-button-on.svg'
        : 'assets/icons/radio-button-off.svg';
}

document.getElementById('district').addEventListener('change', updateRadioImages);
document.getElementById('independent').addEventListener('change', updateRadioImages);

// Initialize on load
updateRadioImages();

const rememberCheckbox = document.getElementById('remember');
const rememberImg = document.getElementById('remember-img');

function updateCheckboxImg() {
    rememberImg.src = rememberCheckbox.checked
        ? 'assets/icons/checkbox-checked.svg'
        : 'assets/icons/checkbox-unchecked.svg';
}

rememberCheckbox.addEventListener('change', updateCheckboxImg);
rememberImg.addEventListener('click', function () {
    rememberCheckbox.checked = !rememberCheckbox.checked;
    updateCheckboxImg();
});

// Initialize on load
updateCheckboxImg();