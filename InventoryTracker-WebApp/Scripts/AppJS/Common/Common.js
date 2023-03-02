var elementTemplateName = $('#templateName');
var elementtblTemplateBody = $("#tblTemplate > tbody");
var deleteButton = $('#deleteTemplate');
var entityType = $('#entityType');
var entityTemplate = $('#entityTemplate');
var equipTypeEle = $('#equipType');
var startIndexEquip = 0;
var endIndexEquip = 0;
var startIndexEntity = 0;
var endIndexEntity = 0;
var entitysearchflag = false;
var previousentitysearch = '';
var equipsearchflag = false;
var previousequipsearch = '';
var currentUpdateAssignDate = '';
var uniqueEquipType = "";
var uniqueEntityType = "";
var isEquipEntityPopUP = true;
var isFirstTimeEntEqu = true;
var isDeleted = 2;
var deleteEquipEntID = 0;

const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`


var equipmentTemplate = $('#equipmentTemplate');

var lastPlusRow = '<tr><td colspan = "3"></td>  <td  class="textBox-BackColor"> <svg style ="cursor: pointer" xmlns="http://www.w3.org/2000/svg"  width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /> </svg> </td> </tr> ';

$(document).ready(function () {
    $('#searchEquipmentStr').keydown(function (e) {
        if (e.keyCode == 13) {
            addEquipmentHeader();
        }
    })
    $('#searchEntityStr').keydown(function (e) {
        if (e.keyCode == 13) {
            addEntityHeader();
        }
    })
    $('#property,#propEquip ,#propEnitity,#divbulkImport,#divimport, #export ,#sampleFile, #entityCC').tooltip();

    if ($('#bulkImport').length > 0) {
        var popover = new bootstrap.Popover(document.querySelector('#bulkImport'), {
            container: 'body',
            html: true,
            content: document.getElementById('mypopover-content'),
        })
    }

    if ($('#import').length > 0) {
        var popover2 = new bootstrap.Popover(document.querySelector('#import'), {
            container: 'body',
            html: true,
            content: document.getElementById('sampleFileImport'),
        })
    }

    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })

    if (isSearchDropDown) {
        $('.selectDrpDown').change(function () {
            dropDownVal = $(this).val();
            filterFunction(dropDownVal);
        })
    }
    else {
        $('.selectDrpDown').change(function () {
            dropDownVal = $(this).val();
            filterFunctionForAssignment(dropDownVal);
        })
    }
})
function updateRowIndex() {
    var j = 1;
    $('#tblTemplate > tbody > tr').each(function () {
        $(this).find("td:eq(2)").text(j);
        j = j + 1;
    })
}


function addTemplateRow() {
    $('#tblTemplate > tbody > tr:last').before("<tr><td><input type='text' class='dropdown-control' placeholder='Property Name'/></td> <td><select name = 'DataType' class='dropdown-control' id ='dataType'><option value='String' >String</option><option value='Int'>Int</option><option value='Decimal'>Decimal</option><option value='Bool'>Bool</option><option value='HyperLink' >Hyper Link</option><option value='DateTime' >DateTime</option></select></td >  <td>/*<input type='number' min='0' onkeydown='javascript: return event.keyCode == 69 ? false : true' placeholder='Sequence'/>*/</td> <td> <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-trash' viewBox='0 0 16 16' style='cursor:pointer'><path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z' /><path fill-rule='evenodd' d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z' /> </svg ></td ></tr > ")
    updateRowIndex();
    addTrashFunc();
}

function deleteRow() {
    $(this).parent().remove();
    updateRowIndex();
}
function editTemplate(type) {
    if (isFirstTimeEntEqu) {
        isFirstTimeEntEqu = false;
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
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Entity/GetEntityTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';
                templateString += 'Entity type: <select name="entityType" class="dropdown-control" id="entityTypeInColumns" onchange="entityTypeChange()"></select>';
                for (var i = 0; i < data.uniquePropName.length; i++) {
                    var propName = data.uniquePropName[i].Prop_name.trim();
                    var entityTypeValue = data.uniquePropNameEnt.filter(x => x.Prop_name === propName)[0].Ent_type.toUpperCase();
                    templateString += '<div entType="' + entityTypeValue +'" class="form-check"><input class="form-check-input" type="checkbox" value="" id="' + propName + '"> <label class="form-check-label" for="' + propName + '"> ' + propName + ' </label> </div>';
                }

                uniqueEntityType = "";
                uniqueEntityType += "<option value='0' >Select entity type</option>";
                for (var j = 0; j < data.uniqueEntityTemplates.length; j++) {
                    var entType = data.uniqueEntityTemplates[j].Ent_type;
                    uniqueEntityType += '<option value=' + entType.toUpperCase() + ' >' + entType + '</option>'
                }
                entityType.html(uniqueEntityType);

                $('#entityTemplateModelBody').html(templateString);
                $('#entityTypeInColumns').html(uniqueEntityType).find('option:first').remove();
            }
        }, error: function (ex) { }
    });
}


function loadAllEquipTemp() {
    //var equipType = [];
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Equipment/GetEquipmentTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';
                    templateString += 'Equipment type: <select name="equipType" class="dropdown-control" id="equipTypeInColumns" onchange="equipTypeChange()"></select>';
                for (var i = 0; i < data.uniquePropName.length; i++) {
                    var propName = data.uniquePropName[i].Prop_Name.trim();
                    //equipType.push(data.data[i].Equipment_Type.trim());
                    var equipTypeValue = data.uniquePropNameEqu.filter(x => x.Prop_Name === propName)[0].Equipment_Type.toUpperCase();
                    templateString += '<div equipType=' + equipTypeValue +' class="form-check"><input class="form-check-input" type="checkbox" value="" id="' + propName + '"> <label class="form-check-label" for="' + propName + '"> ' + propName + ' </label> </div>';
                }
                //$.unique(equipType);
                uniqueEquipType = "";
                uniqueEquipType += "<option value='0' >Select equipment type</option>";
                for (var j = 0; j < data.uniqueEquipmentTemplates.length; j++) {
                    var equipType = data.uniqueEquipmentTemplates[j].Equipment_Type;
                    uniqueEquipType += '<option value=' + equipType.toUpperCase() + ' >' + equipType + '</option>'
                }
                equipTypeEle.html(uniqueEquipType);
                $('#equipmentTemplateModelBody').html(templateString);
                $('#equipTypeInColumns').html(uniqueEquipType).find('option:first').remove();
            }
        }, error: function (ex) { }
    });
}

function showEntityModel() {
    $('#entityTypeInColumns').prop('selectedIndex', 0);
    entityTypeChange();
    entityTemplate.modal('show');
}

function showEquipModel() {
    $('#equipTypeInColumns').prop('selectedIndex', 0);
    equipTypeChange();
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
                    complete: function () {
                        setTimeout(function () {
                            RemoveLoader();
                        }, 500);
                    },
                    url: '/Entity/EntityValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': $(this).attr('id'), 'date': $('#mainDate').val() },
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
    $("#entityHDR").trigger("destroy", [false, function () {
        $("#entityHDR").tablesorter({ emptyTo: 'none/zero' }).trigger("update");
    }]);
    entityTemplate.modal('hide');


}


function addEntityHeader() {
    var searchString = $('#searchEntityStr').val().toLowerCase().trim();
    if (searchString != '') {
        if (previousentitysearch == searchString) {
            previousentitysearch = searchString;
            loadEntityHDR(searchString, false);
            return;
        }
        previousentitysearch = searchString;
        startIndexEntity = 0;
        loadEntityHDR(searchString, true);
    } else {
        startIndexEntity = 0;
        endIndexEntity = 30;
        loadEntityHDR(searchString, false);
    }
    $("#entityHDR").trigger("destroy", [false, function () {
        $("#entityHDR").tablesorter({ emptyTo: 'none/zero' }).trigger("update");
    }]);
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
    $("#entityHDR").trigger("destroy", [false, function () {
        $("#entityHDR").tablesorter({ emptyTo: 'none/zero' }).trigger("update");
    }]);
}


function GetEquipmentEntityAssignment(isEntityEquip) {
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
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
                        var sDate = getFormattedDate(assignmentData.data[i].START_DATE);
                        var eDate = getFormattedDate(assignmentData.data[i].END_DATE);
                        if (isEntityEquip == 0) {
                            var assignedStr = '<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary assignBtn"  id="' + assignmentData.data[i].EQUIP_ID + '" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date: ' + sDate + '<br/> End date: ' + eDate + '">' + assignmentData.data[i].UNIT_ID + '<div onclick="deleteAssignment(' + assignmentData.data[i].ENT_ID + ',' + assignmentData.data[i].EQUIP_ID + ',this,\'' + sDate + '\',\'' + eDate + '\',' + assignmentData.data[i].EQUIP_ENT_ID + ')"  class="cls-remove-tag"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg></div></div></div>';
                            $("#entityHDR > tbody >  tr").find('input[value="' + assignmentData.data[i].ENT_ID + '"]').parent().find('.droppable').append(assignedStr);
                        }
                        else {
                            var assignedStr = '<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + assignmentData.data[i].EQUIP_ID + '" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date: ' + sDate + '<br/>  End date: ' + eDate + '">' + assignmentData.data[i].ENT_NAME + '<div onclick="deleteAssignment(' + assignmentData.data[i].ENT_ID + ',' + assignmentData.data[i].EQUIP_ID + ',this,\'' + sDate + '\',\'' + eDate + '\',' + assignmentData.data[i].EQUIP_ENT_ID + ')"  class="cls-remove-tag"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg></div></div></div>';
                            $("#equipHDR > tbody >  tr").find('input[value="' + assignmentData.data[i].EQUIP_ID + '"]').parent().find('.droppable').append(assignedStr);
                        }
                    }
                }
                $('[data-bs-toggle="tooltip"]').tooltip()
            }
        }, error: function (ex) { }
    });
}

var deleteEntityID = 0;
var deleteEquipID = 0;
var deleteElement;
var deleteStartDate = '';
var deleteEndDate = '';

function deleteAssignment(entityID, equipID, el, startDate, endDate, equipEntID) {
    $('#startDateLbl').text(startDate);
    $('#endDateLbl').text(endDate);
    $('#dateRangeDiv').attr('hidden', true);
    $('#saveAssignmentOption').attr('hidden', true);
    $('#addNewPropOfAssign').attr('hidden', true);
    $('#updateAssignmentOption').attr('hidden', false);
    $('#removeAssignmentOption').attr('hidden', false);
    $('#currID').val(equipEntID)
    if (isEquipEntityPopUP) {
        $('#currEquipDiv').attr('hidden', false);
        $('#currEquipID').text($(el).parent().text());
        $('#changeUnitID').attr('hidden', true)
    }
    else {

        $('#currEntityName').text(($(el).parent().text()));
        $('#currEntityDiv').attr('hidden', false);
        $('#changeEntityName').attr('hidden', true)
    }
    deleteAssignmentModel.modal('show');
    deleteEntityID = entityID;
    deleteEquipEntID = equipEntID;
    deleteEquipID = equipID;
    deleteElement = el;
    deleteStartDate = startDate;
    deleteEndDate = endDate;
    resetDeleteAssignmentModel();
}

var deleteAssignmentModel = $('#deleteAssignment');
new bootstrap.Modal(deleteAssignmentModel, {
    keyboard: false,
    backdrop: 'static'
})
function removeAssignmentOption() {
    $('#calendarControlModel').css('z-index', '1055');
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Equipment/SaveEquipmentEntityAssignment',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: JSON.stringify({ 'entityID': deleteEntityID, 'equipID': deleteEquipID, 'isDelete': 1, 'equipEntID': $('#currID').val() }),
        success: function (data) {
            deleteAssignmentModel.modal('hide');
            var equipAssignElement = $("#equipHDR > tbody >  tr").find('input[value="' + deleteEquipID + '"]').parent().find('.assigned');
            var totalAssignCount = $(equipAssignElement[0]).text();
            equipAssignElement.text(parseInt(totalAssignCount) - 1)

            var entityAssignElement = $("#entityHDR > tbody >  tr").find('input[value="' + deleteEntityID + '"]').parent().find('.assigned');
            var totalAssignCount = $(entityAssignElement[0]).text();
            entityAssignElement.text(parseInt(totalAssignCount) - 1)

            var equipActive = $("#equipHDR > tbody >  tr").find('input[value="' + deleteEquipID + '"]').parent().find('.active');
            var equipActiveCount = $(equipActive[0]).text();
            equipActive.text(parseInt(equipActiveCount) - 1);

            var entityActive = $("#entityHDR > tbody >  tr").find('input[value="' + deleteEntityID + '"]').parent().find('.active');
            var entityActiveCount = $(entityActive[0]).text();
            entityActive.text(parseInt(entityActiveCount) - 1);

            $(deleteElement).parent().remove();
            if ($('#calendarControlModel').is(":visible")) {
                if (isEquipEntityPopUP) {
                    openCC('', deleteEntityID);
                    getEquipmentEntityAssignmentByYear(deleteEntityID);
                    loadEntityHDR('', false);
                }
                else {
                    openCC('', deleteEquipID, '', '');
                    getEquipmentEntityAssignmentByYear(deleteEquipID);
                    loadEquipmentHDR('', false);
                }
            }
        }, error: function (ex) { }
    });
}
function updateAssignmentOption() {
    if ($('.updateEndDatepicker').val() == '') {
        alert('Please select end date.');
        return;
    }
    else if ($('.updateStartDatepicker').val() == '') {
        alert('Please select start date.');
        return;
    }
    var startDate = $('.updateStartDatepicker').val();
    var endDate = $('.updateEndDatepicker').val();
    $('#calendarControlModel').css('z-index', '1055');
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Equipment/SaveEquipmentEntityAssignment',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: JSON.stringify({
            'entityID': deleteEntityID, 'equipID': deleteEquipID, 'isDelete': isDeleted, 'endDate': endDate, 'startDate': startDate, 'equipEntID': $('#currID').val()
        }),
        success: function (data) {
            deleteAssignmentModel.modal('hide');
            $(deleteElement).attr('onclick', "deleteAssignment(" + deleteEntityID + ", " + deleteEquipID + ", this, '" + deleteStartDate + "','" + endDate + "'," + deleteEquipEntID + ")");
            $(deleteElement).parent().attr('data-bs-original-title', "Start date: " + startDate + " <br/> End date: " + endDate);
            if ($('#calendarControlModel').is(":visible")) {
                if (isEquipEntityPopUP) {
                    openCC('', deleteEntityID);
                    getEquipmentEntityAssignmentByYear(deleteEntityID);
                    loadEntityHDR('', false);
                }
                else {
                    openCC('', deleteEquipID, '', '');
                    getEquipmentEntityAssignmentByYear(deleteEquipID);
                    loadEquipmentHDR('', false);
                }
            }
        }, error: function (ex) { }
    });
}

function resetDeleteAssignmentModel() {
    if (!$.fn.bootstrapDP && $.fn.datepicker && $.fn.datepicker.noConflict) {
        $('.updateEndDatepicker').datepicker({ autoclose: true }).datepicker('setDate', deleteEndDate);
        $('.updateStartDatepicker').datepicker({ autoclose: true }).datepicker('setDate', deleteStartDate);
    }
    else {
        $('.updateEndDatepicker').bootstrapDP({ autoclose: true }).bootstrapDP('setDate', deleteEndDate);
        $('.updateStartDatepicker').bootstrapDP({ autoclose: true }).bootstrapDP('setDate', deleteStartDate);
    }
    $('#calendarControlModel').css('z-index', '1055');
}

function divEquipmentHDRLoad(element) {
    if (element.scrollTop > 0) {
        if (Math.ceil($(element).scrollTop() + $(element).innerHeight()) >= Math.floor($(element)[0].scrollHeight)) {

            endIndexEquip = endIndexEquip + 30;
            startIndexEquip = endIndexEquip;
            var searchString = $('#searchEquipmentStr').val().toLowerCase().trim();
            if (searchString != '') {
                if (previousequipsearch == searchString) {
                    previousequipsearch = searchString;
                    loadEquipmentHDR(searchString, false);
                    return;
                }
                startIndexEquip = 0;
                previousequipsearch = searchString;
                loadEquipmentHDR(searchString, true);
                return;
            }
            else {
                loadEquipmentHDR('', false);
            }
        }
    }
}
function divEntityHDRLoad(element) {
    if (element.scrollTop > 0) {
        if (Math.ceil($(element).scrollTop() + $(element).innerHeight()) >= Math.floor($(element)[0].scrollHeight)) {
            endIndexEntity = endIndexEntity + 30;
            startIndexEntity = endIndexEntity;
            var searchString = $('#searchEntityStr').val().toLowerCase().trim();
            if (searchString != '') {
                if (previousentitysearch == searchString) {
                    previousentitysearch = searchString;
                    loadEntityHDR(searchString, false);
                    return;
                }
                startIndexEntity = 0;
                previousentitysearch = searchString;
                loadEntityHDR(searchString, true);
                return;
            }
            else {
                loadEntityHDR('', false);
            }
        }
    }
}


var isBulkImport = false;
function importData() {
    $("#import").popover('hide')
    $("#file").val('');
    $('#importExcel').modal('show');
    isBulkImport = false;
}
function importBulkData() {
    $("#file").val('');
    $('#importExcel').modal('show');
    isBulkImport = true;
    $("#bulkImport").popover('hide');
}
$("#file").change(function () {
    var fileExtension = ['xls', 'xlsx', 'csv'];
    if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
        alert("Only formats are allowed: " + fileExtension.join(', '));
        $(this).val('');
    }
});

function BulkImportTemplate(isEntity) {
    var fileUpload = $("#file").get(0);
    var files = fileUpload.files;
    var formData = new FormData();

    formData.append("file", files[0]);
    formData.append("isEntity", isEntity);
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        type: "POST",
        url: '/Entity/BulkImportTemplate',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
            var newData = JSON.parse(data);
            alert(newData.data);
            if (newData.IsValid) {
                $('#importExcel').modal('hide');
                if (isEntity) {
                    loadEntity();
                }
                else {
                    loadEquipment();
                }
            }
        },
        error: function (e1, e2, e3) {
        }
    });
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function resetEditModel() {
    var sdate = $('#startDateLbl').text();
    var edate = $('#endDateLbl').text();

    if (!$.fn.bootstrapDP && $.fn.datepicker && $.fn.datepicker.noConflict) {
        $('.updateEndDatepicker').datepicker({ autoclose: true }).datepicker('setDate', edate);
        $('.updateStartDatepicker').datepicker({ autoclose: true }).datepicker('setDate', sdate);
    }
    else {
        $('.updateEndDatepicker').bootstrapDP({ autoclose: true }).bootstrapDP('setDate', edate);
        $('.updateStartDatepicker').bootstrapDP({ autoclose: true }).bootstrapDP('setDate', sdate);
    }
    $('#calendarControlModel').css('z-index', '1055');
}

function callFunction() {
    $('#entityCC').trigger('click');
    $('.selectDrpDown').val(dropDownVal)
}


function AddNewProp() {
    var sDate = getTodayDate();
    $('#dataValue').val('');
    $('#propName').text('');
    $('#startDateLbl').text(sDate);
    $('#endDateLbl').text('01/01/9999');
    $('.updateStartDatepicker').bootstrapDP('setDate', sDate);
    $('.updateEndDatepicker').bootstrapDP('setDate', '01/01/9999');
    $('#changeProp').attr('hidden', false);
    $('#saveData').attr('hidden', false);
    $('#updateData').attr('hidden', true);
    $('#removeDetail').attr('hidden', true);
    $('#dateRangeDiv').attr('hidden', true);

    GetAllTemplate();
    onChangePropDropDown();
}


function bootStrapDropDown() {
    if (!$.fn.bootstrapDP && $.fn.datepicker && $.fn.datepicker.noConflict) {
        $('.datepicker').datepicker({
            autoclose: true
        });
    }
    else {
        $('.datepicker').bootstrapDP({
            autoclose: true
        });
    }
}

function getTodayDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + '/' + d.getFullYear();
    return output;
}




function filterFunction(dropDownVal) {
    var isFirstLoad = true;
    $("#tblLegend tr").each(function (index) {
        var row = $(this);
        if (isFirstLoad) {
            if (dropDownVal == 0) {
                row.show();
                bindDate(0);
                isFirstLoad = false;
            }
            else {
                if (index !== 0) {
                    if (row.find('[type="hidden"]').val().toLowerCase() != dropDownVal.toLowerCase().trim()) {
                        row.hide();
                    }
                    else {
                        row.show();
                        bindDate(row.find('[type="hidden"]').val().toLowerCase());
                        isFirstLoad = false;
                    }
                }
            }
        }

    });
}



function bindTooltip() {

    $('[data-bs-toggle="tooltip"]').tooltip('dispose');
    $('[data-bs-toggle="tooltip"]').tooltip();
}

function nextPrevYear() {
    $('#nextYear').click(function () {
        $('.ui-icon-circle-triangle-e').trigger('click');
        setTimeout(onChangeYear(), 500);
    });
    $('#prevYear').click(function () {
        $('.ui-icon-circle-triangle-w').trigger('click');
        setTimeout(onChangeYear(), 500)
    });

}


function spectrumColor() {
    $('#tblLegend > tbody > tr').each(function () {
        var firstTd = $(this).find('td:first');
        var firstTdColor = firstTd.css('background-color');
        firstTd.spectrum({
            preferredFormat: "hex",
            color: firstTdColor,
            showAlpha: true,
            showInput: true,
            change: function (color) {
                var currentColorIndex = ccPropDetails.filter(x => x.color == rgba2hex(firstTdColor).toUpperCase());
                if (currentColorIndex.length > 0) {
                    currentColorIndex[0].color = color.toHexString().toUpperCase();
                    $(this).css('background-color', color.toHexString().toUpperCase())
                    filterFunction(dropDownVal);
                }
            }
        });

    })
}


function spectrumColorForAssignment() {
    $('#tblLegend > tbody > tr').each(function () {
        var firstTd = $(this).find('td:first');
        var firstTdColor = firstTd.css('background-color');
        firstTd.spectrum({
            preferredFormat: "hex",
            color: firstTdColor,
            showAlpha: true,
            showInput: true,
            change: function (color) {
                var currentColorIndex = preservedColor.filter(x => x.RandomColor == rgba2hex(firstTdColor));
                if (currentColorIndex.length > 0) {
                    currentColorIndex[0].RandomColor = color.toHexString();
                    getFilterEquipmentEntityAssignmentByYear();
                }
            }
        });

    })
}


function filterFunctionForAssignment(dropDownVal) {
    $("#tblLegend tr").each(function (index) {
        var row = $(this);

        if (dropDownVal == 0) {
            row.show();
        }
        else {
            if (index !== 0) {
                if (row.find('td:last').text().toLowerCase() != dropDownVal.toLowerCase().trim()) {
                    row.hide();
                }
                else {
                    row.show();
                }
            }
        }
    });
    getFilterEquipmentEntityAssignmentByYear();
}


function bindChangeProp() {
    $('#changeProp').change(function () {
        onChangePropDropDown();
    })
}
function onChangePropDropDown() {
    var dataType = $('#changeProp').find(":selected").attr('datatype').toLowerCase();
    $('#propName').attr('dataType', dataType);
    var textType = dataType == 'bool' ? 'checkbox' : dataType == 'int' || dataType == 'decimal' ? 'number' : dataType == 'hyperlink' ? 'url' : dataType == 'datetime' ? 'date' : 'text';
    if (dataType == 'bool') {
        $('#dataValue').prop('checked', false).addClass('checkboxStyleEdit');
    }
    else {
        $('#dataValue').removeClass('checkboxStyleEdit');
    }
    $('#dataValue').attr('type', textType);
}


function openEditPopupFromChild(element) {
    openEditPopup($(element).parent())
}


function removeEntEquDetail() {
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Entity/RemoveEntityEquipmentTemplateDetail',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: JSON.stringify({ 'deatailID': $('#currEntDTLID').val(), 'isEntity': isEntityDeleted }),
        success: function (data) {
            alert(data.data)
            if (data.IsValid) {

                $('#editEntityEquipment').modal('hide');
                $('#calendarControlModel').modal('hide');
                if (isEntityDeleted) {
                    $("#entityHDR > tbody").find("[value='" + ccEntityID + "']").parent().trigger('click');
                }
                else {
                    $("#equipHDR > tbody").find("[value='" + ccEquipID + "']").parent().trigger('click');
                }
                $('#editTemplate').trigger('click');
                setTimeout(callFunction, 500)
            }
            else {
                alert(data.data)
            }
        }, error: function (ex) { }
    });
}

function sortTables(tablename) {
    $(tablename).trigger("destroy", [false, function () {
        $(tablename + " th").resizable();
        $(tablename + ' > thead tr').sortable({
            containment: "parent",
            placeholder: "placeholder",
            opacity: 0.5,
            helper: "clone",
            axis: 'x',
            start: function (e, ui) {
                var ind_th = ui.item.index();
                $(tablename + '#tbody tr').each(function (ind, el) {
                    $('td', el).eq(ind_th).addClass('drg');
                });
            },
            stop: function (e, ui) {
                var itInd = ui.item.index() - 1;
                $(tablename + " > tbody tr").each(function (ind, el) {
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
        $(tablename + ' > thead tr').disableSelection();
        $(tablename).tablesorter({ emptyTo: 'none/zero' }).trigger("update");
    }]);

}

function checkNumericModel(e, event) {
    var dataType = $('#propName').attr('dataType').toLowerCase();
    if (dataType == "int") {
        var charCode = (e.which) ? e.which : event.keyCode
        var data = e.value;
        if (String.fromCharCode(charCode).match(/[^0-9]/g)) {
            data = data.replace(String.fromCharCode(charCode), '');
            e.value = data;
            event.preventDefault();
        }
    }
}

function checkNumeric(e, event) {
    var charCode = (e.which) ? e.which : event.keyCode
    var data = e.value;
    if (String.fromCharCode(charCode).match(/[^0-9]/g)) {
        data = data.replace(String.fromCharCode(charCode), '');
        e.value = data;
        event.preventDefault();
    }
}

function searchInTable(tableName) {
    $('#' + tableName + ' > tbody > tr').prop('hidden', false);
    $('#' + tableName + '> tbody > tr:first > td').each(function () {
        var elementVal = $(this).find('input').val();
        var elementTd = $(this).index();
        if (elementVal != '' && elementVal != undefined) {
            $('#' + tableName + ' > tbody > tr').each(function () {
                if ($(this).index() == 0 || $(this).prop('hidden')) {
                    return;
                }
                if ($(this).find('td:eq(' + elementTd + ')').text().toLowerCase().indexOf(elementVal.toLowerCase()) > -1) {
                    $(this).prop('hidden', false);
                }
                else {
                    $(this).prop('hidden', true);
                }
            })
        }
    });
}

function entityTypeChange() {
    var selectedEntity = $('#entityTypeInColumns').find(':selected').val()
    $('#entityTemplateModelBody').find('div').prop('hidden', true);
    $('#entityTemplateModelBody').find('[entType="' + selectedEntity + '"]').prop('hidden', false);
}

function equipTypeChange() {
    var selectedEntity = $('#equipTypeInColumns').find(':selected').val()
    $('#equipmentTemplateModelBody').find('div').prop('hidden', true);
    $('#equipmentTemplateModelBody').find('[equipType="' + selectedEntity + '"]').prop('hidden', false);
}
