$(document).ready(function () {
    $('#textMenu').text($('#resetPass').text());
    $(document).on('click', '#btnResetPassword', function (e) {
        var el = document.getElementById('oldPassword');
        if (el != null) {
            var oldpassword = $("#oldPassword").val().trim();
            var newpassword = $("#newPassword").val().trim();
            var confirmpassword = $("#confirmPassword").val().trim();

            if (oldpassword == '') {
                $("#oldpassworderror").html('Old Password cannot be empty.');
                return;
            } else if (newpassword == '') {
                $("#newpassworderror").html('New Password cannot be empty.');
                return;
            } else if (confirmpassword == '') {
                $("#confirmpassworderror").html('Confirm Password cannot be empty.');
                return;
            } else if (newpassword != confirmpassword) {
                $("#newpassworderror").html('New Password And confirm password should be same.');
                $("#confirmpassworderror").html('New Password And confirm password should be same.');
                return;
            } else if (newpassword != '' && newpassword != null && oldpassword != '' && oldpassword != null) {
                if (newpassword == confirmpassword) {
                    if (newpassword.length < 6 || newpassword.length > 16) {
                        $("#newpassworderror").html('Password length must be between 6 to 16 character.');
                        $("#confirmpassworderror").html('Password length must be between 6 to 16 character.');
                        return;
                    }
                }
            }
            changePassword(oldpassword, newpassword)
        }
        else {
            var oldpassword = "";
            var newpassword = $("#newPassword").val().trim();
            var confirmpassword = $("#confirmPassword").val().trim();
            if (newpassword == '') {
                $("#newpassworderror").html('New Password cannot be empty.');
                return;
            } else if (confirmpassword == '') {
                $("#confirmpassworderror").html('Confirm Password cannot be empty.');
                return;
            } else if (newpassword != confirmpassword) {
                $("#newpassworderror").html('New Password And confirm password should be same.');
                $("#confirmpassworderror").html('New Password And confirm password should be same.');
                return;
            } else if (newpassword != '' && newpassword != null && oldpassword != '' && oldpassword != null) {
                if (newpassword == confirmpassword) {
                    if (newpassword.length < 6 || newpassword.length > 16) {
                        $("#newpassworderror").html('Password length must be between 6 to 16 character.');
                        $("#confirmpassworderror").html('Password length must be between 6 to 16 character.');
                        return;
                    }
                }
            }
            changePassword(oldpassword, newpassword);
        }

    });
    function changePassword(oldpassword, newpassword) {
        $.ajax({
            beforeSend: function () {
                AddLoader();
            },
            complete: function () {
                setTimeout(function () {
                    RemoveLoader();
                }, 500);
            },
            url: 'ResetPassword/ChangePassword',
            data: {
                'oldPassword': oldpassword,
                'newPassword': newpassword
            },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'GET',
            async: false,
            success: function (data) {
                if (!data.IsValid) {
                    alert(data.Message);
                    return;
                } else {
                    alert(data.Message);
                    sessionStorage.clear();
                    $.ajax('Login/Signout');
                    window.location = "/Login";
                }

            },
            error: function (err) {
                alert('Something went wrong');
                console.log(err);
            }
        });
    }
    $(document).on('click', '#btnCancel', function (e) {
        sessionStorage.clear();
        $.ajax('Login/Signout');
        window.location = "/Login";
    });

    $("#oldPassword").keyup(function () {
        var oldpassword = $("#oldPassword").val().trim();
        if (oldpassword != '') {
            $("#oldpassworderror").html('');
        }
    });
    $("#newPassword").keyup(function () {
        var newpassword = $("#newPassword").val().trim();
        var confirmpassword = $("#confirmPassword").val().trim();
        if (newpassword.length < 6 || newpassword.length > 16) {
            $("#newpassworderror").html('Password length must be between 6 to 16 character.');
        } else {
            $("#newpassworderror").html('');
        }
        if (confirmpassword != '') {
            if (newpassword != confirmpassword) {
                $("#newpassworderror").html('New Password And confirm password should be same.');
            } else {
                $("#confirmpassworderror").html('');
                $("#newpassworderror").html('');
            }
        }
    });
    $("#confirmPassword").keyup(function () {
        var newpassword = $("#newPassword").val().trim();
        var confirmpassword = $("#confirmPassword").val().trim();
        if (confirmpassword.length < 6 || confirmpassword.length > 16) {
            $("#confirmpassworderror").html('Password length must be between 6 to 16 character.');
        } else {
            $("#confirmpassworderror").html('');
        }
        if (newpassword != '') {
            if (newpassword != confirmpassword) {
                $("#confirmpassworderror").html('New Password And confirm password should be same.');
            } else {
                $("#confirmpassworderror").html('');
                $("#newpassworderror").html('');
            }
        }
    });
});