var global_all_user_data = [];
var global_admin_user_data = [];
var global_manager_user_data = [];
var global_other_user_data = [];
$(document).ready(function () {
    $('#selectedMenu').text($('#menuUserMaster').text());
    GetAllUsers();

    $(document).on('click', '.all-users-list li', function () {
        $(".all-users-list li").removeClass("active");
        $(this).addClass("active");
    });

    $(document).on('click', '#btnLogout', function () {
        $.ajax('Login/Signout');
        sessionStorage.clear();
        window.location = "/Login";
    });

    $(document).on('click', '.fa-cog', function (event) {
        var userid = this.id;
        $("#ResetPasswordUserId").val(userid);
        $("#ResetPasswordUser").show();
    });

    $(document).on('click', '.all-users-list-actions button[type="button"]:first', function () {
        $("#txtaddNewUserName").val('');
        if (!$("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
            $("#txtaddNewUserName").siblings("span").addClass('d-none')
        }
        $("#addNewUser").show();
    });

    $(document).on('click', '.delete-modal', function () {
        $("#" + $(this).closest('.modal').attr('id')).hide();
    });

    $(document).on('click', '#addNewUser button:last', function () {
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

        if (global_all_user_data.length > 0) {
            var filterArr = filterArr = global_all_user_data.filter(v => v.USER_EMAIL.toLowerCase() === val.toLowerCase());
            if (filterArr.length > 0) {
                if ($("#txtaddNewUserName").siblings("span").hasClass('d-none')) {
                    $("#txtaddNewUserName").siblings("span").removeClass('d-none')
                    $("#txtaddNewUserName").siblings("span").text('This email is already exist');
                }
                return;
            }
        }
        AddNewUser(val);
        $("#addNewUser").hide();
    });

    $(document).on('click', '.all-users-list-actions button[type="button"]:last', function () {
        if ($(".all-users-list li.active").length > 0) {
            $("#deleteConfirmationId").val($(".all-users-list li.active").attr('id').split('_')[2]);
            $("#deleteConfirmationUser").show();
        }
    });

    $('input#txtSearchEmailUserMaster').keyup(function () {
        var searchText = $(this).val();
        $('#users > li').each(function () {

            var currentLiText = $(this).text(),
                showCurrentLi = currentLiText.indexOf(searchText) !== -1;

            $(this).toggle(showCurrentLi);

        });
    });

    $(document).on('click', '#deleteConfirmationUser button.btn-danger', function () {
        RemoveUser($("#deleteConfirmationId").val());
        $("#deleteConfirmationId").val('');
        $("#deleteConfirmationUser").hide();
    });
    $(document).on('click', '#deleteConfirmationUser button.btn-warning', function () {

        $("#deleteConfirmationId").val('');
        $("#deleteConfirmationUser").hide();
    });

    $(document).on('click', '#ResetPasswordUser button.btn-primary', function () {
        ResetPassword($("#ResetPasswordUserId").val());
        $("#ResetPasswordUserId").val('');
        $("#ResetPasswordUser").hide();
    });
    $(document).on('click', '#ResetPasswordUser button.btn-default', function () {

        $("#ResetPasswordUserId").val('');
        $("#ResetPasswordUser").hide();
    });

});

function RemoveUser(id) {
    if (id == undefined || id == 0 || id == "") {
        return;
    }
    $.ajax({
        beforeSend: function () {
            AddLoader();
        },
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: 'UserMaster/DeleteUser?id=' + id,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {},
        success: function (data) {
            if (!data.IsValid) {
                return;
            }
            GetAllUsers();
        },
        error: function (err) {
            console.log(err);
        }
    });
}
function ResetPassword(userid) {
    if (userid == undefined || userid == 0 || userid == "") {
        return;
    }
    $.ajax({
        beforeSend: function () {
            AddLoader();
        },
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: 'UserMaster/ResetPassword?UserEmail=' + userid,
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
function validateEmail($email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test($email);
}

function GetRoleId(panel) {
    switch (panel) {
        case 'admin-panel':
            return 1;
        case 'manager-panel':
            return 2;
        case 'other-user-panel':
            return 3;
    }
}

function AddNewUser(userName) {
    $.ajax({
        beforeSend: function () {
            AddLoader();
        },
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: 'UserMaster/AddNewUser?userName=' + userName,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data) {
            if (!data.IsValid) {
                return;
            }
            GetAllUsers();
            alert(data.Message);

        },
        error: function (err) {
            console.log(err);
        }
    });
}

function GetAllUsers() {
    $.ajax({
        beforeSend: function () {
            AddLoader();
        },
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: 'UserMaster/GetAllUsers',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: {},
        success: function (data) {
            if (!data.IsValid) {
                return;
            }
            global_all_user_data = JSON.parse(data.allUsers);
            BindAllUsers(global_all_user_data);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function BindAllUsers(data) {
    $("#txtSearchEmailUserMaster").val('');
    var _html = ``;
    $(".all-users-list ul").html('');
    data.sort(function (a, b) { return a.ID - b.ID });
    for (var i = 0; i < data.length; i++) {
        _html += `<li class="ui-state-default" id="all_user_` + data[i].ID + `">` + data[i].USER_EMAIL + `<img class = 'fa fa-key fa-cog' id="` + data[i].USER_EMAIL + `" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAABT0lEQVRYhe2WTU7DMBCFPxCiElKDKLChO07ALdiyKRJHaIAekgooiwILFogl3IB2nbLIRDKWf5LGA5HgSVYsz4zfy4zHCfzjr2PDsbb6Sc5NZbIotgI2V3bawJnZWAZWRqBv3gqdLgF8L4NvriZAuxuAjpegE12gjtghTIkBcFzHMVmP14FmCXrABJgBSxkz4ArYDgWmyMAQeDb2sseT+KgI6Bnkb8AIOAD6wBnwKrZHPJloK2BikB867HvAu/hcagh4kPgLa/0WmMp8JD73GgIWEj+w1qfAjcwz8fnUELCU+Czgs1sJSN2GObAjm4cunVN5vriM62YgBwoZ44DfPvAhHHkqASHyE8oWzIBzg3xOpA1jow75WNbt2Dlw5HubpgIqAjudFXlBeTAXwJ34Ba/iprAFmSIL4DolWRMBBeWHJ4gUfz2+A1tr71//I/oCsWyCV9icYoQAAAAASUVORK5CYII=" style="height:24px;width:24px;" title="Reset Password"></i></li>`;
    }
    $(".all-users-list ul").append(_html);
    if (data.length > 0) {
        $(".all-users-list ul li:first").addClass("active");
    }
}

function getUniqueValuesTest(array, key) {
    var result = array.filter(function (el, i, x) {
        return x.some(function (obj, j) {
            return obj[key] === el[key] && (x = j);
        }) && i == x;
    });

    return result;
}

