//var isLoadTime = true;
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
    loadEntityHDR('');
    loadEquipmentHDR('');
    resizableTable();
    sortableTable();
})


function loadEquipmentHDR(searchString) {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentHeaders',
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

                    $("#equipHDR > tbody:last").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td></td><tr>')

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
                            var a = " "+ data.data[i].ASSIGNED;
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").text(a);
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


function loadEntityHDR(searchString) {
    //if (searchString == '') {
    //    var tableHeader = '<th scope="col">Entity Name</th><th scope="col">Equipment Assigned</th><th></th>';
    //    $("#entityHDR > thead >  tr > th").remove();
    //    $("#entityHDR > thead >  tr").append(tableHeader);
    //}
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
                 //   console.log(tableHeadLength);
                    for (var th = 0; th <= tableHeadLength;) {  
                        if (th != tableHeadLength && th != 0) {
                            $("#entityHDR > tbody>tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find('td:last').after('<td></td>')
                        }
                        var headtext = $($("#entityHDR > thead > tr >  th")[th]).text();
                        console.log(headtext);
                        if (headtext == "Entity Name") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").addClass("addEntity").text(data.data[i].ENT_NAME);
                        }
                        if (headtext == "Equipment Assigned") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").addClass("droppable");
                        }
                        if (headtext == "\n                            ") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").append('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg>');
                           // console.log(a);
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
                        $(this).append('<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary" style="background-color:rgb(150, 166, 195);padding:1px 5px 1px 5px  !important;color:white" id="' + draggedEquipID + '">' + draggedElementUnitID + '<div onclick="deleteAssignment(' + dropEntityID + ',' + draggedEquipID + ',this)" class="cls-remove-tag">X</div></div></div>');
                        assignElement.text(parseInt(totalAssignCount) + 1)
                        $.ajax({
                            before: AddLoader(),
                            after: RemoveLoader(),
                            url: '/Equipment/SaveEquipmentEntityAssignment',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            type: 'POST',
                            async: false,
                            data: JSON.stringify({ 'entityID': dropEntityID, 'equipID': draggedEquipID, 'startDate': startDate.val(), 'isDelete': 0 }),
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

//function deleteAssignment(entityID,equipID) {
//    $.ajax({
//        before: AddLoader(),
//        after: RemoveLoader(),
//        url: '/Equipment/SaveEquipmentEntityAssignment',
//        contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'POST',
//        async: false,
//        data: JSON.stringify({ 'entityID': entityID, 'equipID': equipID, 'isDelete': 1 }),
//        success: function (data) {
//            loadEntityHDR('');
//            addEntityHeader();
//            loadEquipmentHDR('');   
//        }, error: function (ex) { }
//    });
//}

//function GetEquipmentEntityAssignment(){
//    $.ajax({
//        before: AddLoader(),
//        after: RemoveLoader(),
//        url: '/Equipment/GetEquipmentEntityAssignment',
//        contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'GET',
//        async: false,
//        data: { 'startDate': startDate.val() },
//        success: function (assignmentData) {
//            if (assignmentData.IsValid) {
//                for (var i = 0; i < assignmentData.data.length; i++) {
//                    var assignedStr = '';
//                    if (assignmentData.data[i].EQUIP_ENT_ID > 0) {

//                        var assignedStr = '<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary" style="background-color:rgb(150, 166, 195);padding:1px 5px 1px 5px  !important;color:white" id="' + assignmentData.data[i].EQUIP_ID + '">' + assignmentData.data[i].UNIT_ID + '<div onclick="deleteAssignment(' + assignmentData.data[i].ENT_ID + ',' + assignmentData.data[i].EQUIP_ID + ')" class="btn btn-primary  btn-close" style=" margin-left: 4px; height: 13px;background-color: #e3dcdc;padding: 0px 1px 0px 1px !important;color: white;border-radius: 20px;margin-top: -3px;"></div></div></div>';
//                        $("#entityHDR > tbody >  tr").find('input[value="' + assignmentData.data[i].ENT_ID + '"]').parent().find('.droppable').append(assignedStr);
//                    }
//                }
//            }
//        }, error: function (ex) { }
//    });
//}
//<button type="button" onclick="deleteAssignment(' + assignmentData.data[i].ENT_ID + ',' + assignmentData.data[i].EQUIP_ID + ')" style="height:0px;width:0px;" class="btn float-end btn-danger btn-close"></button>

$('#btnSearchEntity').click(function () {
    addEntityHeader();
})



//function loadAllEntityTemp() {
//    $.ajax({
//        before: AddLoader(),
//        after: RemoveLoader(),
//        url: '/Entity/GetEntityTemplate',
//        contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'GET',
//        async: false,
//        success: function (data) {
//            if (data.IsValid) {
//                var templateString = '';

//                for (var i = 0; i < data.uniquePropName.length; i++) {
//                    var propName = data.uniquePropName[i].Prop_name.trim();
//                    templateString += '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="' + propName + '"> <label class="form-check-label" for="' + propName + '"> ' + propName + ' </label> </div>';
//                }

//                var uniqueEntityType = "";
//                uniqueEntityType += "<option value='0' >Select entity type</option>";
//                for (var j = 0; j < data.uniqueEntityTemplates.length; j++) {
//                    var entType = data.uniqueEntityTemplates[j].Ent_type;
//                    uniqueEntityType += '<option value=' + entType + ' >' + entType + '</option>'
//                }
//                entityType.html(uniqueEntityType);

//                $('#entityTemplateModelBody').html(templateString);
//            }
//        }, error: function (ex) { }
//    });
//}


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
                            var tableHeadLength = $("#entityHDR > thead > tr >  th").length
                            for (var th = tableHeadLength; th >= 0;) {
                                var headtext = $($("#entityHDR > thead > tr >  th")[th]).text();
                           //     console.log(headtext);
                                if (headtext == id) {
                                    for (var i = 0; i < data.data.length; i++) {
                                        $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('.addEntity').next().text(data.data[i].Ent_Value);
                                    }
                                    break;
                                }
                                th = th - 1;
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
        console.log(hdrdata);
    })
    //  tableHeader += '<th scope="col">Equipment Assigned</th><th></th>';
    $("#entityHDR > thead >  tr > th").remove();
    $("#entityHDR > thead >  tr").append(hdrdata.toLocaleString().replaceAll(',', ''));
    entityTemplate.modal('hide');

}


function addEntityHeader() {
    // loadEntityHDR('');
    addEntityColumn();
    resizableTable();
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

function addEquipmentHeader() {
    // loadEquipmentHDR(''); //$('#searchEquipmentStr').val().trim()
    addEquipmentColumn();
    resizableTable();
    $("#equipHDR tr").each(function (index) {
        if (index !== 0) {
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

