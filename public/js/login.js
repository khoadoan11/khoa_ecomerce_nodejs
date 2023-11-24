const formEle = document.querySelector('.login-form');
const emailEle = formEle.querySelector('input[name="email"]')
const passwordEle = formEle.querySelector('input[name ="password"]')

formEle.addEventListener('submit', async (e) =>{
    e.preventDefault();
    console.log(emailEle.value, passwordEle.value);
    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: emailEle.value,
            password: passwordEle.value
        })
    })

    if(!response.ok){
        return alert('email or password is incorrect!')
    }

    window.location.href = '/';

})