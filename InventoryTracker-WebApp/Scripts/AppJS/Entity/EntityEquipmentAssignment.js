var draggedEntityID = 0;
var dropEquipID = 0;
var draggedElementName = '';
var startDate = $('.datepicker');
var preservedColor = [];
var dropDownVal = '';
var gbl_all_entity_data = [];
var ccEquipType = '';
var ccUnitID = '';
var ccVendor = '';
isEquipEntityPopUP = false;
var ccEntityNameSelectList = '';
var isDropDownChange = false;
var isAddNewEntity = false;
var addNewEntitySelectList = '<option selected>Please select</option>';
var dateRangeTmp = '';
var isSearchDropDown = false;

$(document).ready(function () {
    loadAllEquipTemp();
    loadEntityHDR('', false);
    loadEquipmentHDR('', false);
    resizableTable();
    sortableTable();
    $('#selectedMenu').text($('#menuEquEntAss').text());
    $('#property').attr('onclick', 'showEquipModel()');
    isFirstRowTextBox = true;

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
        complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
        url: '/Entity/GetEntityHeaderfromEntityEquipment',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'searchString': searchString, 'startDate': $('#mainDate').val() },
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
                            addNewEntitySelectList += "<option value='" + data.data[i].ENT_ID + "'>" + data.data[i].ENT_NAME + "</option>";

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

                if ($("#entityHDR").find('.static-rw').length == 0) {
                    var firstTrHTML = '';
                    $("#entityHDR > thead > tr >  th").each(function () {
                        firstTrHTML += '<td><input type="text" style="height:30px" class="form-control" onkeyup="searchInTable(\'entityHDR\')"></td>';
                    })
                    $("#entityHDR > tbody > tr:first").before('<tr class="static-rw" style="cursor:pointer">' + firstTrHTML + '<tr>');
                }
                $("#entityHDR").trigger("destroy", [false, function () {
                    resizableTable();
                    sortableTable();
                    $("#entityHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
                        setTimeout(function () {
                            var frHtml = $("#entityHDR").find('.static-rw');
                            $("#entityHDR").find('.static-rw').remove();

                            $("#entityHDR > tbody > tr:first").before(frHtml);
                        }, 10)
                    }).trigger("update");
                }]);
                var rowCount =0;

                $('#entityHDR tr').each(function (index, element) {
                    
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
        complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
        url: '/Equipment/GetEquipmentHeaders',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'searchString': searchString},
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
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].EQUIP_ID + '"]').parent().find("td:eq(" + th + ")").html('<svg onclick="openCC(\'' + data.data[i].EQUIP_TYPE + '\',' + data.data[i].EQUIP_ID + ',\'' + data.data[i].UNIT_ID + '\',\'' + data.data[i].VENDOR + '\')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4-range" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg>');
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
                        $(this).append('<div class="btn-group mt-1 ms-1 me-1" role="group"><div class="btn btn-primary assignBtn" id="' + draggedEntityID + '" data-bs-html="true"  data-bs-toggle="tooltip" data-bs-placement="bottom" title="Start date: ' + $('#mainDate').val() + ' <br/> End date: 01/01/9999">' + draggedElementName + '<div onclick="deleteAssignment(' + draggedEntityID + ',' + dropEquipID + ',this,\'' + $('#mainDate').val() + '\',\'01/01/9999\',0)"  class="cls-remove-tag"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg></div></div></div>')
                        bindTooltip();
                        assignElement.text(parseInt(totalAssignCount) + 1);


                        var entityActive = $("#entityHDR > tbody >  tr").find('input[value="' + draggedEntityID + '"]').parent().find('.active');
                        var entityActiveCount = $(entityActive[0]).text();
                        entityActive.text(parseInt(entityActiveCount) + 1);

                        $.ajax({
                            before: AddLoader(),
                            complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
                            url: '/Equipment/SaveEquipmentEntityAssignment',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            type: 'POST',
                            async: false,
                            data: JSON.stringify({ 'entityID': draggedEntityID, 'equipID': dropEquipID, 'startDate': startDate.val(), 'isDelete': 0, 'endDate': '9999/01/01', 'equipEntID': 0 }),
                            success: function (data) {

                            }, error: function (ex) { }
                        });
                    }
                });
                addEquipmentColumn();
                if ($("#equipHDR").find('.static-rw').length == 0) {
                    var firstTrHTML = '';
                    $("#equipHDR > thead > tr >  th").each(function () {
                        if ($(this).text() == '') {
                            firstTrHTML += '<td></td>'
                        }
                        else {
                            firstTrHTML += '<td><input type="text" class="form-control" style="height:30px" onkeyup="searchInTable(\'equipHDR\')"></td>'
                        }
                    })
                    $("#equipHDR > tbody > tr:first").before('<tr class="static-rw" style="cursor:pointer">' + firstTrHTML + '<tr>');
                }
                var rowCount = 0;

                $('#equipHDR tr').each(function (index, element) {
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


function addEquipmentHeader() {
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
    } else {
        startIndexEquip = 0;
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
                        data: { 'propName': id, 'date' : $('#mainDate').val() },
                        success: function (data) {
                            var indexOfID = -1;
                            var j = 0;
                            $("#equipHDR > thead >  tr >  th").each(function () {
                                if ($(this).text().toLowerCase() == id.toLowerCase()) {
                                    indexOfID = j;
                                    return;
                                }
                                j++;
                            })
                            for (var i = 0; i < data.data.length; i++) {
                                if (indexOfID >= 0) {
                                    $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find('td:eq(' + indexOfID + ')').text(data.data[i].Eq_Value)
                                }
                                else {
                                    $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find('.addEntity').next().text(data.data[i].Eq_Value);
                                }
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
                    complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
                    url: '/Equipment/EquipmentValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': id ,'date': $('#mainDate').val() },
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
    $("#equipHDR").trigger("destroy", [false, function () {
        resizableTable();
        sortableTable();
        $("#equipHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
            setTimeout(function () {
                var frHtml = $("#entityHDR").find('.static-rw');
                $("#entityHDR").find('.static-rw').remove();

                $("#entityHDR > tbody > tr:first").before(frHtml);
            }, 10)
        }).trigger("update");
    }]);
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
                                data: { 'propName': id, 'date': $('#mainDate').val() },
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
                    complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
                    url: '/Entity/EntityValueByPropName',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    type: 'GET',
                    async: false,
                    data: { 'propName': id, 'date': $('#mainDate').val() },
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
    $("#entityHDR").trigger("destroy", [false, function () {
        resizableTable();
        sortableTable();
        $("#entityHDR").tablesorter({ emptyTo: 'none/zero' }).bind("sortEnd", function (e, t) {
            setTimeout(function () {
                var frHtml = $("#entityHDR").find('.static-rw');
                $("#entityHDR").find('.static-rw').remove();

                $("#entityHDR > tbody > tr:first").before(frHtml);
            }, 10)
        }).trigger("update");
    }]);

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
    setTimeout(function () { RemoveLoader(); }, 2000);
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
            url: '/Entity/EntityEquipmentAssignDateRangeImport',
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
                    $('#summaryBody').html(' <h6><label>How many new pieces of entity have been assigned: </label>&nbsp;<label id="excelTotalNewAssign"></label><br/> <label>How many new pieces of entity have been removed: </label>&nbsp;<label id="excelTotalRemove"></label><br/><label>How many new pieces of entity have > 1 assignment: </label>&nbsp;<label id="gtOneAssign"></label><br/><label>How many total record loaded:</label>&nbsp;<label id="totalRecords"></label><br/><label>How many records have invalid entity units: </label>&nbsp;<label id="invalidRecords"></label><br/><label>How many records have been updated: </label>&nbsp;<label id="updatedRecords"></label></h6>');
                    $('#excelTotalNewAssign').text(newData.excelTotalNewAssign);
                    $('#excelTotalRemove').text(newData.excelTotalRemove);
                    $('#gtOneAssign').text(newData.gtOneAssign)
                    $('#totalRecords').text(newData.totalRecords)
                    $('#updatedRecords').text(newData.excelUpdatedCount)
                    var invalidRecordText = newData.excelInvalidEntityNameCount;
                    if (newData.excelInvalidEntityNameCount > 0) {
                        invalidRecordText += " [" + newData.excelInvalidEntityName + "]";
                    }
                    $('#invalidRecords').text(invalidRecordText);
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
            complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
            type: "POST",
            url: '/Entity/EntityEquipmentAssignImport',
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
                    loadEquipmentHDR('', false);
                    loadEntityHDR('', false);
                    $('#summaryBody').html(' <h6><label>How many new pieces of entity have been assigned: </label>&nbsp;<label id="excelTotalNewAssign"></label><br/> <label>How many new pieces of entity have been removed: </label>&nbsp;<label id="excelTotalRemove"></label><br/><label>How many new pieces of entity have > 1 assignment: </label>&nbsp;<label id="gtOneAssign"></label><br/><label>How many total record loaded:</label>&nbsp;<label id="totalRecords"></label><br/><label>How many records have invalid entity units: </label>&nbsp;<label id="invalidRecords"></label></h6>');
                    $('#excelTotalNewAssign').text(newData.excelTotalNewAssign);
                    $('#excelTotalRemove').text(newData.excelTotalRemove);
                    $('#gtOneAssign').text(newData.gtOneAssign)
                    $('#totalRecords').text(newData.totalRecords)
                    var invalidRecordText = newData.excelInvalidEntCount;
                    if (newData.excelInvalidEntCount > 0) {
                        invalidRecordText += " [" + newData.excelInvalidEntityName + "]";
                    }
                    $('#invalidRecords').text(invalidRecordText);
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
    //    var entityID = $($(this)[0].outerHTML).attr('data-ent-id');
    //    var entType = $($(this)[0].outerHTML).attr('entType');
    //    gbl_selected_td = $($(this)[0].outerHTML);
    //    entityTemplateString = '';
    //    $('#a1').html('');

    //    entityTemplateString += '<div><h6> <label>Current Entity Name:</label>&nbsp;<label type="text" id="currEntName">' + entType + '</label></h6></div><table class="table" style="margin:2.5px !important;"><thead style="background-color: #4472c4; color: white; "><tr><th scope="col">Property Name</th><th scope="col">Data Value</th><th scope="col">Start Date</th><th scope="col">End Date</th></tr></thead><tbody>';
    //    var ent_all_data = gbl_all_entity_data.filter(x => x.Ent_ID == entityID);
    //    for (var i = 0; i < ent_all_data.length; i++) {
    //        var entityValue = ent_all_data[i].Ent_Value.trim();
    //        var sDate = ent_all_data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(ent_all_data[i].Start_Date);
    //        var eDate = ent_all_data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(ent_all_data[i].End_Date);
    //        entityTemplateString += '<tr><td>' + ent_all_data[i].Prop_Name + '</td><td>' + entityValue + '</td><td>' + sDate + '</td><td>' + eDate + '</td>';

    //    }
    //    entityTemplateString += '</tbody></table></div>';
    //    $('#a1').html('<div class="popover-body" style="z-index: 999999 !important;">' + entityTemplateString + ' </div>');

    //    setTimeout(bindTooltipForDates(), 500);
    //});
    getEquipmentEntityAssignmentByYear(ccEquipID);
}

function openCC(equipType, equipID, unitID, vendor) {
    ccEquipID = equipID;
    if (equipType != '') {
        ccEquipType = equipType;
    }
    if (unitID != '') {
        ccUnitID = unitID;
    }
    if (vendor != '') {
        ccVendor = vendor;
    }
    $('.selectDrpDown').html(uniqueEntityType).find('option:first').text('No Filter');
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
        onSelect: function (date, inst) {
            inst.show();
        }
    });

    $('.ui-datepicker').addClass('ccStyle')
    setTimeout(onChangeYear(), 500)

    //$('#ccEquipType').text(ccEquipType).attr('hidden', false);
    //$('#ccVendor').text(ccVendor).attr('hidden', false);
    $('#ccUnitID').text(ccUnitID).attr('hidden', false);
    $('#tblLegend > thead > tr > th:eq(1)').text('Entity Name')
    $('#tblLegend > thead > tr > th:eq(2)').text('Entity Type')
    $('#calendarControlModel').modal('show');
}
function getFilterEquipmentEntityAssignmentByYear() {
    selectedvalue = $('.selectDrpDown :selected').text().toLowerCase();
    if (selectedvalue == 'no filter') {
        bindFilterCalender(dataArray);
    } else {
        var filterArray = dataArray.filter(x => x.ENT_TYPE.toLowerCase() == selectedvalue);
        bindFilterCalender(filterArray);
    }
}

function bindFilterCalender(dataArray) {
    var legendStr = '';
    $(".ui-datepicker-calendar > tbody > tr > td").each(function () { $(this).children().css('background-color', 'rgb(246, 246, 246)').css('border', 'none'); });
    var newUnitID = [];
    for (var i = 0; i < dataArray.length; i++) {
        var isHidden = ''
        if (newUnitID.filter(x => x.ENT_NAME == dataArray[i].ENT_NAME).length > 0) {
            isHidden = 'hidden';
        }
        newUnitID.push({
            ENT_NAME: dataArray[i].ENT_NAME
        })
        var color = preservedColor.filter(x => x.ENT_NAME == dataArray[i].ENT_NAME);
        if (color.length > 0) {

            legendStr += '<tr ' + isHidden + ' data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Entity name: ' + dataArray[i].ENT_NAME + '<br/> Start Date: ' + getFormattedDate(dataArray[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(dataArray[i].END_DATE) + '"><input EQUIP_ENT_ID="' + dataArray[i].EQUIP_ENT_ID + '" type="hidden" isBorderedBox="1" equipmentid="' + dataArray[i].EQUIP_ID + '" data-ent-id="' + dataArray[i].ENT_ID + '" entName ="' + dataArray[i].ENT_NAME + '" data-start-date="' + dataArray[i].START_DATE + '" data-end-date="' + dataArray[i].END_DATE + '"  onclick="openAssignmentPopup()"> <td style="cursor:pointer;background-color:' + color[0].RandomColor + '"></td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].ENT_NAME + '\')">' + dataArray[i].ENT_NAME + '</td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].ENT_NAME + '\')">' + dataArray[i].ENT_TYPE + '</td></tr>';
        } else {
            legendStr += '<tr ' + isHidden + '  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Entity name: ' + dataArray[i].ENT_NAME + '<br/> Start Date: ' + getFormattedDate(dataArray[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(dataArray[i].END_DATE) + '"><input  EQUIP_ENT_ID="' + dataArray[i].EQUIP_ENT_ID + '" type="hidden" isBorderedBox="1" equipmentid="' + dataArray[i].EQUIP_ID + '" data-ent-id="' + dataArray[i].ENT_ID + '" entName ="' + dataArray[i].ENT_NAME + '" data-start-date="' + dataArray[i].START_DATE + '" data-end-date="' + dataArray[i].END_DATE + '"  onclick="openAssignmentPopup()"><td style="cursor:pointer;background-color:' + dataArray[i].RendomColor + '"></td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].ENT_NAME + '\')">' + dataArray[i].ENT_NAME + '</td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + dataArray[i].ENT_NAME + '\')">' + dataArray[i].ENT_TYPE + '</td></tr>';
        }


        $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
            var currMonth = $(this).attr('data-month');
            var currYear = $(this).attr('data-year');
            var currDay = $(this).text()
            var currDate = new Date(currYear, currMonth, currDay);
            if (new Date(dataArray[i].START_DATE) <= currDate && new Date(dataArray[i].END_DATE) >= currDate) {
                if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                    $(this).children().attr('equipmentID', dataArray[i].EQUIP_ID).attr('entType', dataArray[i].ENT_TYPE)
                        .attr('data-start-date', dataArray[i].START_DATE).attr('data-end-date', dataArray[i].END_DATE)
                        .attr('data-ent-id', dataArray[i].ENT_ID)
                        .attr('onclick', "openAssignmentPopup()")
                        .attr('EQUIP_ENT_ID', dataArray[i].EQUIP_ENT_ID);
                    var color = preservedColor.filter(x => x.ENT_NAME == dataArray[i].ENT_NAME);
                    if (color.length > 0) {

                        $(this).children().css('background-color', '\'' + color[0].RandomColor + '\'')
                    } else {
                        $(this).children().css('background-color', '\'' + dataArray[i].RendomColor + '\'')
                    }
                    $(this).children().attr('isBorderedBox', '0');
                }
                else {
                    $(this).children().css('border', '2px solid black');
                    $(this).children().attr('isBorderedBox', '1');
                }
            }
        })
    }
    $('#tblLegend > tbody > tr').remove();
    $('#tblLegend > tbody').append(legendStr);
    bindTooltip();
    spectrumColorForAssignment();
}
function getEquipmentEntityAssignmentByYear(equipID) {
    var year = $('#currentYear').text();
    $(".ui-datepicker-calendar > tbody > tr > td").each(function () { $(this).children().css('background-color', 'rgb(246, 246, 246)').css('border', 'none'); });
    $.ajax({
        before: AddLoader(),
        complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
        type: "GET",
        url: '/Equipment/GetEquipmentEntityAssignmentByYear?year=' + year + '&equipID=' + equipID,
        contentType: false,
        processData: false,
        success: function (data) {
            var newData = JSON.parse(data);
            if (newData.IsValid) {
                var legendStr = '';
                dataArray = newData.data;
                for (var i = 0; i < newData.data.length; i++) {
                    var isHidden = '';
                    if (preservedColor.filter(x => x.ENT_NAME == newData.data[i].ENT_NAME).length > 0) {
                        isHidden = 'hidden';
                    }
                    if (preservedColor.indexOf(newData.data[i].RendomColor) == -1) {
                        var obj = {
                            RandomColor: '#' + newData.data[i].RendomColor,
                            ENT_NAME: newData.data[i].ENT_NAME
                        };
                        preservedColor.push(obj);
                    }
                    var color = preservedColor.filter(x => x.ENT_NAME == newData.data[i].ENT_NAME);
                    if (color.length > 0) {
                        legendStr += '<tr ' + isHidden + ' data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Entity name: ' + newData.data[i].ENT_NAME + '<br/> Start Date: ' + getFormattedDate(newData.data[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(newData.data[i].END_DATE) + '"><input  EQUIP_ENT_ID="' + newData.data[i].EQUIP_ENT_ID + '" type="hidden" isBorderedBox="1" equipmentid="' + newData.data[i].EQUIP_ID + '" data-ent-id="' + newData.data[i].ENT_ID + '" entName ="' + newData.data[i].ENT_NAME + '" data-start-date="' + newData.data[i].START_DATE + '" data-end-date="' + newData.data[i].END_DATE + '"  onclick="openAssignmentPopup()"> <td style="cursor:pointer;background-color:' + color[0].RandomColor + '"></td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].ENT_NAME + '\')">' + newData.data[i].UNIT_ID + '</td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].ENT_NAME + '\')">' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                    } else {
                        legendStr += '<tr ' + isHidden + '  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Entity name: ' + newData.data[i].ENT_NAME + '<br/> Start Date: ' + getFormattedDate(newData.data[i].START_DATE) + ' <br/> End date: ' + getFormattedDate(newData.data[i].END_DATE) + '"> <input   EQUIP_ENT_ID="' + newData.data[i].EQUIP_ENT_ID + '"  type="hidden"  isBorderedBox="1" equipmentid="' + newData.data[i].EQUIP_ID + '" data-ent-id="' + newData.data[i].ENT_ID + '" entName ="' + newData.data[i].ENT_NAME + '" data-start-date="' + newData.data[i].START_DATE + '" data-end-date="' + newData.data[i].END_DATE + '"  onclick="openAssignmentPopup()"> <td style="cursor:pointer;background-color:' + newData.data[i].RendomColor + '"></td><td style="cursor:pointer;" onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].ENT_NAME + '\')">' + newData.data[i].UNIT_ID + '</td><td style="cursor:pointer;"onclick="openAssignmentPopupFromLegend(\'' + newData.data[i].ENT_NAME + '\')">' + newData.data[i].EQUIP_TYPE + '</td></tr>';
                    }

                    $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
                        var currMonth = $(this).attr('data-month');
                        var currYear = $(this).attr('data-year');
                        var currDay = $(this).text()
                        var currDate = new Date(currYear, currMonth, currDay);
                        if (new Date(newData.data[i].START_DATE) <= currDate && new Date(newData.data[i].END_DATE) >= currDate) {
                            if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                                $(this).children().attr('equipmentID', newData.data[i].EQUIP_ID).attr('entType', newData.data[i].UNIT_ID)
                                    .attr('data-start-date', newData.data[i].START_DATE).attr('data-end-date', newData.data[i].END_DATE)
                                    .attr('data-ent-id', newData.data[i].ENT_ID)
                                    .attr('entName', newData.data[i].ENT_NAME)
                                    .attr('onclick', "openAssignmentPopup()")
                                    .attr('EQUIP_ENT_ID', dataArray[i].EQUIP_ENT_ID);
                                var color = preservedColor.filter(x => x.ENT_NAME == newData.data[i].ENT_NAME);
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
                            }
                        }
                    })
                }
                $('#tblLegend > tbody > tr').remove();
                $('#tblLegend > tbody').append(legendStr);
                bindTooltip();
                spectrumColorForAssignment();
                filterFunctionForAssignment(dropDownVal)
            }

        },
    });
    $.ajax({
        before: AddLoader(),
        complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
        type: "GET",
        url: '/Entity/GetAllEntityTemplateDetails',
        contentType: false,
        processData: false,
        success: function (data) {
            var newData = JSON.parse(data);
            if (newData.IsValid) {
                gbl_all_entity_data = newData.data;
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
    $('#updateAssignmentOption').attr('hidden', false);
    $('#removeAssignmentOption').attr('hidden', false);
    $('#saveAssignmentOption').attr('hidden', true);
    $('#dateRangeDiv').attr('hidden', false);
    $('#addNewPropOfAssign').attr('hidden', false);
    isAddNewEntity = false;
    isDeleted = 2;

    isEquipEntityPopUP = false;
    var equipmentID = $(gbl_selected_td).attr('equipmentid');
    var ent_id = $(gbl_selected_td).attr('data-ent-id');
    var entType = $(gbl_selected_td).attr('entType');
    var entName = $(gbl_selected_td).attr('entName');
    var isBorderedBoxVal = $(gbl_selected_td).attr('isBorderedBox');
    var EQUIP_ENT_ID = $(gbl_selected_td).attr('equip_ent_id');
    $('#currID').val(EQUIP_ENT_ID)
    $('#currEntityName').text(entName);
    $('#currEntityDiv').attr('hidden', false);

    dateRangeTmp = '';
    ccEntityNameSelectList = '';
    var selectedOption = '';

    $("#tblLegend > tbody >  tr").each(function () {
        var entid = $(this).find('input').attr('data-ent-id');
        var equipEntID = $(this).find('input').attr('EQUIP_ENT_ID');

        selectedOption = '';
        if (!$(this).prop('hidden')) {
            if (entid == ent_id) {
                selectedOption = 'selected';
            }
            ccEntityNameSelectList += '<option ' + selectedOption + ' value=' + entid + '>' + $(this).find('input').attr('entname') + '</option>';
        }

        if (deleteEntityID == entid) {
            var sDateTmp = getFormattedDate($(this).find('input').attr('data-start-date'));
            var eDateTmp = getFormattedDate($(this).find('input').attr('data-end-date'));
            var selectedText = sDateTmp == deleteStartDate && eDateTmp == deleteEndDate ? 'selected' : '';
            dateRangeTmp += '<option ' + selectedText + ' EQUIP_ENT_ID="' + equipEntID + '" entid="' + entid + '" startDate="' + sDateTmp + '" endDate="' + eDateTmp + '">' + sDateTmp + ' - ' + eDateTmp + '</option>';
        }
    })
    $('#dateRange').html(dateRangeTmp);

    if (isBorderedBoxVal == '1' || isDropDownChange) {
        $('#changeEntityName').attr('hidden', false).html(ccEntityNameSelectList).val(ent_id);
        isDropDownChange = false;
    }
    else {
        $('#changeEntityName').attr('hidden', true)
    }

    deleteAssignmentModel.modal('show');
    deleteEntityID = ent_id;
    deleteEquipID = equipmentID;
    deleteStartDate = new Date($(gbl_selected_td).attr('data-start-date'));
    deleteEndDate = new Date($(gbl_selected_td).attr('data-end-date'));
    resetDeleteAssignmentModel();
    

    $('#startDateLbl').text($('.updateStartDatepicker').val());
    $('#endDateLbl').text($('.updateEndDatepicker').val());
    $('#calendarControlModel').css('z-index', '1035')
}

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

            var entityID = $($(this).children(".ui-state-default")[0].outerHTML).attr('data-ent-id');
            if (entityID == undefined) {
                return;
            }
            var entType = $($(this).children(".ui-state-default")[0].outerHTML).attr('entType');
            gbl_selected_td = $($(this).children(".ui-state-default")[0].outerHTML);
            entityTemplateString = '';
            $('#a1').html('');

            entityTemplateString += '<div><h6> <label>Current Entity Name:</label>&nbsp;<label type="text" id="currEntName">' + entType + '</label></h6></div><table class="table" style="margin:2.5px !important;"><thead style="background-color: #4472c4; color: white; "><tr><th scope="col">Property Name</th><th scope="col">Data Value</th><th scope="col">Start Date</th><th scope="col">End Date</th></tr></thead><tbody>';
            var ent_all_data = gbl_all_entity_data.filter(x => x.Ent_ID == entityID);
            for (var i = 0; i < ent_all_data.length; i++) {
                var entityValue = ent_all_data[i].Ent_Value.trim();
                var sDate = ent_all_data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(ent_all_data[i].Start_Date);
                var eDate = ent_all_data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(ent_all_data[i].End_Date);
                entityTemplateString += '<tr><td>' + ent_all_data[i].Prop_Name + '</td><td>' + entityValue + '</td><td>' + sDate + '</td><td>' + eDate + '</td>';

            }
            entityTemplateString += '</tbody></table></div>';
            $('#a1').html('<div class="popover-body" style="z-index: 999999 !important;">' + entityTemplateString + ' </div>');


            return $(content).children(".popover-body").html();
        },
    });
}

$('#changeEntityName').change(function () {
    if (!isAddNewEntity) {
        isDropDownChange = true;
        gbl_selected_td = $($('.ui-datepicker-calendar').find('[entname="' + $(this).find(":selected").text() + '"]')[0]);
        if (gbl_selected_td[0] == undefined) {
            gbl_selected_td = $('#tblLegend > tbody > tr').find('[entname="' + $(this).find(":selected").text() + '"]');
        }
        gbl_selected_td.trigger('click');
    }
    else {
        deleteEntityID = $(this).val();
    }
})

function openAssignmentPopupFromLegend(entityName) {
    gbl_selected_td = $('#tblLegend > tbody > tr').find('[entname="' + entityName + '"]');
    openAssignmentPopup();
}


function AddNewPropOfAssign() {
    var sDate = getTodayDate();
    isAddNewEntity = true;
    isDeleted = 0;
    $('#changeEntityName').html(addNewEntitySelectList);
    $('.updateStartDatepicker').bootstrapDP('setDate', sDate);
    $('.updateEndDatepicker').bootstrapDP('setDate', '01/01/9999');
    $('#startDateLbl').text(sDate);
    $('#endDateLbl').text('01/01/9999');
    $('#currEntityName').text('');
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
    window.location.href = '/ExcelFiles/EntityEquipmentAssignSample.xlsx';
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
    window.location = "/Entity/EntityEquipmentAssignDateRangeExport?startDate=" + $('#mainDate').val() + "&searchString=" + $('#searchEntityStr').val().trim() + "&cookieValue=" + cookieValue;
    _tmr = window.setInterval(function () {
        var _str = getCookie("cookie_EntityData");
        if (document.cookie.indexOf(_str) !== -1) {
            // hide animation
            setTimeout(function () { RemoveLoader(); }, 1000);
            clearInterval(_tmr)
            ClearCockie("cookie_EntityData");
        }
    }, 1000);
}
function sampleFileDateRangeImportDownload() {
    $("#importDateRange").popover('hide')
    window.location.href = '/ExcelFiles/EntityEquipmentAssignDateRangeSample.xlsx';
}