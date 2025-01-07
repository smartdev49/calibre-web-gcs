(function(window){
    $('#login_otp').on('click', function(){
        $('#divsendotp').show();
    });

    $('#sendOTP').on('click', function(){
        let csrf_token = $("input[name='csrf_token']").val();
        $.ajax({
            
            url: $('#otp_url').val(),
            type: 'POST',
            header: {
                'X-CSRFToken': csrf_token
            },
            data: {
                type: 1,
                phone: $("#phone_number").val()
            },
            success: (res) => {
                $('#divsendotp').hide()
                $("#divverifyotp").show()
                $('#opt_msg_info').html('')
            },
            error: (res) => {
                $('#opt_msg_info').html(res["responseJSON"]['msg'])
            }
        });
    });
    $('#verifyOTP').on('click', function(){
        let csrf_token = $("input[name='csrf_token']").val();
        $.ajax({
            
            url: $('#otp_url').val(),
            type: 'POST',
            header: {
                'X-CSRFToken': csrf_token
            },
            data: {
                type: 2,
                otp: $("#input_otp").val(),
            },
            success: (res) => {
                location.href = ''
                $('#opt_msg_info').html('')
            },
            error: (res) => {
                $('#divsendotp').show()
                $("#divverifyotp").hide()
                $('#opt_msg_info').html(res["responseJSON"]['msg'])
            }
        });
    });
}(window));