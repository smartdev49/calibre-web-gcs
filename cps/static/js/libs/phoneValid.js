
$(document).ready(function() {
    const phoneInput = document.getElementById('phone');
    const hint = document.getElementById('hint');

    const regex = /^\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    
    phoneInput.addEventListener('input', function() {
        if(phoneInput.value != ''){
            if (!regex.test(phoneInput.value)) {
                hint.style.display = 'block';
            }else {
                hint.style.display = 'none';
                console.log('regex: match')
            }
        }else {
            hint.style.display = 'none';
            console.log('regex: match')
        }
    });
})