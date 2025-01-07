$(document).ready(function() {
    // Load saved phone number from localStorage on page load
    
    $('#isPwdVisible').on('click', function() {
        var x = $('#password');
        if (x.attr('type') === 'password') {
          x.attr('type', 'text');
        } else {
          x.attr('type', 'password');
        }
      });

    const savedName = localStorage.getItem('name');
    if (savedName) {
        $('#name').val(savedName);
    }
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
        $('#email').val(savedEmail);
    }
    const savedPhone = localStorage.getItem('phone');
    if (savedPhone) {
        $('#phone').val(savedPhone);
    }
    const savedBirthday = localStorage.getItem('birthday');
    if (savedBirthday) {
        $('#birthday').val(savedBirthday);
    }
    
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', function(event) {
        // event.preventDefault(); // Prevent form submission for demonstration purposes
        localStorage.setItem('name', $('#name').val());
        localStorage.setItem('email', $('#email').val());
        localStorage.setItem('phone', $('#phone').val());
        localStorage.setItem('birthday', $('#birthday').val());
        // localStorage.setItem('password', $('#password').val()); // Save the phone number to localStorage
        // Redirect or perform other actions here
        // alert('Form submitted!'); // Example action

    });
});