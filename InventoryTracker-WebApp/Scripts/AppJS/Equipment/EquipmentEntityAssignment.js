﻿//var isLoadTime = true;
var draggedEquipID = 0;
var dropEntityID = 0;
var draggedElementUnitID = '';
var startDate = $('.datepicker');
var tblHDR = '<th scope="col">Entity Name</th>';
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
    loadEntityHDR('', false);
    loadEquipmentHDR('',false);
    resizableTable();
    sortableTable();
    $('#selectedMenu').text($('#menuEntEquAss').text());
})


function loadEquipmentHDR(searchString, searchflag) {
    if (searchflag == true) {
        $("#equipHDR > tbody > tr").remove();
    }
    if (startIndexEquip == 0) {
        $("#equipHDR > tbody > tr").remove();
    }
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentHeadersfromEquipmentEntity',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'searchString': searchString, 'startIndex': startIndexEquip, 'endIndex': endIndexEquip },
        success: function (data) {
            if (data.IsValid) {
                //var equipmentString = '';
                for (var i = 0; i < data.data.length; i++) {
                  //  equipmentString += '<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td>' + data.data[i].EQUIP_TYPE + '</td><td>' + data.data[i].VENDOR + '</td><td>' + data.data[i].UNIT_ID + '</td><td class="assigned">' + data.data[i].ASSIGNED + '</td></tr>';

                    $("#equipHDR > tbody:last").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td ></td><tr>')

                    var tableHeadLength = $("#equipHDR > thead > tr >  th").length
                    for (var th = 0; th <= tableHeadLength;) {
                        if (th != tableHeadLength && th !=0) {
                            $("#equipHDR > tbody>tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find('td:last').after('<td></td>')
                        }
                        var headtext = $($("#equipHDR > thead > tr >  th")[th]).text();
                        if (headtext =="Equip. type") {
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].EQUIP_TYPE);
                        }
                        if (headtext == "Vendor") {
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].VENDOR);
                        }
                        if (headtext == "Unit ID") {
                            unitCol = th;
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].UNIT_ID);
                        }
                        if (headtext == "Assigned") {
                            var a = " " + data.data[i].ASSIGNED;
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").addClass('assigned').text(a);
                        }
                        th = th+1;
                    }
                }
                //$("#equipHDR > tbody >  tr").remove();
              // $("#equipHDR > tbody").append(equipmentString);
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
                        //$('#equipHDR').parent().parent().removeClass('overflow-auto');
                        //droppable.css('z-index', -1);
                        //currentText = $(this).text();
                        //draggedValue = currentText;
                    },
                    stop: function () {
                        //droppable.css('z-index', 99999);
                        //$('#equipHDR').parent().parent().addClass('overflow-auto');
                    }
                });
                addEquipmentColumn();
                //var tableHeadLength = $("#equipHDR > thead > tr >  th").length
                //for (var th = 4; th <= tableHeadLength;) {
                //    isaddEquipmentColumn = true;
                //    $($("#equipHDR > thead > tr >  th")[th]).remove();
                //    $("#equipHDR > tbody > tr").find("td:eq(" + th + ")").remove();
                //    tableHeadLength = tableHeadLength - 1;
                //}
                //if (isaddEquipmentColumn) {
                //    addEquipmentColumn();
                //}
                
            }
        }, error: function (ex) { }
    });
}


function loadEntityHDR(searchString,searchflag) {
    if (searchflag == true) {  
        $("#entityHDR > tbody > tr").remove();
    } 
    if (startIndexEntity == 0) {
        $("#entityHDR > tbody > tr").remove();
    }
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/GetEntityHeaders',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'searchString': searchString, 'startIndex': startIndexEntity, 'endIndex': endIndexEntity },
        success: function (data) {
            if (data.IsValid) {
                var entityString = '';
                for (var i = 0; i < data.data.length; i++) {
                  //  entityString += '<tr><input type="hidden" value="' + data.data[i].ENT_ID + '"/><td class="addEntity">' + data.data[i].ENT_NAME + '</td><td class="droppable"></td><td><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg></td></tr>';

                    $("#entityHDR > tbody:last").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].ENT_ID + '"/><td></td><tr>')

                    var tableHeadLength = $("#entityHDR > thead > tr >  th").length
                    for (var th = 0; th <= tableHeadLength;) {  
                        if (th != tableHeadLength && th != 0) {
                            $("#entityHDR > tbody>tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find('td:last').after('<td></td>')
                        }
                        var headtext = $($("#entityHDR > thead > tr >  th")[th]).text();
                        if (headtext == "Entity Name") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").addClass("addEntity").text(data.data[i].ENT_NAME);
                        }
                        if (headtext == "Equipment Assigned") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").addClass("droppable");
                        }
                        if (headtext == "\n                            ") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").append('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg>');
                        }
                        th = th + 1;
                    }
                }
                //$("#entityHDR > tbody >  tr").remove();
                //$("#entityHDR > tbody").append(entityString);

                GetEquipmentEntityAssignment(0);


                $(".droppable").droppable({
                    drop: function (event, ui) {
                        var assignElement = $("#equipHDR > tbody >  tr").find('input[value="' + draggedEquipID + '"]').parent().find('.assigned');
                        var totalAssignCount = $(assignElement[0]).text();
                        dropEntityID = $(this).parent().find("input").val();
                        $(this).append('<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + draggedEquipID + '" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date : ' + $('#mainDate').val() + ' <br/> End date : 01/01/9999">' + draggedElementUnitID + '<div onclick="deleteAssignment(' + dropEntityID + ',' + draggedEquipID + ',this,\'' + $('#mainDate').val()+'\',\'01/01/9999\')" class="cls-remove-tag">X</div></div></div>');
                        assignElement.text(parseInt(totalAssignCount) + 1);
                        $('[data-bs-toggle="tooltip"]').tooltip();
                        $.ajax({
                            before: AddLoader(),
                            after: RemoveLoader(),
                            url: '/Equipment/SaveEquipmentEntityAssignment',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            type: 'POST',
                            async: false,
                            data: JSON.stringify({ 'entityID': dropEntityID, 'equipID': draggedEquipID, 'startDate': startDate.val(), 'isDelete': 0, 'endDate': '9999/01/01' }),
                            success: function (data) {
                                //loadEquipmentHDR('');
                            }, error: function (ex) { }
                        });
                    }
                });
                addEntityColumn();
            }
        }, error: function (ex) { }
    });
}

$('#btnSearchEntity').click(function () {
    addEntityHeader();
})

function addEntityColumn() {
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
                        url: '/Entity/EntityValueByPropName',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        type: 'GET',
                        async: false,
                        data: { 'propName': $(this).attr('id') },
                        success: function (data) {
                                  for (var i = 0; i < data.data.length; i++) {
                                        $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('.addEntity').next().text(data.data[i].Ent_Value);
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
                    after: RemoveLoader(),
                    url: '/Entity/EntityValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': $(this).attr('id') },
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
    resizableTable();   
}

function addEquipmentHeader() {
    var searchString = $('#searchEquipmentStr').val().toLowerCase().trim();
    if (searchString != '') {
        if (previousequipsearch == searchString) {
            previousequipsearch = searchString;
            loadEquipmentHDR(searchString, false);
            return;
        }
        previousequipsearch = searchString;
        startIndexEquip = 0;
        loadEquipmentHDR(searchString, true);
    } else {
        startIndexEquip = 0;
        endIndexEquip = 30;
        loadEquipmentHDR(searchString, false);
    }
    //$('#searchEquipmentStr').val().trim()
    //addEquipmentColumn();
    resizableTable();
    //$("#equipHDR tr").each(function (index) {
    //    if (index !== 0) {
    //        var row = $(this);
    //        var isHide = true;
    //        row.find('td').each(function () {
    //            if ($(this).text().toLowerCase().indexOf($('#searchEquipmentStr').val().toLowerCase().trim()) != -1) {
    //                isHide = false;
    //                return;
    //            }
    //        })
    //        if (isHide) {
    //            row.hide();
    //        }
    //        else {
    //            row.show();
    //        }
    //    }
    //});
}
