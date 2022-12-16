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
                        $(this).append('<div class="btn-group mt-1 ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + draggedEntityID + '"  data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date : ' + $('#mainDate').val() + ' <br/> End date : 01/01/9999">' + draggedElementName + '<div onclick="deleteAssignment(' + draggedEntityID + ',' + dropEquipID + ',this,\'' + $('#mainDate').val() + '\',\'01/01/9999\')"  class="cls-remove-tag">X</div></div></div>')
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