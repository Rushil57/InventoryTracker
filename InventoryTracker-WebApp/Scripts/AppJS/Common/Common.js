var elementTemplateName = $('#templateName');
var elementtblTemplateBody = $("#tblTemplate > tbody");
var deleteButton = $('#deleteTemplate');
var entityType = $('#entityType');
var entityTemplate = $('#entityTemplate');
var equipTypeEle = $('#equipType');
var startIndexEquip = 0;
var endIndexEquip = 20;
var startIndexEntity = 0;
var endIndexEntity = 20;
var currentUpdateAssignDate = '';

var equipmentTemplate = $('#equipmentTemplate');

var lastPlusRow = '<tr><td colspan = "3" ></td>  <td> <svg style ="cursor: pointer" xmlns="http://www.w3.org/2000/svg"  width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /> </svg> </td> </tr> ';

$(document).ready(function () {
    $('#searchEquipmentStr').keydown(function (e) {
        if (e.keyCode == 13) {
            addEquipmentHeader();
        }
    })
    $('#searchEntityStr').keydown(function (e) {
        if (e.keyCode == 13) {
            addEntityHeader()
        }
    })
})

function updateRowIndex() {
    var j = 1;
    $('#tblTemplate > tbody > tr').each(function () {
        $(this).find("td:eq(2)").text(j);
        j = j + 1;
    })
}


function addTemplateRow() {
    $('#tblTemplate > tbody > tr:last').before("<tr><td><input type='text' class='dropdown-control' placeholder='Property Name'/></td> <td><select name = 'DataType' class='dropdown-control' id ='dataType'><option value='String' >String</option><option value='Int'>Int</option><option value='Decimal'>Decimal</option><option value='Bool'>Bool</option><option value='HyperLink' >Hyper Link</option></select></td >  <td>/*<input type='number' min='0' onkeydown='javascript: return event.keyCode == 69 ? false : true' placeholder='Sequence'/>*/</td> <td> <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-trash' viewBox='0 0 16 16' style='cursor:pointer'><path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z' /><path fill-rule='evenodd' d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z' /> </svg ></td ></tr > ")
    updateRowIndex();
    addTrashFunc();
}

function deleteRow() {
    $(this).parent().remove();
    updateRowIndex();
}
function editTemplate(type) {
    var templateName = elementTemplateName.text();
    if (templateName == "") {
        alert("Please select " + type);
        return;
    }

    addTrashFunc();
    sortableTemplateRow();

    $("#tblTemplate > tbody >  tr ").each(function () {
        var zerotd = $(this).find("td:eq(0)");
        //var onetd = $(this).find("td:eq(1)");
        zerotd.html("<input type='text' class='dropdown-control' value='" + zerotd.text().trim() + "'>");
        //onetd.html("<input type='text' value='" + onetd.text().trim() + "'>");
    })
    $("#tblTemplate > tbody >  tr:last ").remove();
    elementtblTemplateBody.append(lastPlusRow);
    addCursorFunc();
}

function AddLoader() {
    $('.overlay').removeClass('d-none');
}

function RemoveLoader() {
    setTimeout(function () { $('.overlay').addClass('d-none'); }, 1000)
}

function sortableTemplateRow() {
    elementtblTemplateBody.sortable({
        items: "tr:not(.group-row)",
        cursor: "move",
        placeholder: 'placeholder',
        stop: function (event, ui) {
            updateRowIndex();
        }
    });
    elementtblTemplateBody.sortable("enable");
}

function disableSortable() {
    if (elementtblTemplateBody.hasClass('ui-sortable')) {
        elementtblTemplateBody.sortable("disable");
    }
}

function addCursorFunc() {
    $(".bi-plus").parent().click(addTemplateRow);
    $(".bi-plus").parent().css('cursor', 'pointer');
    $(".bi-plus").css('cursor', 'pointer')
}


function addTrashFunc() {
    $(".bi-trash").css('cursor', 'pointer');
    $(".bi-trash").parent().click(deleteRow);
    $(".bi-trash").parent().css('cursor', 'pointer');
}


function getFormattedDate(dString) {
    if (dString == null) {
        return '';
    }
    var d = new Date(dString.split(".")[0]);
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    if (mm < 10) mm = "0" + mm;
    if (dd < 10) dd = "0" + dd;
    return mm + "/" + dd + "/" + d.getFullYear();
}




function loadAllEntityTemp() {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/GetEntityTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';

                for (var i = 0; i < data.uniquePropName.length; i++) {
                    var propName = data.uniquePropName[i].Prop_name.trim();
                    templateString += '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="' + propName + '"> <label class="form-check-label" for="' + propName + '"> ' + propName + ' </label> </div>';
                }

                var uniqueEntityType = "";
                uniqueEntityType += "<option value='0' >Select entity type</option>";
                for (var j = 0; j < data.uniqueEntityTemplates.length; j++) {
                    var entType = data.uniqueEntityTemplates[j].Ent_type;
                    uniqueEntityType += '<option value=' + entType + ' >' + entType + '</option>'
                }
                entityType.html(uniqueEntityType);

                $('#entityTemplateModelBody').html(templateString);
            }
        }, error: function (ex) { }
    });
}



function loadAllEquipTemp() {
    //var equipType = [];
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';

                for (var i = 0; i < data.uniquePropName.length; i++) {
                    var propName = data.uniquePropName[i].Prop_Name.trim();
                    //equipType.push(data.data[i].Equipment_Type.trim());
                    templateString += '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="' + propName + '"> <label class="form-check-label" for="' + propName + '"> ' + propName + ' </label> </div>';
                }
                //$.unique(equipType);
                var uniqueEquipType = "";
                uniqueEquipType += "<option value='0' >Select equipment type</option>";
                for (var j = 0; j < data.uniqueEquipmentTemplates.length; j++) {
                    var equipType = data.uniqueEquipmentTemplates[j].Equipment_Type;
                    uniqueEquipType += '<option value=' + equipType + ' >' + equipType + '</option>'
                }
                equipTypeEle.html(uniqueEquipType);
                $('#equipmentTemplateModelBody').html(templateString);
            }
        }, error: function (ex) { }
    });
}

function showEntityModel() {
    entityTemplate.modal('show');
}

function showEquipModel() {
    equipmentTemplate.modal('show');
}

function addEntityColumn() {
    //var tableHeader = '';
    //tableHeader += tblHDR;/*' <th scope="col">Entity type</th> <th scope="col">Entity name</th>';*/
    ////tableHeader += ' <th scope="col">Entity type</th> <th scope="col">Entity name</th><th scope="col">Assigned</th>';
    //$('#entityTemplateModelBody .form-check-input').each(function () {
    //    if ($(this).is(':checked')) {
    //        tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
    //        $.ajax({
    //            before: AddLoader(),
    //            after: RemoveLoader(),
    //            url: '/Entity/EntityValueByPropName',
    //            contentType: 'application/json; charset=utf-8',
    //            dataType: 'json',
    //            type: 'GET',
    //            async: false,
    //            data: { 'propName': $(this).attr('id') },
    //            success: function (data) {
    //                $("#entityHDR > tbody >  tr").each(function () {
    //                    $(this).find('td:last').after('<td></td>')
    //                })
    //                for (var i = 0; i < data.data.length; i++) {
    //                    $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('td:last').text(data.data[i].Ent_Value);
    //                }
    //            },
    //            error: function (ex) { }
    //        });
    //    }
    //})
    //$("#entityHDR > thead >  tr > th").remove();
    //$("#entityHDR > thead >  tr").append(tableHeader);
    //entityTemplate.modal('hide');

    var hdrdata = [];
    $("#entityHDR th").each(function (index) {
        var headerdata = "<th scope=\"col\">" + $(this).text() + "</th>";
        if (hdrdata.indexOf(headerdata) == -1) {
            hdrdata.push(headerdata);
        }
    });

    //var tableHeader = '';
    //tableHeader += tblHDR;/*' <th scope="col">Entity type</th> <th scope="col">Entity name</th>';*/
    //tableHeader += ' <th scope="col">Entity type</th> <th scope="col">Entity name</th><th scope="col">Assigned</th>';
    $('#entityTemplateModelBody .form-check-input').each(function () {
        if ($(this).is(':checked')) {
            var isPresent = true;

            var id = $(this).attr('id');
            $("#entityHDR th").each(function (index) {

                if ($(this).text().toLowerCase() == id.toLowerCase()) {
                    isPresent = false;

                    if ($(this).text().toLowerCase() == id.toLowerCase()) {
                        $('#entityHDR tbody tr').each(function (ind, el) {
                            $('td', el).eq(index).show();
                        });
                        $(this).show();
                    }
                }
                if (hdrdata.indexOf("<th scope=\"col\">" + id + "</th>") == -1) {
                    hdrdata.push("<th scope=\"col\">" + id + "</th>");
                }

            });
            //tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
            if (isPresent) {
                $.ajax({
                    before: AddLoader(),
                    after: RemoveLoader(),
                    url: '/Entity/EntityValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': $(this).attr('id') },
                    success: function (data) {
                        $("#entityHDR > tbody >  tr").each(function () {
                            $(this).find('td:last').after('<td></td>')
                        })
                        for (var i = 0; i < data.data.length; i++) {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('td:last').text(data.data[i].Ent_Value);
                        }
                    },
                    error: function (ex) { }
                });
            }
        } else {
            var id = $(this).attr('id');
            $("#entityHDR th").each(function (index) {

                if ($(this).text().toLowerCase() == id.toLowerCase()) {
                    $('#entityHDR tbody tr').each(function (ind, el) {
                        $('td', el).eq(index).remove();
                    });
                    $(this).hide();
                    var index = hdrdata.indexOf("<th scope=\"col\">" + id + "</th>");
                    if (index > -1) {
                        hdrdata.splice(index, 1);
                    }

                }

            });
        }
    })
    $("#entityHDR > thead >  tr > th").remove();
    $("#entityHDR > thead >  tr").append(hdrdata.toLocaleString().replaceAll(',', ''));
    entityTemplate.modal('hide');


}


function addEntityHeader() {
    loadEntityHDR('');
    addEntityColumn();
    $("#entityHDR tr").each(function (index) {
        if (index !== 0) {
            var row = $(this);
            var isHide = true;
            row.find('td').each(function () {
                if ($(this).text().toLowerCase().indexOf($('#searchEntityStr').val().toLowerCase().trim()) != -1) {
                    isHide = false;
                    return;
                }
            })
            if (isHide) {
                row.hide();
            }
            else {
                row.show();
            }
        }
    });
}



function resizableTable() {
    $("#equipHDR th").resizable();
    $("#entityHDR  th").resizable();
}


function sortableTable() {
    $('#equipHDR > thead tr').sortable({
        containment: "parent",
        placeholder: "placeholder",
        opacity: 0.5,
        helper: "clone",
        axis: 'x',
        start: function (e, ui) {
            var ind_th = ui.item.index();
            $('#equipHDR tbody tr').each(function (ind, el) {
                $('td', el).eq(ind_th).addClass('drg');
            });
        },
        stop: function (e, ui) {
            var itInd = ui.item.index() - 1;
            $("#equipHDR > tbody tr").each(function (ind, el) {
                var cell = $(".drg", el).detach();
                if (itInd < 0) {
                    cell.insertBefore($("td", el).eq(itInd + 1));
                }
                else {
                    cell.insertAfter($("td", el).eq(itInd));
                }
                cell.removeClass("drg").css("color", "black");
            });
        }
    });
    $('#equipHDR > thead tr').disableSelection();

    $('#entityHDR > thead tr').sortable({
        containment: "parent",
        placeholder: "placeholder",
        opacity: 0.5,
        helper: "clone",
        axis: 'x',
        start: function (e, ui) {
            var ind_th = ui.item.index();
            $('#entityHDR tbody tr').each(function (ind, el) {
                $('td', el).eq(ind_th).addClass('drg');
            });
        },
        stop: function (e, ui) {
            var itInd = ui.item.index() - 1;
            $("#entityHDR > tbody tr").each(function (ind, el) {
                var cell = $(".drg", el).detach();
                //cell.insertAfter($("td", el).eq(itInd));
                if (itInd < 0) {
                    cell.insertBefore($("td", el).eq(itInd + 1));
                }
                else {
                    cell.insertAfter($("td", el).eq(itInd));
                }
                cell.removeClass("drg").css("color", "black");
            });
        }
    });
    $('#entityHDR > thead tr').disableSelection();
}


function GetEquipmentEntityAssignment(isEntityEquip) {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentEntityAssignment',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'startDate': startDate.val() },
        success: function (assignmentData) {
            if (assignmentData.IsValid) {
                $("#entityHDR > tbody >  tr").find('.droppable').children('div').remove();
                $("#equipHDR > tbody >  tr").find('.droppable').children('div').remove()
                for (var i = 0; i < assignmentData.data.length; i++) {
                    var assignedStr = '';
                    if (assignmentData.data[i].EQUIP_ENT_ID > 0) {
                        if (isEntityEquip == 0) {
                            var assignedStr = '<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary assignBtn"  id="' + assignmentData.data[i].EQUIP_ID + '">' + assignmentData.data[i].UNIT_ID + '<div onclick="deleteAssignment(' + assignmentData.data[i].ENT_ID + ',' + assignmentData.data[i].EQUIP_ID + ',this)" class="cls-remove-tag">X</div></div></div>';
                            $("#entityHDR > tbody >  tr").find('input[value="' + assignmentData.data[i].ENT_ID + '"]').parent().find('.droppable').append(assignedStr);
                        }
                        else {
                            var assignedStr = '<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + assignmentData.data[i].EQUIP_ID + '">' + assignmentData.data[i].ENT_NAME + '<div onclick="deleteAssignment(' + assignmentData.data[i].ENT_ID + ',' + assignmentData.data[i].EQUIP_ID + ',this)" class="cls-remove-tag">X</div></div></div>';
                            $("#equipHDR > tbody >  tr").find('input[value="' + assignmentData.data[i].EQUIP_ID + '"]').parent().find('.droppable').append(assignedStr);
                        }
                    }
                }
            }
        }, error: function (ex) { }
    });
}

var deleteEntityID = 0;
var deleteEquipID = 0;
var deleteElement;
function deleteAssignment(entityID, equipID, el) {
    deleteAssignmentModel.modal('show');
    deleteEntityID = entityID;
    deleteEquipID = equipID;
    deleteElement = el;
    resetDeleteAssignmentModel();
}

var deleteAssignmentModel = $('#deleteAssignment');
function removeAssignmentOption() {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/SaveEquipmentEntityAssignment',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: JSON.stringify({ 'entityID': deleteEntityID, 'equipID': deleteEquipID, 'isDelete': 1 }),
        success: function (data) {
            deleteAssignmentModel.modal('hide');
            var equipAssignElement = $("#equipHDR > tbody >  tr").find('input[value="' + deleteEquipID + '"]').parent().find('.assigned');
            var totalAssignCount = $(equipAssignElement[0]).text();
            equipAssignElement.text(parseInt(totalAssignCount) - 1)

            var entityAssignElement = $("#entityHDR > tbody >  tr").find('input[value="' + deleteEntityID + '"]').parent().find('.assigned');
            var totalAssignCount = $(entityAssignElement[0]).text();
            entityAssignElement.text(parseInt(totalAssignCount) - 1)

            $(deleteElement).parent().remove();
        }, error: function (ex) { }
    });
}

function updateAssignmentOption() {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/SaveEquipmentEntityAssignment',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: JSON.stringify({ 'entityID': deleteEntityID, 'equipID': deleteEquipID, 'isDelete': 2, 'endDate': $('.updatepicker').val() }),
        success: function (data) {
            deleteAssignmentModel.modal('hide');
        }, error: function (ex) { }
    });
}

function resetDeleteAssignmentModel() {
    $('.updatepicker').datepicker({ autoclose: true }).datepicker('setDate', currentDate);
}

function divEquipmentHDRLoad(element) {
    if (Math.ceil($(element).scrollTop() + $(element).innerHeight()) >= Math.floor($(element)[0].scrollHeight)) {
        startIndexEquip = endIndexEquip;
        endIndexEquip = endIndexEquip + 10;
        loadEquipmentHDR('');
    }
}
function divEntityHDRLoad(element) {
    if (Math.ceil($(element).scrollTop() + $(element).innerHeight()) >= Math.floor($(element)[0].scrollHeight)) {
        startIndexEntity = endIndexEntity;
        endIndexEntity = endIndexEntity + 10;
        loadEntityHDR($('#searchEntityStr').val());;
    }
}