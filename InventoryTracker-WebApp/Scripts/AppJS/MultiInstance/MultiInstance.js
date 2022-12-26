var global_all_instance_data = [];
$(document).ready(function () {
    var selectedInstance = '';
    $('#btnInstanceLoad').prop('disabled', true);
    $('#btnInstanceRemove').prop('disabled', true);
    GetAllInstance();
    var email = $("#hdnEmail").val();
    $(document).on('click', '.all-instance-list li', function () {
        $(".all-instance-list li").removeClass("active");
        $(this).addClass("active");
        var filterArr = global_all_instance_data.filter(v => v.instance_name.trim() === $(this).text());
        if (filterArr.length > 0) {
            selectedInstance = $(this).text();
            $("#txtInstance_Notes").val(filterArr[0].instance_note);
            $('#btnInstanceLoad').prop('disabled', false);
            $('#btnInstanceRemove').prop('disabled', false);
        }

    });

    $(document).on('click', '#btnInstanceLoad', function () {
        var instance = $('ul.instanceUL').find('li.active')

        if (email == '') {
            alert('Email not Found');
            return;
        }
        if (selectedInstance == '') {
            alert('Please Select Instance');
            return;
        }
        $.ajax({
            url: 'Login/HomeRequestAccess?email=' + email + '&instance_name=' + selectedInstance,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {},
            success: function (data) {
                if (!data.IsValid) {
                    alert('Invalid Email : ' + email);
                    return;
                }
                sessionStorage.clear();
                sessionStorage.setItem("flash-current-request", JSON.stringify(data.Data));
                window.location.href = '/Reports';
            },
            error: function (err) {
                alert('Something went wrong');
                console.log(err);
            }
        });
    });

    $(document).on('click', '#btnCreateInstance', function () {
        $("#txtaddNewUserName").val('');
        if (!$("#txtcreateNewInstance_Name").siblings("span").hasClass('d-none')) {
            $("#txtcreateNewInstance_Name").siblings("span").addClass('d-none')
        }
        $("#txtcreateNewInstance_Name").val('');
        $("#txtcreateNewInstance_Notes").val('');
        $("#createNewInstance").show();
    });

    $(document).on('click', '#createNewInstance button:last', function () {
        var val = $("#txtcreateNewInstance_Name").val().trim();
        var validate = Validate_alphanumeric(val);
        if (validate != "Success") {
            $("#txtcreateNewInstance_Name").siblings("span").addClass('d-none')
            $("#txtcreateNewInstance_Name").siblings("span").text(validate);
            return;
        }
        if (!$("#txtcreateNewInstance_Name").siblings("span").hasClass('d-none')) {
            $("#txtcreateNewInstance_Name").siblings("span").addClass('d-none')
            $("#txtcreateNewInstance_Name").siblings("span").text('This field is required');
        }
        if (val == "") {
            if ($("#txtcreateNewInstance_Name").siblings("span").hasClass('d-none')) {
                $("#txtcreateNewInstance_Name").siblings("span").removeClass('d-none')
                $("#txtcreateNewInstance_Name").siblings("span").text('This field is required');
            }
            return;
        }

        if (global_all_instance_data.length > 0) {
            var filterArr = global_all_instance_data.filter(v => v.instance_name.trim() === val);
            if (filterArr.length > 0) {
                if ($("#txtcreateNewInstance_Name").siblings("span").hasClass('d-none')) {
                    $("#txtcreateNewInstance_Name").siblings("span").removeClass('d-none')
                    $("#txtcreateNewInstance_Name").siblings("span").text('This Instance already exist');
                }
                return;
            }
        }
        AddNewInstance(val, $("#txtcreateNewInstance_Notes").val().trim())
        $("#createNewInstance").hide();
    });
    $(document).on('click', '#btnBack', function () {
        sessionStorage.clear();
        $.ajax('Login/Logout');
        window.location = "/Login";
    });
    $(document).on('click', '#deleteConfirmation button.btn-danger', function () {
        DeleteInstance($("#deleteConfirmationId").val());
        $("#deleteConfirmationId").val('');
        $("#deleteInstanceName").text('');
        $("#deleteConfirmation").hide();
    });
    $(document).on('click', '#deleteConfirmation button.btn-warning', function () {
        $("#deleteConfirmationId").val('');
        $("#deleteInstanceName").text('');
        $("#deleteConfirmation").hide();
    });
    function DeleteInstance(instance) {
        if (selectedInstance != null && selectedInstance != "") {
            //alert(selectedInstance);
            $.ajax({
                beforeSend: function () {
                    //AddLoader();
                },
                complete: function () {
                    //setTimeout(function () {
                    //    RemoveLoader();
                    //}, 500);
                },
                url: 'MultiInstance/DeleteInstance?email=' + email + '&instanceName=' + selectedInstance,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                async: false,
                data: {},
                success: function (data) {
                    alert(data.data);
                    if (!data.IsValid) {
                        return;
                    }
                    GetAllInstance();
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    }

    $(document).on('click', '#btnInstanceRemove', function () {
        if (global_all_instance_data.length > 0) {
            var filterArr = global_all_instance_data.filter(v => v.instance_name.trim() === selectedInstance);
            if (filterArr.length > 0) {
                if (filterArr[0].isdefaultDB === "Y") {
                    alert("Default instance cannot be deleted.")
                    return;
                }
            }
        }
        $("#deleteConfirmation").show();
        $("#deleteConfirmationId").val(selectedInstance);
        $("#deleteInstanceName").text(selectedInstance);
    });
});

function GetAllInstance() {
    $('#btnInstanceLoad').prop('disabled', true);
    $('#btnInstanceRemove').prop('disabled', true);
    var email = $("#hdnEmail").val();
    selectedInstance = '';
    $.ajax({
        beforeSend: function () {
            /*AddLoader();*/
        },
        complete: function () {
            //setTimeout(function () {
            //    RemoveLoader();
            //}, 500);
        },
        url: 'MultiInstance/GetAllInstance?email=' + email,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: {},
        success: function (data) {
            if (!data.IsValid) {
                return;
            }
            global_all_instance_data = JSON.parse(data.allInstance);
            BindInstanceList(global_all_instance_data);
        },
        error: function (err) {
            console.log(err);
        }
    });
}
function BindInstanceList(data) {
    var _html = ``;
    $(".all-instance-list ul").html('');
    for (var i = 0; i < data.length; i++) {
        if (data[i].isdefaultDB === "Y") {
            _html += `<li class="ui-state-default div-default-instance" id="instance_` + data[i].id + `">` + data[i].instance_name +
                `</li>`;
        }
        else {
            _html += `<li class="ui-state-default" id="instance_` + data[i].id + `">` + data[i].instance_name +
                `</li>`;
        }
    }
    $(".all-instance-list ul").append(_html);
}

$(document).on('click', '.cancel-modal', function () {
    $("#" + $(this).closest('.modal').attr('id')).hide();
});

function AddNewInstance(instanceName, instanceNotes) {
    $.ajax({
        beforeSend: function () {
            //AddLoader();
        },
        complete: function () {
            //setTimeout(function () {
            //    RemoveLoader();
            //}, 500);
        },
        url: 'MultiInstance/AddNewInstanceName?instanceName=' + instanceName + '&instanceNotes=' + instanceNotes,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {},
        success: function (data) {
            alert(data.data);
            if (!data.IsValid) {
                return;
            }
            GetAllInstance();
        },
        error: function (err) {
            console.log(err);
        }
    });
}
function Validate_alphanumeric(str) {
    var code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123) && // lower alpha (a-z)
            !(code == 95)) { // _
            return 'Please enter valid Instance name';
        }
    }
    return 'Success';
};

function allowAlphaNumeric(e) {
    var code = ('charCode' in e) ? e.charCode : e.keyCode;
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) && // lower alpha (a-z)
        !(code == 95))  // _
    {
        e.preventDefault();
    }
}