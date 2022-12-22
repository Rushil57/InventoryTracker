var draggedEntityID = 0;
var dropEquipID = 0;
var draggedElementName = '';
var startDate = $('.datepicker');


$(document).ready(function () {
    loadAllEquipTemp();
    loadEntityHDR('', false);
    loadEquipmentHDR('', false);
    resizableTable();
    sortableTable();
    $('#selectedMenu').text($('#menuEquEntAss').text());
    $('.bi-database').attr('onclick', 'showEquipModel()');
})

function loadEntityHDR(searchString, searchflag) {
    if (searchflag == true) {
        entitysearchflag = true;
        $("#entityHDR > tbody > tr").remove();
    }
    if (startIndexEntity == 0) {
        entitysearchflag = false;
        $("#entityHDR > tbody > tr").remove();
    }
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/GetEntityHeaderfromEntityEquipment',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'searchString': searchString, 'startIndex': startIndexEntity, 'endIndex': endIndexEntity, 'startDate': $('#mainDate').val() },
        success: function (data) {
            if (data.IsValid) {
                var entityString = '';
                for (var i = 0; i < data.data.length; i++) {
                    //    entityString += '<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].ENT_ID + '"/><td>' + data.data[i].ENT_TYPE + '</td><td>' + data.data[i].ENT_NAME + '</td><td class="assigned">' + data.data[i].ASSIGNED + '</td></tr>';

                    $("#entityHDR > tbody:last").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].ENT_ID + '"/><td></td><tr>')
                    var tableHeadLength = $("#entityHDR > thead > tr >  th").length
                    for (var th = 0; th <= tableHeadLength;) {
                        if (th != tableHeadLength && th != 0) {
                            $("#entityHDR > tbody>tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find('td:last').after('<td></td>')
                        }
                        var headtext = $($("#entityHDR > thead > tr >  th")[th]).text();
                        if (headtext == "Entity type") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].ENT_TYPE);
                        } if (headtext == "Entity name") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].ENT_NAME);
                        } if (headtext == "Assigned") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").addClass("assigned").text(data.data[i].ASSIGNED);
                        }
                        if (headtext == "Active") {
                            $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].ENT_ID + '"]').parent().find("td:eq(" + th + ")").addClass('active').text(data.data[i].Active);
                        }
                        th = th + 1;
                    }
                }
                //$("#entityHDR > tbody >  tr").remove();
                // $("#entityHDR > tbody").append(entityString);
                $("#entityHDR > tbody >  tr").draggable({
                    helper: 'clone',
                    start: function (e, ui) {

                        var id = $(this).find("input");
                        draggedEntityID = id.val();
                        var tableHeadLength = $("#entityHDR > thead > tr >  th").length
                        for (var th = tableHeadLength; th >= 0;) {
                            var headtext = $($("#entityHDR > thead > tr >  th")[th]).text();
                            if (headtext == "Entity name") {
                                var tdValue = $(this).find("td:eq(" + th + ")");
                                draggedElementName = tdValue.text();
                                break;
                            }
                            th = th - 1;
                        }

                    },
                    stop: function () {
                    }
                });
                addEntityColumn();
            }
        }, error: function (ex) { }
    });
}



function loadEquipmentHDR(searchString, searchflag) {
    //if (searchString == '') {
    //    var tableHeader = '<th scope="col">Equipment type</th><th scope="col">Vendor</th><th scope="col">Unit ID</th><th scope="col">Entity Assigned</th><th scope="col"></th>';
    //    $("#equipHDR > thead >  tr > th").remove();
    //    $("#equipHDR > thead >  tr").append(tableHeader);
    //}
    if (searchflag == true) {
        equipsearchflag = true;
        $("#equipHDR > tbody > tr").remove();
    }
    if (startIndexEquip == 0) {
        equipsearchflag = false;
        $("#equipHDR > tbody > tr").remove();
    }
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
                var equipmentString = '';
                for (var i = 0; i < data.data.length; i++) {
                    // equipmentString += '<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td>' + data.data[i].EQUIP_TYPE + '</td><td>' + data.data[i].VENDOR + '</td><td class="addEntity">' + data.data[i].UNIT_ID + '</td><td class="droppable"></td><td><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg></td></tr>';
                    $("#equipHDR > tbody:last").append('<tr style="cursor:pointer"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td></td><tr>')

                    var tableHeadLength = $("#equipHDR > thead > tr >  th").length
                    for (var th = 0; th <= tableHeadLength;) {
                        if (th != tableHeadLength && th != 0) {
                            $("#equipHDR > tbody>tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find('td:last').after('<td></td>')
                        }
                        var headtext = $($("#equipHDR > thead > tr >  th")[th]).text();
                        if (headtext == "Equipment type") {
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].EQUIP_TYPE);
                        }
                        if (headtext == "Vendor") {
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].VENDOR);
                        }
                        if (headtext == "Unit ID") {
                            unitCol = th;
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").addClass("addEntity").text(data.data[i].UNIT_ID);
                        }
                        if (headtext == "Entity Assigned") {
                            var a = " " + data.data[i].ASSIGNED;
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").addClass("droppable");
                        }
                        if (headtext == "") {
                            var a = " " + data.data[i].ASSIGNED;
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg>');
                        }
                        th = th + 1;
                    }
                }
                //$("#equipHDR > tbody >  tr").remove();
                //$("#equipHDR > tbody").append(equipmentString);


                GetEquipmentEntityAssignment(1);

                $(".droppable").droppable({
                    drop: function (event, ui) {
                        var assignElement = $("#entityHDR > tbody >  tr").find('input[value="' + draggedEntityID + '"]').parent().find('.assigned');
                        var totalAssignCount = $(assignElement[0]).text();

                        dropEquipID = $(this).parent().find("input").val();
                        $(this).append('<div class="btn-group mt-1 ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + draggedEntityID + '"  data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date : ' + $('#mainDate').val() + ' <br/> End date : 01/01/9999">' + draggedElementName + '<div onclick="deleteAssignment(' + draggedEntityID + ',' + dropEquipID + ',this,\'' + $('#mainDate').val() + '\',\'01/01/9999\')"  class="cls-remove-tag"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg></div></div></div>')
                        $('[data-bs-toggle="tooltip"]').tooltip();
                        assignElement.text(parseInt(totalAssignCount) + 1);


                        var entityActive = $("#entityHDR > tbody >  tr").find('input[value="' + draggedEntityID + '"]').parent().find('.active');
                        var entityActiveCount = $(entityActive[0]).text();
                        entityActive.text(parseInt(entityActiveCount) + 1);

                        $.ajax({
                            before: AddLoader(),
                            after: RemoveLoader(),
                            url: '/Equipment/SaveEquipmentEntityAssignment',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            type: 'POST',
                            async: false,
                            data: JSON.stringify({ 'entityID': draggedEntityID, 'equipID': dropEquipID, 'startDate': startDate.val(), 'isDelete': 0, 'endDate': '9999/01/01' }),
                            success: function (data) {

                            }, error: function (ex) { }
                        });
                    }
                });
                addEquipmentColumn();
            }
        }, error: function (ex) { }
    });
}


function addEquipmentHeader() {
    var searchString = $('#searchEquipmentStr').val().toLowerCase().trim();
    if (searchString != '') {
        if (previousequipsearch == searchString) {
            previousequipsearch = searchString;
            loadEquipmentHDR(searchString, false);
            return;
        }
        startIndexEquip = 0;
        endIndexEquip = 30;
        previousequipsearch = searchString;
        loadEquipmentHDR(searchString, true);
        return;
    } else {
        startIndexEquip = 0;
        endIndexEquip = 30;
        loadEquipmentHDR('', true);
    }
    // loadEquipmentHDR('');
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

function addEquipmentColumn() {
    //var tableHeader = '';
    //tableHeader += ' <th scope="col">Equipment type</th><th scope="col">Vendor</th><th scope="col">Unit ID</th>';

    var hdrdata = [];
    $("#equipHDR th").each(function (index) {
        var headerdata = "<th scope=\"col\">" + $(this).text() + "</th>";
        if (hdrdata.indexOf(headerdata) == -1) {
            hdrdata.push(headerdata);
        }
    });

    $('#equipmentTemplateModelBody .form-check-input').each(function () {
        if ($(this).is(':checked')) {
            //tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
            var isPresent = true;

            var id = $(this).attr('id');
            var th = 0;
            $("#equipHDR th").each(function (index) {

                if ($(this).text().toLowerCase() == id.toLowerCase()) {
                    isPresent = false;

                    if ($(this).text().toLowerCase() == id.toLowerCase()) {
                        $('#equipHDR tbody tr').each(function (ind, el) {
                            $('td', el).eq(index).show();
                        });
                        $(this).show();

                    }
                    $.ajax({
                        url: '/Equipment/EquipmentValueByPropName',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        type: 'GET',
                        async: false,
                        data: { 'propName': id },
                        success: function (data) {

                            for (var i = 0; i < data.data.length; i++) {
                                $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find('.addEntity').next().text(data.data[i].Eq_Value);
                            }
                        },
                        error: function (ex) { }
                    });
                }
                if (hdrdata.indexOf("<th scope=\"col\">" + id + "</th>") == -1) {

                    if ($(this).text().toLowerCase() == "unit id") {
                        var data = $(this).html();
                        var a = hdrdata.indexOf("<th scope=\"col\">Unit ID</th>");
                        hdrdata.splice(a + 1, 0, "<th scope=\"col\">" + id + "</th>");
                    }
                }
                th = th + 1;
            });
            if (isPresent) {
                $.ajax({
                    before: AddLoader(),
                    after: RemoveLoader(),
                    url: '/Equipment/EquipmentValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': $(this).attr('id') },
                    success: function (data) {
                        $("#equipHDR > tbody >  tr").each(function () {
                            $(this).find('.addEntity').after('<td></td>')
                        })
                        for (var i = 0; i < data.data.length; i++) {
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find('.addEntity').next().text(data.data[i].Eq_Value);
                        }
                    },
                    error: function (ex) { }
                });
            }
        } else {
            var id = $(this).attr('id');
            $("#equipHDR th").each(function (index) {

                if ($(this).text().toLowerCase() == id.toLowerCase()) {
                    $('#equipHDR tbody tr').each(function (ind, el) {
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
    // tableHeader += '<th scope="col">Entity Assigned</th><th></th>';
    $("#equipHDR > thead >  tr > th").remove();
    $("#equipHDR > thead >  tr").append(hdrdata.toLocaleString().replaceAll(',', ''));
    equipmentTemplate.modal('hide');
}

$('#btnSearchEquipment').click(function () {
    addEquipmentHeader();
})


function addEntityColumn() {
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
                        if (id != '') {
                            $.ajax({
                                url: '/Entity/EntityValueByPropName',
                                contentType: 'application/json; charset=utf-8',
                                dataType: 'json',
                                type: 'GET',
                                async: false,
                                data: { 'propName': id },
                                success: function (data) {
                                    var tableHeadLength = $("#entityHDR > thead > tr >  th").length
                                    for (var th = tableHeadLength; th >= 0;) {
                                        var headtext = $($("#entityHDR > thead > tr >  th")[th]).text();
                                        if (headtext == id) {
                                            for (var i = 0; i < data.data.length; i++) {
                                                $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].Ent_Value);
                                            }
                                            break;
                                        }
                                        th = th - 1;
                                    }
                                    //for (var i = 0; i < data.data.length; i++) {

                                    //    $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('td:last').text(data.data[i].Ent_Value);
                                    //}
                                },
                                error: function (ex) { }
                            });
                        }
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
}



function exportData() {
    var headerCol = '';
    $('#equipHDR > thead > tr > th').each(function () {
        if ($(this).text() == "Equipment type" || $(this).text() == "Vendor" || $(this).text() == "Unit ID" || $(this).text() == "Entity Assigned" || $(this).text() == "") {

        }
        else {
            headerCol += $(this).text() + ',';
        }
    });
    AddLoader()
    window.location = "/Entity/EntityEquipmentAssignExport?startDate=" + $('#mainDate').val() + "&searchString=" + $('#searchEquipmentStr').val().trim() + "&columns=" + headerCol;
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
            url: '/Entity/EntityEquipmentAssignImport',
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                var newData = JSON.parse(data);
                if (newData.IsValid) {
                    alert('Data updated successfully.')
                    $('#importExcel').modal('hide');
                    loadEquipmentHDR('', false);
                    loadEntityHDR('', false);
                    $('#excelTotalNewAssign').text(newData.excelTotalNewAssign);
                    $('#excelTotalRemove').text(newData.excelTotalRemove);
                    $('#gtOneAssign').text(newData.gtOneAssign)
                    $('#totalRecords').text(newData.totalRecords)
                    $('#invalidRecords').text(newData.excelInvalidEntCount + " [" + newData.excelInvalidEntityName + "]")
                    $('#summary').modal('show');
                }
            },
            error: function (e1, e2, e3) {
            }
        });
    }
}