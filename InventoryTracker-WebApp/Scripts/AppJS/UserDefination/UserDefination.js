var global_all_user_data = [];
var global_admin_user_data = [];
var global_manager_user_data = [];
var global_other_user_data = [];
$(document).ready(function () {
    $('#selectedMenu').text($('#menuUserDefinition').text());
    GetAllUsers();
    $('#admin-panel').droppable({
        hoverClass: "ui-state-hover",
        accept: ".all-users-list table tr td div, #user-relation-table tr td div",
        drop: function (event, ui) {
            var itemEl = $(ui.draggable);
            if (itemEl.length > 0) {
                if ($(this).attr('id') == 'admin-panel' && $('#admin_user_' + $(itemEl).attr('id').split('_')[2]).length == 0) {
                    UpdateUsersRole(1, $(itemEl).attr('id').split('_')[2], false, 0);
                }
                else {
                    BindAllUsers(global_all_user_data);
                    BindAdminUsers(global_admin_user_data);
                    BindManagerUsers(global_manager_user_data);
                }
            }
            CreateDraggable();
        }
    });

    $(document).on('click', '#btnLogout', function () {
        $.ajax('Login/Signout');
        sessionStorage.clear();
        window.location = "/Login";
    });

    $(document).on('click', '.user-defination-blocks tr td div .btn-close', function () {
        var panel = $(this).parent().closest('table').attr('id');
        if (panel == 'user-relation-table') {
            panel = $(this).closest('td').hasClass('manager-panel') ? 'manager-panel' : 'other-user-panel';
        }
        var roleId = GetRoleId(panel);
        var userId = $(this).parent().attr('id').split('_')[2];
        if (roleId == 3) {
            UpdateUsersRole(roleId, userId, true, $(this).closest('td').siblings().find('div').attr('id').split('_')[2]);
        } else {
            UpdateUsersRole(roleId, userId, true, 0);
        }
    });
});

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

function CreateDraggable() {
    $(".all-users-list table tr td div, #admin-panel tr td div, #user-relation-table tr td div").draggable({
        revert: 'invalid'
    });

    $('#user-relation-table tr td.manager-panel').droppable({
        hoverClass: "ui-state-hover",
        accept: "#admin-panel tr td div, .all-users-list table tr td div",
        drop: function (event, ui) {
            var itemEl = $(ui.draggable);
            if (itemEl.length > 0) {
                if ($('#manager_user_' + $(itemEl).attr('id').split('_')[2]).length == 0 && $(this).find('div').length == 0 && (!$(this).siblings().find('div').attr('id') || $(this).siblings().find('div').attr('id').split('_')[2] != $(itemEl).attr('id').split('_')[2])) {
                    UpdateUsersRole(2, $(itemEl).attr('id').split('_')[2], false, 0);
                }
                else {
                    BindAllUsers(global_all_user_data);
                    BindAdminUsers(global_admin_user_data);
                    BindManagerUsers(global_manager_user_data);
                }
            }
            CreateDraggable();
        }
    });

    $('#user-relation-table tr td.other-user-panel').droppable({
        hoverClass: "ui-state-hover",
        accept: "#admin-panel tr td div, .all-users-list table tr td div",
        drop: function (event, ui) {
            var itemEl = $(ui.draggable);
            if (itemEl.length > 0) {
                if ($(this).siblings().find('div').attr('id')
                    && ($(this).siblings().find('div').attr('id') && $(this).siblings().find('div').attr('id').split('_')[2] != $(itemEl).attr('id').split('_')[2])
                    && (!$(this).find('div').attr('id') || $(this).find('div').attr('id').split('_')[2] != $(itemEl).attr('id').split('_')[2])) {
                    UpdateUsersRole(3, $(itemEl).attr('id').split('_')[2], false, $(this).siblings().find('div').attr('id').split('_')[2]);
                }
                else {
                    BindAllUsers(global_all_user_data);
                    BindAdminUsers(global_admin_user_data);
                    BindManagerUsers(global_manager_user_data);
                }
            }
            CreateDraggable();
        }
    });
}

function UpdateUsersRole(roleId, userId, isDelete, parentId) {
    if (!isDelete || isDelete == "") {
        isDelete = false;
    }
    if (!roleId || !userId || roleId == "" || userId == "" || (roleId == 3 && (parentId == 0 || parentId == ""))) {
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
        url: 'UserDefinition/UpdateUsersRole?roleId=' + roleId + '&userId=' + userId + '&isDelete=' + isDelete + '&parentId=' + parentId,
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
        url: 'UserDefinition/GetAllUsers',
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
            global_admin_user_data = JSON.parse(data.adminUsers);
            global_manager_user_data = JSON.parse(data.managerUsers);
            global_other_user_data = JSON.parse(data.otherUsers);
            BindAllUsers(global_all_user_data);
            BindAdminUsers(global_admin_user_data);
            BindManagerUsers(global_manager_user_data);
            CreateDraggable();
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function BindAllUsers(data) {
    $("#txtSearchEmailUserDefination").val('');
    var _html = ``;
    $(".all-users-list table").html('');
    data.sort(function (a, b) { return a.ID - b.ID });
    for (var i = 0; i < data.length; i++) {
        _html += `<tr>`;
        _html += `<td>`;
        _html += `<div class="ui-state-default" id="all_user_` + data[i].ID + `">` + data[i].USER_EMAIL + `</div>`;
        _html += `</td>`;
        _html += `</tr>`;
    }
    $(".all-users-list table").append(_html);
}

function BindAdminUsers(data) {
    var _html = ``;
    $("#admin-panel").html('');
    data.sort(function (a, b) { return a.ID - b.ID });
    for (var i = 0; i < data.length; i++) {
        _html += `<tr>`;
        _html += `<td>`;
        _html += `<div class="ui-state-default" id="admin_user_` + data[i].ID + `"><span>` + data[i].USER_EMAIL + `</span><i class="btn-close"></i></div>`;
        _html += `</td>`;
        _html += `</tr>`;
    }
    _html += `<tr style="height: 50px;"><td></td</tr>`;
    $("#admin-panel").append(_html);
}

function BindManagerUsers(data) {
    var _html = ``;
    $("#user-relation-table").html('');
    for (var i = 0; i < data.length; i++) {
        _html += `<tr>`;
        _html += `<td class="manager-panel">`;
        _html += `<div class="ui-state-default" id="manager_user_` + data[i].ID + `"><span>` + data[i].USER_EMAIL + `</span><i class=" btn-close"></i></div>`;
        _html += `</td>`;
        _html += `<td class="other-user-panel">`;
        var childOtherUser = data[i].OTHER_USERS;
        for (var j = 0; j < childOtherUser.length; j++) {
            _html += `<div class="ui-state-default" id="other_user_` + childOtherUser[j].ID + `"><span>` + childOtherUser[j].USER_EMAIL + `</span><i class="btn-close"></i></div>`;
        }
        _html += `</td>`;
        _html += `</tr>`;
    }
    _html += `<tr style="height: 50px;"><td class="manager-panel"></td><td class="other-user-panel"></td></tr>`;
    $("#user-relation-table").append(_html);
}

function SearchEmailUserDefination() {
    var input, filter, table, tr, td, i, txtValue;
    input = $("#txtSearchEmailUserDefination").val();
    filter = input.toUpperCase();
    table = $(".all-users-list table");
    tr = $(table).find("tr");
    for (i = 0; i < tr.length; i++) {
        td = $(tr[i]).find("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}