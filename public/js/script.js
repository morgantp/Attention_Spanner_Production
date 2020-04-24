//console.log('test');

const usernameField = document.querySelector('#username');
const signUpSubmit = document.querySelector('#signUpSubmit');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');

signUpSubmit.addEventListener('click', (e) =>{
    if(usernameField.value === ''){
        e.preventDefault();
        window.alert('Form Requires Username');
    }

    if(password.value != confirmPassword.value){
        e.preventDefault();
        window.alert('Passwords Do Not Match');
    }
    
});