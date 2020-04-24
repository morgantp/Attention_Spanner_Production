//console.log('test');

const emailField = document.querySelector('#email');
const usernameField = document.querySelector('#username');
const signUpSubmit = document.querySelector('#signUpSubmit');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');

signUpSubmit.addEventListener('click', (e) =>{
    if(emailField.value === ''){
        e.preventDefault();
        window.alert('Sign Up Requires Email Address')
    }
    
    if(usernameField.value === ''){
        e.preventDefault();
        window.alert('Sign Up Requires Username');
    }

    if(password.value != confirmPassword.value){
        e.preventDefault();
        window.alert('Passwords Do Not Match');
    }    
});

function openForm() {
    document.getElementById("createAccount").style.display = "table";
}

function closeForm() {
    document.getElementById("createAccount").style.display = "none";
}