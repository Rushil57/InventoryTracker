﻿//var isLoadTime = true;
var draggedEquipID = 0;
var dropEntityID = 0;
var draggedElementUnitID = '';
var startDate = $('.datepicker');
var tblHDR = '<th scope="col">Entity Name</th>';
var dropDownVal = '';
var ccEntityID = 0;
var equipmentModelBody = $('#equipmentModelBody');
var equipmentTempDTL = $('#equipmentTempDTL');
var gbl_selected_td;
var dataArray = [];
var preservedColor = [];
var gbl_equipment_id = '0';

var gbl_all_equip_data = [];
var gbl_all_entity_header_data = [];
var ccEntityName = '';
var ccUnitIDSelectList = '';
var isDropDownChange = false;
var isAddNew = false;
var addNewSelectList = '<option selected>Please select</option>';
var dateRangeTmp = '';
var isSearchDropDown = false;

var alreadyAddedEntityCol = [];
var alreadyAddedEquipmentCol = [];

$(document).ready(function () {
    //    loadAllEquipTemp();
    //    $('.datepicker').datepicker({
    //        autoclose: true
    //    }).on('change', function (e) {
    //        currentDate = this.value;
    //        if (isLoadTime) {
    //            isLoadTime = false;
    //            return;
    //        }
    //        //loadTemplateDetails(currentEquipID, currentDate, currentUnitID, currentEquipmentType, currentVendor)
    //    }).datepicker('setDate', new Date());
    loadAllEntityTemp();
    $(".ui-state-default").on("mouseleave", function () { $('#DivToShow').hide(); });
    loadEntityHDR('', false);
    loadEquipmentHDR('', false);
    resizableTable();
    sortableTable();
    $('#selectedMenu').text($('#menuEntEquAss').text());
    isFirstRowTextBox = true;
});
function bindTooltipForDates() {


    $("#monthsDatePicker td").attr("data-html", "true")
        .attr("data-placement", "top")
        .attr("data-popover-content", "#a1")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "focus");
    $("#monthsDatePicker td").on('hidden.bs.popover', function () {
        $("#monthsDatePicker td").removeAttr("data-html")
            .removeAttr("data-placement")
            .removeAttr("data-popover-content")
            .removeAttr("data-toggle")
            .removeAttr("data-trigger");
        $("#monthsDatePicker td").attr("data-html", "true")
            .attr("data-placement", "top")
            .attr("data-popover-content", "#a1")
            .attr("data-toggle", "popover")
            .attr("data-trigger", "focus");
    });


    $("#monthsDatePicker td").popover({
        sanitize: false,
        html: true,
        container: 'body',
        trigger: 'hover',
        content: function () {

            var content = $(this).attr("data-popover-content");

            var equipmentID = $($(this).children(".ui-state-default")[0].outerHTML).attr('equipmentid');
            if (equipmentID == undefined) {
                return
            }
            var unitID = $($(this).children(".ui-state-default")[0].outerHTML).attr('unitID');
            gbl_selected_td = $($(this).children(".ui-state-default")[0].outerHTML);
            equipmentTemplateString = '';
            equipmentTemplateString += '<div><h6> <label>Current Unit ID:</label>&nbsp;<label type="text" id="currEquipID">' + unitID + '</label></h6></div><table class="table" style="margin:2.5px !important;"><thead style="background-color: #4472c4; color: white; "><tr><th scope="col">Property Name</th><th scope="col">Data Value</th><th scope="col">Start Date</th><th scope="col">End Date</th></tr></thead><tbody>';
            var equip_all_data = gbl_all_equip_data.filter(x => x.Equip_ID == equipmentID);
            for (var i = 0; i < equip_all_data.length; i++) {
                var equipmentValue = equip_all_data[i].Eq_Value.trim();
                var sDate = equip_all_data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(equip_all_data[i].Start_Date);
                var eDate = equip_all_data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(equip_all_data[i].End_Date);
                equipmentTemplateString += '<tr><td>' + equip_all_data[i].Prop_Name + '</td><td>' + equipmentValue + '</td><td>' + sDate + '</td><td>' + eDate + '</td>';

            }
            equipmentTemplateString += '</tbody></table></div>';
            $('#a1').html('<div class="popover-body">' + equipmentTemplateString + ' </div>');
            return $(content).children(".popover-body").html();
        },
        //title: function () {
        //    var title = $(this).attr("data-popover-content");
        //    return $(title).children(".popover-heading").html();
        //}
    });
}

function loadEquipmentHDR(searchString, searchflag) {
    if (searchflag == true || startIndexEquip == 0) {
        $("#equipHDR > tbody > tr").remove();
    }
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Equipment/GetEquipmentHeadersfromEquipmentEntity',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'searchString': searchString, 'startDate': $('#mainDate').val() },
        success: function (data) {
            if (data.IsValid) {

                for (var i = 0; i < data.data.length; i++) {

                    $("#equipHDR > tbody:last").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td>' + data.data[i].EQUIP_TYPE + '</td><td>' + data.data[i].VENDOR + '</td><td>' + data.data[i].UNIT_ID + '</td><td class="assigned">' + data.data[i].ASSIGNED + '</td><td class="active">' + data.data[i].Active + '</td><tr>')
                    addNewSelectList += "<option value='" + data.data[i].EQUIP_ID + "'>" + data.data[i].UNIT_ID + "</option>";
                }
                $("#equipHDR > tbody >  tr").draggable({
                    helper: 'clone',
                    start: function (e, ui) {

                        var id = $(this).find("input");
                        draggedEquipID = id.val();
                        var tableHeadLength = $("#equipHDR > thead > tr >  th").length
                        for (var th = tableHeadLength; th >= 0;) {
                            var headtext = $($("#equipHDR > thead > tr >  th")[th]).text();
                            if (headtext == "Unit ID") {
                                var tdValue = $(this).find("td:eq(" + th + ")");

                                draggedElementUnitID = tdValue.text();
                                break;
                            }
                            th = th - 1;
                        }
                    },
                    stop: function () {
                    }
                });
                if ($("#equipHDR").find('.static-rw').length == 0) {
                    $("#equipHDR > tbody > tr:first").before('<tr class="static-rw" style="cursor:pointer"><td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'equipHDR\')"></td><td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'equipHDR\')"></td><td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'equipHDR\')"></td><td><input type="text" class="form-control"  style="height:30px" onkeyup="searchInTable(\'equipHDR\')"></td><td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'equipHDR\')"></td><tr>')
                }
                $("#equipHDR").trigger("destroy", [false, function () {
                    resizableTable();
                    sortableTable();
                    $("#equipHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
                        setTimeout(function () {
                            var frHtml = $("#equipHDR").find('.static-rw');
                            $("#equipHDR").find('.static-rw').remove();

                            $("#equipHDR > tbody > tr:first").before(frHtml);
                        }, 10)
                    }).trigger("update");
                }]);

                var rowCount = 0;

                $('#equipHDR tr').each(function (index, element) {
                    if ($(element).attr('style')) {
                        rowCount = rowCount + 1;
                    }
                });
                rowCount = rowCount > 0 ? rowCount - 1 : rowCount;
                $("#totalCount").html("Displaying " + rowCount + " out of " + data.totalCount);
            }
        }, error: function (ex) { }
    });
}


function loadEntityHDR(searchString, searchflag) {
    if (searchflag == true || startIndexEntity == 0) {
        $("#entityHDR > tbody > tr").remove();
    }
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Entity/GetEntityHeaders',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'searchString': searchString },
        success: function (data) {
            if (data.IsValid) {
                var entityString = '';
                var icn = "";
                for (var i = 0; i < data.data.length; i++) {
                    icn = '<svg onclick="openCC(\'' + data.data[i].ENT_NAME + '\',' + data.data[i].ENT_ID + ')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg>';
                    $("#entityHDR").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].ENT_ID + '"/><td>' + data.data[i].ENT_NAME + '</td> <td class="droppable"></td><td class="addEntity"> ' + icn + '</td></tr>');
                }

                GetEquipmentEntityAssignment(0);


                $(".droppable").droppable({
                    drop: function (event, ui) {
                        var assignElement = $("#equipHDR > tbody >  tr").find('input[value="' + draggedEquipID + '"]').parent().find('.assigned');
                        var totalAssignCount = $(assignElement[0]).text();
                        dropEntityID = $(this).parent().find("input").val();
                        $(this).append('<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + draggedEquipID + '" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date: ' + $('#mainDate').val() + ' <br/> End date: 01/01/9999">' + draggedElementUnitID + '<div onclick="deleteAssignment(' + dropEntityID + ',' + draggedEquipID + ',this,\'' + $('#mainDate').val() + '\',\'01/01/9999\',0)" class="cls-remove-tag"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg></div></div></div>');
                        assignElement.text(parseInt(totalAssignCount) + 1);

                        var equipActive = $("#equipHDR > tbody >  tr").find('input[value="' + draggedEquipID + '"]').parent().find('.active');
                        var equipActiveCount = $(equipActive[0]).text();
                        equipActive.text(parseInt(equipActiveCount) + 1);


                        bindTooltip();
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
                            data: JSON.stringify({ 'entityID': dropEntityID, 'equipID': draggedEquipID, 'startDate': startDate.val(), 'isDelete': 0, 'endDate': '9999/01/01', 'equipEntID': 0 }),
                            success: function (data) {
                                //loadEquipmentHDR('');
                            }, error: function (ex) { }
                        });
                    }
                });
                if ($("#entityHDR").find('.static-rw').length == 0) {
                    var firstTrHTML = '';
                    $("#entityHDR > thead > tr >  th").each(function () {
                        if ($(this).text() == '\n                            ') {
                            firstTrHTML += '<td class="addEntity"></td>'
                        }
                        else {
                            firstTrHTML += '<td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'entityHDR\')"></td>'
                        }
                    })
                    $("#entityHDR > tbody > tr:first").before('<tr style="cursor:pointer" class="static-rw">' + firstTrHTML + '<tr>');
                }

                $("#equipHDR").trigger("destroy", [false, function () {
                    resizableTable();
                    sortableTable();
                    $("#equipHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
                        setTimeout(function () {
                            var frHtml = $("#equipHDR").find('.static-rw');
                            $("#equipHDR").find('.static-rw').remove();

                            $("#equipHDR > tbody > tr:first").before(frHtml);
                        }, 10)
                    }).trigger("update");
                }]);

                var rowCount = 0;

                $('#entityHDR tr').each(function (index, element) {
                    if ($(element).attr('style')) {
                        rowCount = rowCount + 1;
                    }
                });
                rowCount = rowCount > 0 ? rowCount - 1 : rowCount;
                $("#totalCount1").html("Displaying " + rowCount + " out of " + data.totalCount);

            }
        }, error: function (ex) { }
    });
}

$('#btnSearchEntity').click(function () {
    addEntityHeader(true);
})

function addEntityColumn() {
    entityTemplate.modal('hide');
    $('#entityTemplateModelBody .form-check-input').each(function () {
        var id = $(this).attr('id');
        if ($(this).is(':checked')) {
            if (jQuery.inArray(id, alreadyAddedEntityCol) >= 0) {

                var currInd = $("#entityHDR > thead >  tr >  th:contains(" + id + ")").index();
                $("#entityHDR > thead >  tr >  th").eq(currInd).prop('hidden', false)
                $("#entityHDR > tbody >  tr").each(function () {
                    $(this).find('td').eq(currInd).prop('hidden', false);
                });
            }
            else {
                alreadyAddedEntityCol.push(id);
                $.ajax({
                    before: AddLoader(),
                    complete: function () { setTimeout(function () { RemoveLoader(); }, 500); },
                    url: '/Entity/EntityValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': id, 'date': $('#mainDate').val() },
                    success: function (data) {
                        var addEntityIndex = $("#entityHDR > tbody > tr:first").find('.addEntity').index();
                        $('#entityHDR th').eq(addEntityIndex).before("<th scope=\"col\">" + id + "</th>");
                        $("#entityHDR > tbody > tr:first > td").eq(addEntityIndex).before('<td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'entityHDR\')"></td>');
                        var i = 0;
                        $("#entityHDR > tbody > tr").each(function (index) {
                            if (index == 0) {
                                return
                            }
                            if (i < data.data.length && data.data.length > 0 && $(this).find('input[value="' + data.data[i].Ent_ID + '"]').length > 0) {
                                $(this).find('.addEntity').before('<td>' + data.data[i].Ent_Value + '</td>');
                                i++;
                            }
                            else {
                                $(this).find('.addEntity').before('<td></td>');
                            }
                        });
                    },
                    error: function (ex) { }
                });
            }
        }
        else {
            $("#entityHDR > thead >  tr >  th").each(function (index) {
                if ($(this).text() == id) {
                    $("#entityHDR > thead >  tr >  th").eq(index).prop('hidden', true);
                    $("#entityHDR > tbody >  tr").each(function () {
                        $(this).find('td').eq(index).prop('hidden', true);
                    });
                }
            })
        }
    });
}
function addEntityColumn_Old() {
    entityTemplate.modal('hide');
    var tableHeader = '';
    var hdrdata = [];
    $("#entityHDR th").each(function (index) {
        var headerdata = "<th scope=\"col\">" + $(this).text() + "</th>";
        if (hdrdata.indexOf(headerdata) == -1) {
            hdrdata.push(headerdata);
        }
    });
    // tableHeader += tblHDR;/*' <th scope="col">Entity type</th> <th scope="col">Entity name</th>';*/
    //tableHeader += ' <th scope="col">Entity type</th> <th scope="col">Entity name</th><th scope="col">Equipment Assigned</th>';
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
                    $.ajax({
                        before: AddLoader(),
                        complete: function () { setTimeout(function () { RemoveLoader(); }, 500); },
                        url: '/Entity/EntityValueByPropName',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        type: 'GET',
                        async: false,
                        data: { 'propName': id, 'date': $('#mainDate').val() },
                        success: function (data) {
                            var indexOfID = -1;
                            var j = 0;
                            $("#entityHDR > thead >  tr >  th").each(function () {
                                if ($(this).text().toLowerCase() == id.toLowerCase()) {
                                    indexOfID = j;
                                    return;
                                }
                                j++;
                            })
                            for (var i = 0; i < data.data.length; i++) {
                                if (indexOfID >= 0) {
                                    $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('td:eq(' + indexOfID + ')').text(data.data[i].Ent_Value)
                                }
                                else {
                                    $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('.addEntity').next().text(data.data[i].Ent_Value);
                                }
                            }

                        },
                        error: function (ex) { }
                    });
                }
                if (hdrdata.indexOf("<th scope=\"col\">" + id + "</th>") == -1) {

                    if ($(this).text().toLowerCase() == "entity name") {
                        var data = $(this).html();
                        var a = hdrdata.indexOf("<th scope=\"col\">Entity Name</th>");
                        hdrdata.splice(a + 1, 0, "<th scope=\"col\">" + id + "</th>");
                    }
                }
            });
            if (isPresent) {
                // tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
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
                    data: { 'propName': id, 'date': $('#mainDate').val() },
                    success: function (data) {
                        $("#entityHDR > tbody >  tr").each(function () {
                            $(this).find('.addEntity').after('<td></td>')
                        })
                        for (var i = 0; i < data.data.length; i++) {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('.addEntity').next().text(data.data[i].Ent_Value);
                        }
                        if (data.data.length == 0) {
                            $("#entityHDR > tbody >  tr").find('input[value=""]').parent().find('.addEntity').next().text();
                        }
                    },
                    error: function (ex) { }
                });
            }
        }
        else {
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
    //  tableHeader += '<th scope="col">Equipment Assigned</th><th></th>';
    $("#entityHDR > thead >  tr > th").remove();
    $("#entityHDR > thead >  tr").append(hdrdata.toLocaleString().replaceAll(',', ''));
    $("#entityHDR").trigger("destroy", [false, function () {
        resizableTable();
        sortableTable();
        $("#entityHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
            setTimeout(function () {
                var frHtml = $("#equipHDR").find('.static-rw');
                $("#equipHDR").find('.static-rw').remove();

                $("#equipHDR > tbody > tr:first").before(frHtml);
            }, 10)
        }).trigger("update");
    }]);
}


function addEntityHeader(isSearch) {
    //loadEntityHDR('', false);
    if (isSearch == undefined || !isSearch) {
        addEntityColumn();
        resizableTable();
        sortableTable();
    }
    $("#entityHDR tr").each(function (index) {
        if (index !== 0 && index != 1) {
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

function addEquipmentHeader(isSearch) {

    if (isSearch == undefined || !isSearch) {
        addEquipmentColumn();
        resizableTable();
        sortableTable();
    }
    $("#equipHDR tr").each(function (index) {
        if (index !== 0 && index != 1) {
            var row = $(this);
            var isHide = true;
            row.find('td').each(function () {
                if ($(this).text().toLowerCase().indexOf($('#searchEquipmentStr').val().toLowerCase().trim()) != -1) {
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


function exportData() {
    var headerCol = '';
    $('#entityHDR > thead > tr > th').each(function () {
        if ($(this).text() == "Entity Name" || $(this).text() == "Equipment Assigned" || $(this).text() == "\n                            ") {

        }
        else {
            headerCol += $(this).text() + ',';
        }
    });
    AddLoader()
    window.location = "/Equipment/EquipmentEntityAssignExport?startDate=" + $('#mainDate').val() + "&searchString=" + $('#searchEntityStr').val().trim() + "&columns=" + headerCol;
    _tmr = window.setInterval(function () {
        var _str = getCookie("cookie_EquipmentEntityAssignExport");
        if (document.cookie.indexOf(_str) !== -1) {
            setTimeout(function () { RemoveLoader(); }, 1000);
            clearInterval(_tmr)
            ClearCockie("cookie_EquipmentEntityAssignExport");
        }
    }, 1000);
}



function importExcel() {
    if ($('#file').val().trim() == '') {
        alert('Please select file.')
        return;
    }
    else if (isDateRangeImport) {
        var fileUpload = $("#file").get(0);
        var files = fileUpload.files;
        var formData = new FormData();

        formData.append("file", files[0]);
        formData.append("operation", $("input[type='radio'][name='operationOptions']:checked").val());
        $.ajax({
            before: AddLoader(),
            complete: function () {
                setTimeout(function () {
                    RemoveLoader();
                }, 500);
            },
            type: "POST",
            url: '/Equipment/EquipmentEntityAssignDateRangeImport',
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                var newData = JSON.parse(data);
                if (newData.data != '') {
                    alert(newData.data);
                }
                if (newData.IsValid) {
                    isDateRangeImport = false;
                    alert('Data updated successfully.')
                    $('#importExcel').modal('hide');
                    loadEntityHDR('', false);
                    loadEquipmentHDR('', false);
                    $('#summaryBody').html(' <h6><label>How many new pieces of equipment have been assigned: </label>&nbsp;<label id="excelTotalNewAssign"></label><br/> <label>How many new pieces of equipment have been removed: </label>&nbsp;<label id="excelTotalRemove"></label><br/><label>How many new pieces of equipment have > 1 assignment: </label>&nbsp;<label id="gtOneAssign"></label><br/><label>How many total record loaded:</label>&nbsp;<label id="totalRecords"></label><br/><label>How many records have invalid equipment units: </label>&nbsp;<label id="invalidRecords"></label><br/><label>How many records have been updated: </label>&nbsp;<label id="updatedRecords"></label></h6>');
                    $('#excelTotalNewAssign').text(newData.excelTotalNewAssign);
                    $('#excelTotalRemove').text(newData.excelTotalRemove);
                    $('#gtOneAssign').text(newData.gtOneAssign)
                    $('#totalRecords').text(newData.totalRecords)
                    $('#updatedRecords').text(newData.excelUpdatedCount)
                    var invalidRecordText = newData.excelInvalidUnitIDCount;
                    if (newData.excelInvalidUnitIDCount > 0) {
                        invalidRecordText += " [" + newData.excelInvalidUnitID + "]";
                    }
                    $('#invalidRecords').text(invalidRecordText)
                    $('#summary').modal('show');
                }
            },
            error: function (e1, e2, e3) {
            }
        });
    }
    else {
        var fileUpload = $("#file").get(0);
        var files = fileUpload.files;
        var formData = new FormData();

        formData.append("file", files[0]);

        $.ajax({
            before: AddLoader(),
            complete: function () {
                setTimeout(function () {
                    RemoveLoader();
                }, 500);
            },
            type: "POST",
            url: '/Equipment/EquipmentEntityAssignImport',
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                var newData = JSON.parse(data);
                if (newData.data != '') {
                    alert(newData.data);
                }
                if (newData.IsValid) {
                    alert('Data updated successfully.')
                    $('#importExcel').modal('hide');
                    loadEntityHDR('', false);
                    loadEquipmentHDR('', false);
                    $('#summaryBody').html(' <h6><label>How many new pieces of equipment have been assigned: </label>&nbsp;<label id="excelTotalNewAssign"></label><br/> <label>How many new pieces of equipment have been removed: </label>&nbsp;<label id="excelTotalRemove"></label><br/><label>How many new pieces of equipment have > 1 assignment: </label>&nbsp;<label id="gtOneAssign"></label><br/><label>How many total record loaded:</label>&nbsp;<label id="totalRecords"></label><br/><label>How many records have invalid equipment units: </label>&nbsp;<label id="invalidRecords"></label></h6>');
                    $('#excelTotalNewAssign').text(newData.excelTotalNewAssign);
                    $('#excelTotalRemove').text(newData.excelTotalRemove);
                    $('#gtOneAssign').text(newData.gtOneAssign)
                    $('#totalRecords').text(newData.totalRecords)
                    var invalidRecordText = newData.excelInvalidUnitIDCount;
                    if (newData.excelInvalidUnitIDCount > 0) {
                        invalidRecordText += " [" + newData.excelInvalidUnitID + "]";
                    }
                    $('#invalidRecords').text(invalidRecordText)
                    $('#summary').modal('show');
                }
            },
            error: function (e1, e2, e3) {
            }
        });
    }
}

var mouseX;
var mouseY;
$(document).mousemove(function (e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
});

nextPrevYear();

function onChangeYear() {
    bindTooltipForDates();
    $('#currentYear').text($('.ui-datepicker-year:first').text());
    //$(".ui-state-default").on("mouseenter", function () {
    //    var equipmentID = $($(this)[0].outerHTML).attr('equipmentid');
    //    var unitID = $($(this)[0].outerHTML).attr('unitID');
    //    gbl_selected_td = $($(this)[0].outerHTML);
    //    equipmentTemplateString = '';  
    //    console.log(this);
    //    console.log("a" + $('#a1').html());
    //    console.log('UI=>' + unitID);

    //    equipmentTemplateString += '<div><h6> <label>Current Unit ID:</label>&nbsp;<label type="text" id="currEquipID">' + unitID + '</label></h6></div><table class="table" style="margin:2.5px !important;"><thead style="background-color: #4472c4; color: white; "><tr><th scope="col">Property Name</th><th scope="col">Data Value</th><th scope="col">Start Date</th><th scope="col">End Date</th></tr></thead><tbody>';
    //    var equip_all_data = gbl_all_equip_data.filter(x => x.Equip_ID == equipmentID);
    //    for (var i = 0; i < equip_all_data.length; i++) {
    //        var equipmentValue = equip_all_data[i].Eq_Value.trim();
    //        var sDate = equip_all_data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(equip_all_data[i].Start_Date);
    //        var eDate = equip_all_data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(equip_all_data[i].End_Date);
    //        equipmentTemplateString += '<tr><td>' + equip_all_data[i].Prop_Name + '</td><td>' + equipmentValue + '</td><td>' + sDate + '</td><td>' + eDate + '</td>';

    //    }
    //    equipmentTemplateString += '</tbody></table></div>';
    //    $('#a1').html('<div class="popover-body">' + equipmentTemplateString + ' </div>');

    //    //setTimeout(bindTooltipForDates(), 1000);

    //});
    getEquipmentEntityAssignmentByYear(ccEntityID);
}

function openCC(entityName, entityID) {
    ccEntityID = entityID;
    if (entityName != '') {
        ccEntityName = entityName;
    }
    $('.selectDrpDown').html(uniqueEquipType).find('option:first').text('No Filter');
    if (!$.fn.bootstrapDP && $.fn.datepicker && $.fn.datepicker.noConflict) {
        var datepicker = $.fn.datepicker.noConflict();
        $.fn.bootstrapDP = datepicker;
    }
    $('#currentYear').text($('.ui-datepicker-year:first').text());
    $("#monthsDatePicker").datepicker("destroy");
    $("#monthsDatePicker").datepicker({
        numberOfMonths: [3, 4],
        changeMonth: false,
        changeYear: false,
        stepMonths: 12,
        //beforeShowDay: colorize,
        defaultDate: '01/01/' + new Date().getFullYear(),
        onSelect: function (date, inst) {
            inst.show();

            //openAssignmentPopup();
            //defaultz
            //alert($(this).val())
            //deleteAssignment(entityID, $(el).attr('equipmentid'), el, null, null)
            //getEquipmentEntityAssignmentByYear(entityID)
        }
    });

    $('.ui-datepicker').addClass('ccStyle')
    setTimeout(onChangeYear(), 500)

    //function colorize(date) {
    //    if ((date.getMonth() + 1) != 3) return [true, ""];
    //    if (date.getDate() < 18) return [true, "notcool"];

    //    return [true, "cool"];
    //}

    $('#ccEntityName').attr('hidden', false).text(ccEntityName);
    $('#calendarControlModel').modal('show');
}
function getFilterEquipmentEntityAssignmentByYear() {
    selectedvalue = $('.selectDrpDown :selected').text().toLowerCase();
    if (selectedvalue == 'no filter') {
        bindFilterCalender(dataArray);
    } else {
        var filterArray = dataArray.filter(x => x.EQUIP_TYPE.toLowerCase() == selectedvalue);
        bindFilterCalender(filterArray);


    }
}

function bindFilterCalender(dataArray) {
    var legendStr = '';
    $(".ui-datepicker-calendar > tbody > tr > td").each(function () { $(this).children().css('background-color', 'rgb(246, 246, 246)').css('border', 'none'); });
    var newUnitID = [];
    for (var i = 0; i < dataArray.length; i++) {
        var isHidden = ''
        if (newUnitID.filter(x => x.UNITID == dataArray[i].UNIT_ID).length > 0) {
            isHidden = 'hidden';
        }
        newUnitID.push({
            UNITID: dataArray[i].UNIT_ID
        })
        var color = preservedColor.filter(x => x.UNITID == dataArray[i].UNIT_ID);
        if (color.length > 0) {

            legendStr += '<tr ' + isHidden + '  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Unit ID: ' + dataArray[i].UNIT_ID + '<br/> Start Date: ' + getFormattedDate(dataArray[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(dataArray[i].END_DATE) + '"><input type="hidden" EQUIP_ENT_ID="' + dataArray[i].EQUIP_ENT_ID + '" isBorderedBox="1" equipmentid="' + dataArray[i].EQUIP_ID + '" data-ent-id="' + dataArray[i].ENT_ID + '" unitID ="' + dataArray[i].UNIT_ID + '" data-start-date="' + dataArray[i].START_DATE + '" data-end-date="' + dataArray[i].END_DATE + '"  onclick="openAssignmentPopup()"><td style="cursor:pointer;background-color:' + color[0].RandomColor + '"></td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].UNIT_ID + '\')">' + dataArray[i].UNIT_ID + '</td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].UNIT_ID + '\')">' + dataArray[i].EQUIP_TYPE + '</td></tr>';

        } else {
            legendStr += '<tr ' + isHidden + '  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Unit ID: ' + dataArray[i].UNIT_ID + '<br/> Start Date: ' + getFormattedDate(dataArray[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(dataArray[i].END_DATE) + '"><input type="hidden" EQUIP_ENT_ID="' + dataArray[i].EQUIP_ENT_ID + '" isBorderedBox="1" equipmentid="' + dataArray[i].EQUIP_ID + '" data-ent-id="' + dataArray[i].ENT_ID + '" unitID ="' + dataArray[i].UNIT_ID + '" data-start-date="' + dataArray[i].START_DATE + '" data-end-date="' + dataArray[i].END_DATE + '"  onclick="openAssignmentPopup()"><td style="cursor:pointer;background-color:' + dataArray[i].RendomColor + '"></td><td style="cursor:pointer;"  onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].UNIT_ID + '\')">' + dataArray[i].UNIT_ID + '</td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].UNIT_ID + '\')">' + dataArray[i].EQUIP_TYPE + '</td></tr>';
        }
        $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
            var currMonth = $(this).attr('data-month');
            var currYear = $(this).attr('data-year');
            var currDay = $(this).text()
            var currDate = new Date(currYear, currMonth, currDay);
            if (new Date(dataArray[i].START_DATE) <= currDate && new Date(dataArray[i].END_DATE) >= currDate) {
                if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                    $(this).children().attr('equipmentID', dataArray[i].EQUIP_ID).attr('unitID', dataArray[i].UNIT_ID)
                        .attr('data-start-date', dataArray[i].START_DATE).attr('data-end-date', dataArray[i].END_DATE)
                        .attr('data-ent-id', dataArray[i].ENT_ID)
                        .attr('EQUIP_ENT_ID', dataArray[i].EQUIP_ENT_ID)
                        .attr('onclick', "openAssignmentPopup()");
                    var color = preservedColor.filter(x => x.UNITID == dataArray[i].UNIT_ID);
                    if (color.length > 0) {

                        $(this).children().css('background-color', '\'' + color[0].RandomColor + '\'')
                    } else {
                        $(this).children().css('background-color', '\'' + dataArray[i].RendomColor + '\'')
                    }
                    $(this).children().attr('isBorderedBox', '0');
                }
                else {
                    $(this).children().css('border', '2px solid black')
                    $(this).children().attr('isBorderedBox', '1');
                    //$(this).children().css('border', '4px solid ' + $(this).children().css('background-color')) //#####
                }
            }
        })
    }
    $('#tblLegend > tbody > tr').remove();
    $('#tblLegend > tbody').append(legendStr);
    bindTooltip();
    spectrumColorForAssignment();
}
function getEquipmentEntityAssignmentByYear(entityID) {
    var year = $('#currentYear').text();
    $(".ui-datepicker-calendar > tbody > tr > td").each(function () { $(this).children().css('background-color', 'rgb(246, 246, 246)').css('border', 'none'); });
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        type: "GET",
        url: '/Equipment/GetEquipmentEntityAssignmentByYear?year=' + year + '&entityID=' + entityID,
        contentType: false,
        processData: false,
        success: function (data) {
            var newData = JSON.parse(data);
            if (newData.IsValid) {
                var legendStr = '';
                dataArray = newData.data;
                for (var i = 0; i < newData.data.length; i++) {
                    //legendStr += '<tr><td style="background-color:#' + newData.data[i].RendomColor + '"></td><td>' + newData.data[i].UNIT_ID + '</td><td>' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                    var isHidden = '';
                    if (preservedColor.filter(x => x.UNITID == newData.data[i].UNIT_ID).length > 0) {
                        isHidden = 'hidden';
                    }

                    if (preservedColor.indexOf(newData.data[i].RendomColor) == -1) {
                        var obj = {
                            RandomColor: '#' + newData.data[i].RendomColor,
                            UNITID: newData.data[i].UNIT_ID
                        };
                        preservedColor.push(obj);
                    }
                    var color = preservedColor.filter(x => x.UNITID == newData.data[i].UNIT_ID);
                    if (color.length > 0) {

                        legendStr += '<tr ' + isHidden + '  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Unit ID: ' + newData.data[i].UNIT_ID + '<br/> Start Date: ' + getFormattedDate(newData.data[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(newData.data[i].END_DATE) + '"><input EQUIP_ENT_ID="' + newData.data[i].EQUIP_ENT_ID + '" type="hidden" isBorderedBox="1" equipmentid="' + newData.data[i].EQUIP_ID + '" data-ent-id="' + newData.data[i].ENT_ID + '" unitID ="' + newData.data[i].UNIT_ID + '" data-start-date="' + newData.data[i].START_DATE + '" data-end-date="' + newData.data[i].END_DATE + '"  onclick="openAssignmentPopup()"> <td style="cursor:pointer;background-color:' + color[0].RandomColor + '"></td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].UNIT_ID + '\')">' + newData.data[i].UNIT_ID + '</td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].UNIT_ID + '\')">' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                    } else {
                        legendStr += '<tr ' + isHidden + ' data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Unit ID: ' + newData.data[i].UNIT_ID + '<br/> Start Date: ' + getFormattedDate(newData.data[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(newData.data[i].END_DATE) + '"><input type="hidden" EQUIP_ENT_ID="' + newData.data[i].EQUIP_ENT_ID + '"  isBorderedBox="1" equipmentid="' + newData.data[i].EQUIP_ID + '" data-ent-id="' + newData.data[i].ENT_ID + '" unitID ="' + newData.data[i].UNIT_ID + '" data-start-date="' + newData.data[i].START_DATE + '" data-end-date="' + newData.data[i].END_DATE + '"  onclick="openAssignmentPopup()"><td style="cursor:pointer;background-color:' + newData.data[i].RendomColor + '"></td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].UNIT_ID + '\')">' + newData.data[i].UNIT_ID + '</td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].UNIT_ID + '\')">' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                    }

                    $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
                        var currMonth = $(this).attr('data-month');
                        var currYear = $(this).attr('data-year');
                        var currDay = $(this).text()
                        var currDate = new Date(currYear, currMonth, currDay);
                        if (new Date(newData.data[i].START_DATE) <= currDate && new Date(newData.data[i].END_DATE) >= currDate) {
                            if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                                $(this).children().attr('equipmentID', newData.data[i].EQUIP_ID).attr('unitID', newData.data[i].UNIT_ID)
                                    .attr('data-start-date', newData.data[i].START_DATE).attr('data-end-date', newData.data[i].END_DATE)
                                    .attr('data-ent-id', newData.data[i].ENT_ID)
                                    .attr('onclick', "openAssignmentPopup()")
                                    .attr('EQUIP_ENT_ID', dataArray[i].EQUIP_ENT_ID);
                                var color = preservedColor.filter(x => x.UNITID == newData.data[i].UNIT_ID);
                                if (color.length > 0) {
                                    $(this).children().css('background-color', '\'' + color[0].RandomColor + '\'')

                                } else {
                                    $(this).children().css('background-color', '\'' + newData.data[i].RendomColor + '\'')
                                }
                                $(this).children().attr('isBorderedBox', '0');
                            }
                            else {
                                $(this).children().css('border', '2px solid black');
                                $(this).children().attr('isBorderedBox', '1');
                                //$(this).children().css('border', '4px solid ' + $(this).children().css('background-color')); //#######
                            }
                        }
                    })
                }
                $('#tblLegend > tbody > tr').remove();
                $('#tblLegend > tbody').append(legendStr);
                bindTooltip();

                spectrumColorForAssignment();
                filterFunctionForAssignment(dropDownVal)
                //setTimeout(bindTooltipForDates(), 500);
            }

        },
    });
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        type: "GET",
        url: '/Equipment/GetAllEquipmentTemplateDetails',
        contentType: false,
        processData: false,
        success: function (data) {
            var newData = JSON.parse(data);
            if (newData.IsValid) {
                gbl_all_equip_data = newData.data;
                gbl_all_entity_header_data = newData.entityHeaders;

            }
        },
        error: function (e1) {

            console.log(e1)

        }
    });
}

$('.selectDrpDown').change(function () {
    dropDownVal = $(this).val();
    filterFunctionForAssignment(dropDownVal);
})

function openAssignmentPopup() {
    AddLoader();
    setTimeout(function () {
        $('#updateAssignmentOption').attr('hidden', false);
        $('#removeAssignmentOption').attr('hidden', false);
        $('#saveAssignmentOption').attr('hidden', true);
        $('#dateRangeDiv').attr('hidden', false);
        $('#addNewPropOfAssign').attr('hidden', false);
        isAddNew = false;
        isDeleted = 2;
        var EQUIP_ENT_ID = $(gbl_selected_td).attr('equip_ent_id');
        var equipmentID = $(gbl_selected_td).attr('equipmentid');
        var ent_id = $(gbl_selected_td).attr('data-ent-id');
        var unitID = $(gbl_selected_td).attr('unitID');
        var isBorderedBoxVal = $(gbl_selected_td).attr('isBorderedBox');
        $('#currEquipID').text(unitID)
        $('#currID').val(EQUIP_ENT_ID)
        $('#currEquipDiv').attr('hidden', false);
        dateRangeTmp = '';
        ccUnitIDSelectList = '';
        var selectedOption = '';
        $("#tblLegend > tbody >  tr").each(function () {
            var equipmentid = $(this).find('input').attr('equipmentid');
            var equipEntID = $(this).find('input').attr('EQUIP_ENT_ID');
            selectedOption = '';
            if (!$(this).prop('hidden')) {
                if (equipmentid == equipmentID) {
                    selectedOption = 'selected';
                }
                ccUnitIDSelectList += '<option ' + selectedOption + ' value=' + equipmentid + '>' + $(this).find('input').attr('unitid') + '</option>';
            }
            if (equipmentID == equipmentid) {
                var sDateTmp = getFormattedDate($(this).find('input').attr('data-start-date'));
                var eDateTmp = getFormattedDate($(this).find('input').attr('data-end-date'));
                var selectedText = sDateTmp == deleteStartDate && eDateTmp == deleteEndDate ? 'selected' : '';
                dateRangeTmp += '<option ' + selectedText + 'EQUIP_ENT_ID="' + equipEntID + '" equipmentid="' + equipmentid + '" startDate="' + sDateTmp + '" endDate="' + eDateTmp + '">' + sDateTmp + ' - ' + eDateTmp + '</option>';
            }
        })
        $('#dateRange').html(dateRangeTmp);
        if (isBorderedBoxVal == '1' || isDropDownChange) {
            $('#changeUnitID').attr('hidden', false).html(ccUnitIDSelectList).val(equipmentID);
            isDropDownChange = false;
        }
        else {
            $('#changeUnitID').attr('hidden', true)
        }
        deleteAssignmentModel.modal('show');
        deleteEntityID = ent_id;
        deleteEquipID = equipmentID;
        //deleteElement = el;
        deleteStartDate = new Date($(gbl_selected_td).attr('data-start-date'));
        deleteEndDate = new Date($(gbl_selected_td).attr('data-end-date'));

        isDeleteAssignment = false;
        resetDeleteAssignmentModel();

        $('#startDateLbl').text($('.updateStartDatepicker').val());
        $('#endDateLbl').text($('.updateEndDatepicker').val());
        $('#calendarControlModel').css('z-index', '1035');
        setTimeout(function () { RemoveLoader(); }, 500);
    }, 100)
}

$('#changeUnitID').change(function () {
    
    if (!isAddNew) {
        resetDeleteAssignmentModel()
        isDropDownChange = true;
        gbl_selected_td = $($('.ui-datepicker-calendar').find('[unitid="' + $(this).find(":selected").text() + '"]')[0])
        if (gbl_selected_td[0] == undefined) {
            gbl_selected_td = $('#tblLegend > tbody > tr').find('[unitid="' + $(this).find(":selected").text() + '"]');
        }
        gbl_selected_td.trigger('click')
    }
    else {
        deleteEquipID = $(this).val();
    }
})

function openAssignmentPopupFromLegend(unitID) {
    gbl_selected_td = $('#tblLegend > tbody > tr').find('[unitid="' + unitID + '"]');
    openAssignmentPopup();
}

function AddNewPropOfAssign() {
    var sDate = getTodayDate();
    isAddNew = true;
    isDeleted = 0;
    $('#changeUnitID').html(addNewSelectList);
    $('.updateStartDatepicker').bootstrapDP('setDate', sDate);
    $('.updateEndDatepicker').bootstrapDP('setDate', '01/01/9999');
    $('#startDateLbl').text(sDate);
    $('#endDateLbl').text('01/01/9999');
    $('#currEquipID').text('');
    $('#updateAssignmentOption').attr('hidden', true);
    $('#removeAssignmentOption').attr('hidden', true);
    $('#saveAssignmentOption').attr('hidden', false);
    $('#dateRangeDiv').attr('hidden', true);
}


$('#dateRange').change(function () {
    var element = $(this).find(":selected");
    var sDateTmp = element.attr('startdate');
    var eDateTmp = element.attr('enddate');
    $('#currID').val(element.attr('EQUIP_ENT_ID'))
    $('#startDateLbl').text(sDateTmp);
    $('#endDateLbl').text(eDateTmp);
    $('.updateStartDatepicker').bootstrapDP('setDate', sDateTmp);
    $('.updateEndDatepicker').bootstrapDP('setDate', eDateTmp);
})


function sampleFileImportDownload() {
    $("#import").popover('hide');
    window.location.href = '/ExcelFiles/EquipmentEntityAssignSample.xlsx';
}
$(function () {
    $("#entityHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
        setTimeout(function () {
            var frHtml = $("#entityHDR").find('.static-rw');
            $("#entityHDR").find('.static-rw').remove();

            $("#entityHDR > tbody > tr:first").before(frHtml);
        }, 10)
    }).trigger("update");
    $("#equipHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
        setTimeout(function () {
            var frHtml = $("#equipHDR").find('.static-rw');
            $("#equipHDR").find('.static-rw').remove();

            $("#equipHDR > tbody > tr:first").before(frHtml);
        }, 10)
    }).trigger("update");
});
function exportDateRangeData() {
    AddLoader();
    window.location = "/Equipment/EquipmentEntityAssignDateRangeExport?startDate=" + $('#mainDate').val() + "&searchString=" + $('#searchEntityStr').val().trim() + "&cookieValue=" + cookieValue;
    _tmr = window.setInterval(function () {
        var _str = getCookie("cookie_EquipData");
        if (document.cookie.indexOf(_str) !== -1) {
            // hide animation
            setTimeout(function () { RemoveLoader(); }, 1000);
            clearInterval(_tmr)
            ClearCockie("cookie_EquipData");
        }
    }, 1000);
}

function sampleFileDateRangeImportDownload() {
    $("#importDateRange").popover('hide')
    window.location.href = '/ExcelFiles/EquipmentEntityAssignDateRangeSample.xlsx';
}


function addEquipmentColumn() {

    equipmentTemplate.modal('hide');
    $('#equipmentTemplateModelBody .form-check-input').each(function () {
        var id = $(this).attr('id');
        if ($(this).is(':checked')) {
            if (jQuery.inArray(id, alreadyAddedEquipmentCol) >= 0) {
                var currInd = $("#equipHDR > thead >  tr >  th:contains(" + id + ")").index();
                $("#equipHDR > thead >  tr >  th").eq(currInd).prop('hidden', false)
                $("#equipHDR > tbody >  tr").each(function () {
                    $(this).find('td').eq(currInd).prop('hidden', false);
                });
            }
            else {
                alreadyAddedEquipmentCol.push(id);
                $.ajax({
                    before: AddLoader(),
                    complete: function () { setTimeout(function () { RemoveLoader(); }, 500); },
                    url: '/Equipment/EquipmentValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': id, 'date': $('#mainDate').val() },
                    success: function (data) {
                        $('#equipHDR th:last').after("<th scope=\"col\">" + id + "</th>");
                        $("#equipHDR > tbody > tr:first > td:last").after('<td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'equipHDR\')"></td>');
                        var i = 0;
                        $("#equipHDR > tbody > tr").each(function (index) {
                            if (index == 0) {
                                return
                            }
                            if (i < data.data.length && data.data.length > 0 && $(this).find('input[value="' + data.data[i].Equip_ID + '"]').length > 0) {
                                $(this).find('td:last').after('<td>' + data.data[i].Eq_Value + '</td>');
                                i++;
                            }
                            else {
                                $(this).find('td:last').after('<td></td>');
                            }
                        });
                    },
                    error: function (ex) { }
                });
            }
        }
        else {
            $("#equipHDR > thead >  tr >  th").each(function (index) {
                if ($(this).text() == id) {
                    $("#equipHDR > thead >  tr >  th").eq(index).prop('hidden', true);
                    $("#equipHDR > tbody >  tr").each(function () {
                        $(this).find('td').eq(index).prop('hidden', true);
                    });
                }
            })
        }
    });
}