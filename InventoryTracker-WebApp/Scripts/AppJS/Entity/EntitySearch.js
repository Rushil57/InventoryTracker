﻿/*var isLoadTime = true;*/
/*var entityTemplate = $('#entityTemplate');*/
/*var entityType = $('#entityType');*/
/*var entityName = $('#entityName');*/
var previousElement = '';
var entityHDRID = $('#entityHDRID');
var equipmentModelBody = $('#equipmentModelBody');
var equipmentTempDTL = $('#equipmentTempDTL');
/*var tblHDR = ' <th scope="col">Entity type</th> <th scope="col">Entity name</th>';*/
var currentEntityID = 0;
var currentDate = '';
var currentEntityType = 0;
var currentEntityName = '';
var previousEquipmentElement = '';
var entityNameLblEle = $('#entityNameLbl');
//var ccPropDetails = [];

$(document).ready(function () {
    //    loadAllEntityTemp();
    //    disabled()
    //    $('.datepicker').datepicker({
    //        autoclose: true
    //    }).on('change', function (e) {
    //        currentDate = this.value;
    //        if (isLoadTime) {
    //            isLoadTime = false;
    //            return;
    //        }
    //        loadTemplateDetails(currentEntityID, currentEntityType, currentEntityName, currentDate)
    //    }).datepicker('setDate', new Date());
    $('#selectedMenu').text($('#menuEntSearch').text());
    $('#entityActive').remove();
    loadEntityHDR('', false);
    $('.bi-database').attr('onclick', 'showEntityModel()');
})


function loadEntityHDR(searchString, searchflag) {

    if (searchflag == true) {
        entitysearchflag = true;
        $("#entityHDR > tbody > tr").remove();
        startIndexEntity = 0;
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
        data: { 'searchString': searchString, 'startIndex': startIndexEntity, 'endIndex': endIndexEntity },
        success: function (data) {
            if (data.IsValid) {
                var entityString = '';
                var isaddEntityColumn = false;
                for (var i = 0; i < data.data.length; i++) {
                    entityString += '<tr style="cursor:pointer" onclick="loadTemplateDetails(' + data.data[i].ENT_ID + ',\'' + data.data[i].ENT_TYPE + '\',\'' + data.data[i].ENT_NAME + '\',' + null + ',this)"><input type="hidden" value="' + data.data[i].ENT_ID + '"/><td>' + data.data[i].ENT_TYPE + '</td><td>' + data.data[i].ENT_NAME + '</td><td>' + data.data[i].ASSIGNED + '</td></tr>';
                    //entityString += '<tr style="cursor:pointer" onclick="loadTemplateDetails(' + data.data[i].ENT_ID + ',\'' + data.data[i].ENT_TYPE + '\',\'' + data.data[i].ENT_NAME + '\',' + null +    ',this)"><input type="hidden" value="' + data.data[i].ENT_ID + '"/><td>' + data.data[i].ENT_TYPE + '</td><td>' + data.data[i].ENT_NAME + '</td><td>' + data.data[i].ASSIGNED + '</td></tr>';
                }
                var tableHeadLength = $("#entityHDR > thead > tr >  th").length;
                for (var th = 3; th <= tableHeadLength;) {
                    isaddEntityColumn = true;
                    $($("#entityHDR > thead > tr >  th")[th]).remove();
                    $("#entityHDR > tbody > tr").find("td:eq(" + th + ")").remove();
                    tableHeadLength = tableHeadLength - 1;
                }
                $("#entityHDR > tbody").append(entityString);
                if (isaddEntityColumn) {
                    addEntityColumn();
                }
            }
        }, error: function (ex) { }
    });
}
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

//$('#search').click(function () {
//    addEntityHeader()
//})

//function addEntityColumn() {
//    var tableHeader = '';
//    tableHeader += tblHDR;/*' <th scope="col">Entity type</th> <th scope="col">Entity name</th>';*/
//    //tableHeader += ' <th scope="col">Entity type</th> <th scope="col">Entity name</th><th scope="col">Assigned</th>';
//    $('#entityTemplateModelBody .form-check-input').each(function () {
//        if ($(this).is(':checked')) {
//            tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
//            $.ajax({
//                before: AddLoader(),
//                after: RemoveLoader(),
//                url: '/Entity/EntityValueByPropName',
//                contentType: 'application/json; charset=utf-8',
//                dataType: 'json',
//                type: 'GET',
//                async: false,
//                data: { 'propName': $(this).attr('id') },
//                success: function (data) {
//                    $("#entityHDR > tbody >  tr").each(function () {
//                        $(this).find('td:last').after('<td></td>')
//                    })
//                    for (var i = 0; i < data.data.length; i++) {
//                        $("#entityHDR > tbody >  tr").find('input[value="' + data.data[i].Ent_ID + '"]').parent().find('td:last').text(data.data[i].Ent_Value);
//                    }
//                },
//                error: function (ex) { }
//            });
//        }
//    })
//    $("#entityHDR > thead >  tr > th").remove();
//    $("#entityHDR > thead >  tr").append(tableHeader);
//    entityTemplate.modal('hide');

//}

function addEntityHeader() {
    startIndexEntity = 0;
    endIndexEntity = 30;
    loadEntityHDR($('#searchEntityStr').val());
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


function loadTemplateDetails(entityID, entityTypeVal, entityNameVal, startDate, element) {
    entityType.removeClass('textBox-BackColor');
    entityName.removeClass('textBox-BackColor').attr('hidden', true);
    $('#entityCC').remove();

    if (element != undefined) {
        $(previousElement).css('background-color', 'white').css('color', 'black');
        $(element).css('background-color', '#96a6c3').css('color', 'white');
        previousElement = element;
    }
    else if (previousElement == '') {
        return;
    }
    var date = (typeof startDate != 'undefined' && startDate != null) ? startDate : currentDate;
    entityType.val(entityTypeVal.toUpperCase());
    entityName.val(entityNameVal);
    entityHDRID.val(entityID);
    entityNameLblEle.text(entityNameVal);
    entityNameLblEle.attr('hidden', false);
    disabled();

    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/GetEntityTemplateDetails',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'entityID': entityID != 0 ? entityID : currentEntityID, 'startDate': date },
        success: function (data) {
            if (data.IsValid) {
                var entityDetailString = '';
                for (var i = 0; i < data.data.length; i++) {
                    var startDate = data.data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].Start_Date);

                    var eqValue = '';
                    if (data.data[i].Datatype.toLowerCase() == 'hyperlink') {
                        eqValue = '<a href="https://' + data.data[i].Ent_Value + '" target="_blank">' + data.data[i].Ent_Value + '</a>'
                    }
                    else {
                        eqValue = data.data[i].Ent_Value;
                    }
                    var endDate = data.data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].End_Date);
                    entityDetailString += '<tr><input type="hidden" class="entityDtlID" value="' + data.data[i].Ent_Dtl_ID + '" /><input type="hidden" class="entityTmpID" value="' + data.data[i].Ent_Temp_ID + '" /><td>' + data.data[i].Prop_Name + '</td><td>' + eqValue + '</td><td>' + startDate + '</td><td>' + endDate + '</td></tr>';
                }
                $("#tblTemplateDtl > tbody >  tr").remove();
                $("#tblTemplateDtl > tbody").append(entityDetailString);

                var equipmentHeadersString = '';
                for (var i = 0; i < data.equipmentHeaders.length; i++) {
                    var sDate = data.equipmentHeaders[i].START_DATE == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.equipmentHeaders[i].START_DATE);
                    var eDate = data.equipmentHeaders[i].END_DATE == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.equipmentHeaders[i].END_DATE);
                    var mainDate = $('#mainDate').val();
                    var lightGreenClass = "";

                    if (new Date(mainDate) >= new Date(sDate) && new Date(mainDate) <= new Date(eDate)) {
                        lightGreenClass = "lightGreenCls";
                    }
                    equipmentHeadersString += '<tr  style="cursor:pointer" onclick= showEquipmentDetails(this) class="' + lightGreenClass + '"><input type="hidden" value="' + data.equipmentHeaders[i].EQUIP_ID + '" /><td>' + data.equipmentHeaders[i].EQUIP_TYPE + '</td><td>' + sDate + '</td><td>' + eDate + '</td></tr>';
                }
                $("#tblEquipmentHistory > tbody >  tr").remove();
                $("#tblEquipmentHistory > tbody").append(equipmentHeadersString);

            }
        }, error: function (ex) { }
    });

    currentEntityID = entityID;
    currentEntityType = entityTypeVal;
    currentEntityName = entityNameVal;
    currentDate = date;
}


$('#editTemplate').click(function () {
    entityType.addClass('textBox-BackColor');
    entityName.addClass('textBox-BackColor');
    disabled();
    entityNameLblEle.attr('hidden', true);
    entityNameLblEle.text('');
    entityName.attr('hidden', false);
    $('#mainDate').after('<svg style="cursor:pointer" onclick="openCC(\'' + currentEntityName + '\',' + currentEntityID  +')" id="entityCC" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar4- float-end mt-2 me-2" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" /><path d="M9 7.5a.5.5 0 0 1 .5-.5H15v2H9.5a.5.5 0 0 1-.5-.5v-1zm-2 3v1a.5.5 0 0 1-.5.5H1v-2h5.5a.5.5 0 0 1 .5.5z" /></svg>');
    $("#tblTemplateDtl > tbody >  tr").each(function () {
        var firsttd = $(this).find("td:eq(1)");
        var secondtd = $(this).find("td:eq(2)");
        var thirdtd = $(this).find("td:eq(3)");
        firsttd.html("<input type='text' class='dropdown-control' style='width:100%' value='" + firsttd.text().trim() + "'>");
        secondtd.html("<input type='text' class='datepicker dropdown-control' value='" + secondtd.text().trim() + "'>");
        thirdtd.html("<input type='text' class='datepicker dropdown-control' value='" + thirdtd.text().trim() + "'>");
    });

    $('.datepicker').datepicker({
        autoclose: true
    });
})

$('#deleteTemplate').click(function () {
    if (previousElement == '') {
        alert('Please select Entity type.')
    }
    else {
        if (confirm('Are you sure you want to delete this record?')) {
            $.ajax({
                before: AddLoader(),
                after: RemoveLoader(),
                url: '/Entity/DeleteEntityHeader',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                async: false,
                data: JSON.stringify({ 'entityID': currentEntityID }),
                success: function (data) {
                    if (data.IsValid) {
                        loadEntityHDR($('#searchEntityStr').val().trim(), true);
                        $("#tblTemplateDtl > tbody >  tr").remove();
                        $("#tblEquipmentHistory > tbody >  tr").remove();
                        entityType.val(0);
                        entityName.val('');
                        addEntityColumn();
                    }
                }, error: function (ex) { }
            });
        }
    }
})



$('#newTemplate').click(function () {
    enabled();
    entityType.val(0).addClass('textBox-BackColor');
    entityName.val("").addClass('textBox-BackColor');
    entityHDRID.val(0);
    entityNameLblEle.attr('hidden', true);
    entityNameLblEle.text('');
    entityName.attr('hidden', false);

    $('#entityCC').remove();

    var todayDate = (new Date()).toLocaleDateString().split('T')[0];
    $("#tblTemplateDtl > tbody >  tr").remove();
    $('.datepicker').datepicker({
        autoclose: true
    });
})


function saveHDRTemplateDtl() {
    var entityTypeVal = entityType.val();
    var entityNameVal = entityName.val().trim();
    var isExist = false;
    var alertText = 'Please enter ';
    var isPreVal = false;

    if (entityTypeVal == null || entityTypeVal == "") {
        alertText += "Entity type";
        isPreVal = true;
    }
    if (entityNameVal == null || entityNameVal == "") {
        if (isPreVal) {
            alertText += ","
        }
        alertText += " Entity name ";
        isPreVal = true;
    }
    if (alertText != '' && isPreVal) {
        alert(alertText + " !");
        return;
    }
    $('#entityHDR > tbody >  tr').each(function () {
        if ($(this).find("td:eq(0)").text().trim().toLowerCase() == entityTypeVal.toLowerCase() && $(this).find("td:eq(1)").text().trim().toLowerCase() == entityNameVal.toLowerCase()) {
            isExist = true;
            return;
        }
    })
    if (isExist == false || entityHDRID.val() > 0) {
        var entityHDR = [];
        entityHDR.push({
            ENT_TYPE: entityTypeVal,
            ENT_NAME: entityNameVal,
            ENT_ID: entityHDRID.val()
        })

        var entityTmpDtl = [];
        var isStartGTEnd = false;
        $("#tblTemplateDtl > tbody >  tr").each(function () {
            var Ent_Dtl_ID = $(this).find('.entityDtlID').val();
            var Ent_Temp_ID = $(this).find('.entityTmpID').val();
            var firsttd = (typeof $(this).find("td:eq(1)").text() != 'undefined' && $(this).find("td:eq(1)").text().trim() != "") ? $(this).find("td:eq(1)").text() : $(this).find("td:eq(1) >  input").val();
            var secondtd = (typeof $(this).find("td:eq(2)").text() != 'undefined' && $(this).find("td:eq(2)").text().trim() != '') ? $(this).find("td:eq(2)").text() : $(this).find("td:eq(2) >  input").val();
            var thirdtd = (typeof $(this).find("td:eq(3)").text() != 'undefined' && $(this).find("td:eq(3)").text().trim() != '') ? $(this).find("td:eq(3)").text() : $(this).find("td:eq(3) >  input").val();

            $(this).find("td:eq(2) > input").css('background-color', 'white');
            $(this).find("td:eq(3) > input").css('background-color', 'white');
            if (secondtd == '' || secondtd == undefined) {
                isStartGTEnd = true;
                $(this).find("td:eq(2)  > input").css('background-color', '#f5cece');
                return;
            }
            if (thirdtd == '' || thirdtd == undefined) {
                isStartGTEnd = true;
                $(this).find("td:eq(3)  > input").css('background-color', '#f5cece');
                return;
            }

            if (new Date(secondtd) > new Date(thirdtd)) {
                isStartGTEnd = true;
                $(this).find("td:eq(2)  > input").css('background-color', '#f5cece');
                return;
            }

            entityTmpDtl.push({
                Ent_Dtl_ID: Ent_Dtl_ID,
                Ent_Temp_ID: Ent_Temp_ID,
                Ent_Value: firsttd,
                Start_Date: secondtd == '' ? "01/01/0001" : secondtd,
                End_Date: thirdtd == '' ? "01/01/0001" : thirdtd
            })
        });

        if (isStartGTEnd) {
            alert("Start date is greater than end date or date fields is empty.");
            return;
        }

        $.ajax({
            before: AddLoader(),
            after: RemoveLoader(),
            url: '/Entity/SaveEntityHDRTempData',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: JSON.stringify({ 'entityHDR': JSON.stringify(entityHDR), 'entityTmpDtl': JSON.stringify(entityTmpDtl) }),
            success: function (data) {
                if (data.IsValid) {
                    loadEntityHDR($('#searchEntityStr').val().trim(), true);
                    $('#entityHDR > tbody >  tr:last').trigger('click');
                    addEntityColumn();
                }
                else {
                    alert(data.data)
                }
            }, error: function (ex) { }
        });
    }
    else {
        alert('This entity header is already exist.')
    }
}


function showEquipmentDetails(element) {
    $(previousEquipmentElement).css('background-color', 'white').css('color', 'black');
    $(element).css('background-color', '#96a6c3').css('color', 'white');
    previousEquipmentElement = element;

    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentTemplateDetails',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'equipID': $(element).find("input[type='hidden']").val() },
        success: function (data) {
            if (data.IsValid) {
                var equipmentTemplateString = '';
                equipmentTemplateString += '<table class="table" ><thead style="background-color: #4472c4; color: white; "><tr><th scope="col">Property Name</th><th scope="col">Data Value</th><th scope="col">Start Date</th><th scope="col">End Date</th></tr></thead><tbody>';

                for (var i = 0; i < data.data.length; i++) {
                    var equipmentValue = data.data[i].Eq_Value.trim();

                    var sDate = data.data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].Start_Date);
                    var eDate = data.data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].End_Date);
                    equipmentTemplateString += '<tr><td>' + data.data[i].Prop_Name + '</td><td>' + equipmentValue + '</td><td>' + sDate + '</td><td>' + eDate + '</td>';
                }
                equipmentTemplateString += '</tbody></table>';
                equipmentModelBody.html(equipmentTemplateString);
                equipmentTempDTL.modal('show');
            }
        }, error: function (ex) { }
    });

}


//function showEntityModel() {
//    entityTemplate.modal('show');
//}


//function disabled() {
//    entityType.prop("disabled", true);
//    entityType.css('opacity', '0.5');
//    entityName.prop("disabled", true);
//    entityName.css('opacity', '0.5');
//}

function enabled() {
    entityType.prop("disabled", false);
    entityType.css('opacity', '1');
    entityName.prop("disabled", false);
    entityName.css('opacity', '1');
}


$('#entityType').change(function () {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/GetEntityTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'entityType': $(this).val() },
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';
                for (var i = 0; i < data.data.length; i++) {
                    templateString += "<tr><input type='hidden' class='entityDtlID' value='0' /> <input type='hidden' class='entityTmpID' value='" + data.data[i].Ent_temp_id + "'/><td>" + data.data[i].Prop_name + "</td><td><input type='text' class='dropdown-control' style='width:100%' value=''> </td><td><input type='text' class='datepicker startdate dropdown-control' value=''></td><td><input type='text' class='datepicker enddate dropdown-control' value=''> </td></tr>";
                }
                $('#tblTemplateDtl > tbody > tr').remove();
                $('#tblTemplateDtl > tbody').append(templateString);
                $('.startdate').datepicker({
                    autoclose: true
                }).datepicker('setDate', $('#mainDate').val());
                $('.enddate').datepicker({
                    autoclose: true
                }).datepicker('setDate', '01/01/9999');
            }
        }, error: function (ex) { }
    });
})

function exportData() {
    AddLoader();
    window.location = "/Entity/Export?startDate=" + $('#mainDate').val() + "&searchString=" + $('#searchEntityStr').val().trim();
    RemoveLoader();
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
        if (isBulkImport) {
            $.ajax({
                before: AddLoader(),
                after: RemoveLoader(),
                type: "POST",
                url: '/Entity/BulkImport',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    var newData = JSON.parse(data);
                    alert(newData.data);
                    if (newData.IsValid) {
                        $('#importExcel').modal('hide');
                        loadEntityHDR('', false);
                    }
                },
                error: function (e1, e2, e3) {
                }
            });
        } else {
            $.ajax({
                before: AddLoader(),
                after: RemoveLoader(),
                type: "POST",
                url: '/Entity/Import',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    var newData = JSON.parse(data);
                    alert(newData.data);
                    if (newData.IsValid) {
                        $('#importExcel').modal('hide');
                        loadTemplateDetails(currentEntityID, currentEntityType, currentEntityName, currentDate)
                    }
                },
                error: function (e1, e2, e3) {
                }
            });
        }
    }

}

function sampleFileDownload() {
    $("#bulkImport").popover('hide');
    window.location.href = '/ExcelFiles/Entity_Bulk_Import.xlsx';
}

$('#nextYear').click(function () {
    $('.ui-icon-circle-triangle-e').trigger('click');
    setTimeout(onChangeYear(), 500);
});
$('#prevYear').click(function () {
    $('.ui-icon-circle-triangle-w').trigger('click');
    setTimeout(onChangeYear(), 500)
});

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
        onSelect: function (date, inst) {
            inst.show();
        }
    });

    $('.ui-datepicker').addClass('ccStyle')
    setTimeout(onChangeYear(), 500)
    $('#ccEntityName').attr('hidden', false).text(ccEntityName);

    var legendStr = '';
    var filterStr = '<option value="0" selected>No Filter</option>';
    $("#tblTemplateDtl > tbody >  tr").each(function () {
        legendStr += ''
        var zerotdText = $(this).find("td:eq(0)").text();
        //var secondtd = $(this).find("td:eq(2)");
        //var thirdtd = $(this).find("td:eq(3)");
        var entityTmpID = $(this).find('entityTmpID');
        var color = getRandomColor();
        legendStr += '<tr><input type="hidden" value="' + entityTmpID + '"><td style="background-color:' + color + ' !important"></td><td>' + zerotdText + '</td></tr>';
        filterStr += '<option value=' + entityTmpID + '>' + zerotdText + '</option>'
        //ccPropDetails.push({
        //    tmpID: entityTmpID,
        //    propName: zerotd ,
        //    startDate: secondtd,
        //    endDate: thirdtd,
        //    color: color
        //    })
    });
    $('#tblLegend > tbody > tr').remove();
    $('#tblLegend > tbody').append(legendStr);
    $('.selectDrpDown').html(filterStr);
    $('#calendarControlModel').modal('show');
}


function onChangeYear() {
    $('#currentYear').text($('.ui-datepicker-year:first').text());
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}