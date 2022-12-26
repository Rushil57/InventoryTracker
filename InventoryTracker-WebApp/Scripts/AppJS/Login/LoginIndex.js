$(document).ready(function () {
    $('#btnRequestAccess').click(function () {
        var email = $('#txtRequestAccessEmail').val().trim();
        var password = $('#txtRequestAccessPassword').val().trim();
        if (email == '') {
            alert('Enter valid email.');
            return;
        }
        if (password == '') {
            alert('Enter valid password.');
            return;
        }

        $.ajax({
            before: AddLoader(),
            complete: RemoveLoader(),
            url: '/Login/IsValidRequestAccess',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'GET',
            async: false,
            data: { 'email': email, 'password': password },
            success: function (data) {
                if (!data.IsValid) {
                    alert('Invalid User Name');
                    return;
                }
                sessionStorage.clear();
                sessionStorage.setItem("IT-current-request", JSON.stringify(data.Data));
                window.location.href = '/MultiInstance';
                return false;
            }, error: function (ex) { }
        });
    });

    $('#NewUser').click(function () {
        $("#modeltitle").html('Create New User');
        $(".forgot-password").hide();
        $(".create").show();
        $("#txtaddNewUserName").val('');
        if (!$("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
            $("#txtaddNewUserName").siblings("span").addClass('d-none')
        }
        $("#viewUserPassword").show();
    })

    $('.create').click(function () {
        var val = $("#txtaddNewUserName").val().toLowerCase();
        if (!$("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
            $("#txtaddNewUserName").siblings("span").addClass('d-none')
            $("#txtaddNewUserName").siblings("span").text('This field is required');
        }
        if (val == "") {
            if ($("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
                $("#txtaddNewUserName").siblings("span").removeClass('d-none')
                $("#txtaddNewUserName").siblings("span").text('This field is required');
            }
            return;
        }
        else if (!validateEmail(val)) {
            if ($("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
                $("#txtaddNewUserName").siblings("span").removeClass('d-none')
                $("#txtaddNewUserName").siblings("span").text('Enter valid email');
            }
            return;
        }
        AddNewUser(val);
        $("#viewUserPassword").hide();
    });
    function AddNewUser(userName) {
        $.ajax({
            before: AddLoader(),
            complete: RemoveLoader(),
            url: 'Login/CreateNewUser?userName=' + userName,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (!data.IsValid) {
                    return;
                }
                alert(data.Message);

            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    $(document).on('click', '.cancel-modal', function () {
        $("#" + $(this).closest('.modal').attr('id')).hide();
    });

    function validateEmail($email) {
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailReg.test($email);
    }
    $(document).on('click', '.forgot-password', function () {
        var val = $("#txtaddNewUserName").val().toLowerCase();
        if (!$("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
            $("#txtaddNewUserName").siblings("span").addClass('d-none')
            $("#txtaddNewUserName").siblings("span").text('This field is required');
        }
        if (val == "") {
            if ($("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
                $("#txtaddNewUserName").siblings("span").removeClass('d-none')
                $("#txtaddNewUserName").siblings("span").text('This field is required');
            }
            return;
        }
        else if (!validateEmail(val)) {
            if ($("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
                $("#txtaddNewUserName").siblings("span").removeClass('d-none')
                $("#txtaddNewUserName").siblings("span").text('Enter valid email');
            }
            return;
        }
        ResetPassword(val);
        $("#viewUserPassword").hide();
    });

    function ResetPassword(userid) {
        if (userid == undefined || userid == 0 || userid == "") {
            return;
        }
        $.ajax({
            before: AddLoader(),
            complete: RemoveLoader(),
            url: 'Login/ResetPassword?UserEmail=' + userid,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            data: {},
            success: function (data) {
                if (!data.IsValid) {
                    return;
                }
                alert(data.Message);

            },
            error: function (err) {
                console.log(err);
            }
        });
    }

    $(document).on('click', '#ForgotPassword', function (e) {
        $("#modeltitle").html('Forgot Password');
        $(".create").hide();
        $(".forgot-password").show();
        $("#txtaddNewUserName").val('');
        if (!$("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
            $("#txtaddNewUserName").siblings("span").addClass('d-none')
        }
        $("#viewUserPassword").show();
    });
    $('#txtRequestAccessPassword').keypress(function (e) {
        if (e.which == 13 && $("#txtRequestAccessPassword").val().trim() != '') {
            $('#btnRequestAccess').click();
        }
    });
    
})