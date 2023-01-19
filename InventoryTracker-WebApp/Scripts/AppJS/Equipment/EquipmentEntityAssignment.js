//var isLoadTime = true;
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
        data: { 'searchString': searchString, 'startIndex': startIndexEquip, 'endIndex': endIndexEquip, 'startDate': $('#mainDate').val() },
        success: function (data) {
            if (data.IsValid) {
                //var equipmentString = '';
                for (var i = 0; i < data.data.length; i++) {
                    //  equipmentString += '<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td>' + data.data[i].EQUIP_TYPE + '</td><td>' + data.data[i].VENDOR + '</td><td>' + data.data[i].UNIT_ID + '</td><td class="assigned">' + data.data[i].ASSIGNED + '</td></tr>';

                    $("#equipHDR > tbody:last").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td ></td><tr>')

                    var tableHeadLength = $("#equipHDR > thead > tr >  th").length
                    for (var th = 0; th <= tableHeadLength;) {
                        if (th != tableHeadLength && th != 0) {
                            $("#equipHDR > tbody>tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find('td:last').after('<td></td>')
                        }
                        var headtext = $($("#equipHDR > thead > tr >  th")[th]).text();
                        if (headtext == "Equip. type") {
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
                        if (headtext == "Active") {
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").addClass('active').text(data.data[i].Active);
                        }
                        th = th + 1;
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


function loadEntityHDR(searchString, searchflag) {
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
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").append('<svg onclick="openCC(\'' + data.data[i].ENT_NAME + '\',' + data.data[i].ENT_ID + ')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg>');
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
                        $(this).append('<div class="btn-group ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + draggedEquipID + '" data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date: ' + $('#mainDate').val() + ' <br/> End date: 01/01/9999">' + draggedElementUnitID + '<div onclick="deleteAssignment(' + dropEntityID + ',' + draggedEquipID + ',this,\'' + $('#mainDate').val() + '\',\'01/01/9999\')" class="cls-remove-tag"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg></div></div></div>');
                        assignElement.text(parseInt(totalAssignCount) + 1);

                        var equipActive = $("#equipHDR > tbody >  tr").find('input[value="' + draggedEquipID + '"]').parent().find('.active');
                        var equipActiveCount = $(equipActive[0]).text();
                        equipActive.text(parseInt(equipActiveCount) + 1);


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
    RemoveLoader()
}



function importExcel() {
    if ($('#file').val().trim() == '') {
        alert('Please select file.')
        return;
    }
    else {
        var fileUpload = $("#file").get(0);
        var files = fileUpload.files;
        var formData = new FormData();

        formData.append("file", files[0]);

        $.ajax({
            before: AddLoader(),
            after: RemoveLoader(),
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

$('#nextYear').click(function () {
    $('.ui-icon-circle-triangle-e').trigger('click');
    setTimeout(onChangeYear(), 500);
});
$('#prevYear').click(function () {
    $('.ui-icon-circle-triangle-w').trigger('click');
    setTimeout(onChangeYear(), 500)
});
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

    for (var i = 0; i < dataArray.length; i++) {
        var color = preservedColor.filter(x => x.UNITID == dataArray[i].UNIT_ID);
        if (color.length >0) {
       
            legendStr += '<tr><input type="hidden" equipmentid="' + dataArray[i].EQUIP_ID + '" data-ent-id="' + dataArray[i].ENT_ID + '" unitID ="' + dataArray[i].UNIT_ID + '" data-start-date="' + dataArray[i].START_DATE + '" data-end-date="' + dataArray[i].END_DATE + '"  onclick="openAssignmentPopup()"><td style="background-color:' + color[0].RandomColor + '"></td><td>' + dataArray[i].UNIT_ID + '</td><td>' + dataArray[i].EQUIP_TYPE + '</td></tr>';
            
        } else {
            legendStr += '<tr><input type="hidden" equipmentid="' + dataArray[i].EQUIP_ID + '" data-ent-id="' + dataArray[i].ENT_ID + '" unitID ="' + dataArray[i].UNIT_ID + '" data-start-date="' + dataArray[i].START_DATE + '" data-end-date="' + dataArray[i].END_DATE + '"  onclick="openAssignmentPopup()"><td style="background-color:' + dataArray[i].RendomColor + '"></td><td>' + dataArray[i].UNIT_ID + '</td><td>' + dataArray[i].EQUIP_TYPE + '</td></tr>';
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
                        .attr('onclick', "openAssignmentPopup()");
                    var color = preservedColor.filter(x => x.UNITID == dataArray[i].UNIT_ID);
                    if (color.length > 0) {

                        $(this).children().css('background-color', '\'' + color[0].RandomColor + '\'')
                    } else {
                        $(this).children().css('background-color', '\'' + dataArray[i].RendomColor + '\'')
                    }
                }
                else {
                    $(this).children().css('border', '2px solid black')
                    //$(this).children().css('border', '4px solid ' + $(this).children().css('background-color')) //#####
                }
            }
        })
    }
    $('#tblLegend > tbody > tr').remove();
    $('#tblLegend > tbody').append(legendStr);
    spectrumColor();
}
function getEquipmentEntityAssignmentByYear(entityID) {
    var year = $('#currentYear').text();
    $(".ui-datepicker-calendar > tbody > tr > td").each(function () { $(this).children().css('background-color', 'rgb(246, 246, 246)').css('border', 'none'); });
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        type: "GET",
        url: '/Equipment/GetEquipmentEntityAssignmentByYear?year=' + year + '&entityID=' + entityID,
        contentType: false,
        processData: false,
        success: function (data) {
            var newData = JSON.parse(data);
            if (newData.IsValid) {
                var legendStr = '';
                dataArray = newData.data;
                ccUnitIDSelectList = '';
                for (var i = 0; i < newData.data.length; i++) {
                    //legendStr += '<tr><td style="background-color:#' + newData.data[i].RendomColor + '"></td><td>' + newData.data[i].UNIT_ID + '</td><td>' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                    if (preservedColor.indexOf(newData.data[i].RendomColor) == -1) {
                        var obj = {
                            RandomColor: '#' + newData.data[i].RendomColor,
                            UNITID: newData.data[i].UNIT_ID
                        };
                        preservedColor.push(obj);
                    }
                    var color = preservedColor.filter(x => x.UNITID == newData.data[i].UNIT_ID);
                    if (color.length > 0 ) {
                      
                        legendStr += '<tr><input type="hidden" equipmentid="' + newData.data[i].EQUIP_ID + '" data-ent-id="' + newData.data[i].ENT_ID + '" unitID ="' + newData.data[i].UNIT_ID + '" data-start-date="' + newData.data[i].START_DATE + '" data-end-date="' + newData.data[i].END_DATE + '"  onclick="openAssignmentPopup()"> <td style="background-color:' + color[0].RandomColor + '"></td><td>' + newData.data[i].UNIT_ID + '</td><td>' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                      
                    } else {
                        legendStr += '<tr><input type="hidden" equipmentid="' + newData.data[i].EQUIP_ID + '" data-ent-id="' + newData.data[i].ENT_ID + '" unitID ="' + newData.data[i].UNIT_ID + '" data-start-date="' + newData.data[i].START_DATE + '" data-end-date="' + newData.data[i].END_DATE + '"  onclick="openAssignmentPopup()"><td style="background-color:' + newData.data[i].RendomColor + '"></td><td>' + newData.data[i].UNIT_ID + '</td><td>' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                    }
                    ccUnitIDSelectList += '<option value=' + newData.data[i].EQUIP_ID + '>' + newData.data[i].UNIT_ID + '</option>'
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
                                    .attr('onclick', "openAssignmentPopup()");
                                var color = preservedColor.filter(x => x.UNITID == newData.data[i].UNIT_ID);
                                if (color.length > 0) {
                                        $(this).children().css('background-color', '\'' + color[0].RandomColor + '\'')
                                    
                                } else {
                                    $(this).children().css('background-color', '\'' + newData.data[i].RendomColor + '\'')
                                }
                            }
                            else {
                                $(this).children().css('border', '2px solid black');
                                //$(this).children().css('border', '4px solid ' + $(this).children().css('background-color')); //#######
                            }
                        }
                    })
                }
                $('#tblLegend > tbody > tr').remove();
                $('#tblLegend > tbody').append(legendStr);
                spectrumColor();
                filterFunction(dropDownVal)
                //setTimeout(bindTooltipForDates(), 500);
            }

        },
    });
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
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
    filterFunction(dropDownVal);
})

function filterFunction(dropDownVal) {
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
        getFilterEquipmentEntityAssignmentByYear();
    });

}

function openAssignmentPopup() {
    var equipmentID = $(gbl_selected_td).attr('equipmentid');
    var ent_id = $(gbl_selected_td).attr('data-ent-id');
    var unitID = $(gbl_selected_td).attr('unitID');
    $('#currEquipID').text(unitID)
    $('#currEquipDiv').attr('hidden', false);
    $('#changeUnitID').attr('hidden', false).html(ccUnitIDSelectList).val(equipmentID);
    deleteAssignmentModel.modal('show');
    deleteEntityID = ent_id;
    deleteEquipID = equipmentID;
    //deleteElement = el;
    deleteStartDate = new Date($(gbl_selected_td).attr('data-start-date'));
    deleteEndDate = new Date($(gbl_selected_td).attr('data-end-date'));
    resetDeleteAssignmentModel();
    $('#startDateLbl').text($('.updateStartDatepicker').val());
    $('#endDateLbl').text($('.updateEndDatepicker').val());
    $('#calendarControlModel').css('z-index','1035')
}

const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`


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
                var currentColorIndex = preservedColor.filter(x => x.RandomColor == rgba2hex(firstTdColor));
                if (currentColorIndex.length > 0) {
                    currentColorIndex[0].RandomColor = color.toHexString();
                    getFilterEquipmentEntityAssignmentByYear();
                }
            }
        });

    })
}

$('#changeUnitID').change(function () {
    gbl_selected_td = $($('.ui-datepicker-calendar').find('[unitid="' + $(this).find(":selected").text() + '"]')[0])
    if (gbl_selected_td[0] == undefined) {
        gbl_selected_td = $('#tblLegend > tbody > tr').find('[unitid="' + $(this).find(":selected").text() + '"]');
    }
    gbl_selected_td.trigger('click')
})