/*var isLoadTime = true;*/
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
var ccPropDetails = [];
var dropDownVal = 0;
var ccEntityID = 0;
var ccEntityName = '';
var isDropDownChange = false;
var filterStr = '';

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
    $('#entityCC').attr('onclick', '').css('opacity', '0.4');
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

    $('#entityCC').attr('onclick', 'openCC(\'' + currentEntityName + '\',' + currentEntityID + ')')
        .css('opacity','1');
   
    $("#tblTemplateDtl > tbody >  tr").each(function () {
        var firsttd = $(this).find("td:eq(1)");
        var secondtd = $(this).find("td:eq(2)");
        var thirdtd = $(this).find("td:eq(3)");
        firsttd.html("<input type='text' class='dropdown-control' style='width:100%' value='" + firsttd.text().trim() + "'>");
        secondtd.html("<input type='text' class='datepicker dropdown-control' value='" + secondtd.text().trim() + "'>");
        thirdtd.html("<input type='text' class='datepicker dropdown-control' value='" + thirdtd.text().trim() + "'>");
    });
    bootStrapDropDown();
    
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

    $('#entityCC').attr('onclick', '').css('opacity', '0.4');;
    var todayDate = (new Date()).toLocaleDateString().split('T')[0];
    $("#tblTemplateDtl > tbody >  tr").remove();
    bootStrapDropDown();
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
    ccEntityName = entityName;
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

    $('#ccEntityName').attr('hidden', false).text(ccEntityName);

    var legendStr = '';
    filterStr = '<option value="0" selected>No Filter</option>';
    ccPropDetails = [];
    $("#tblTemplateDtl > tbody >  tr").each(function () {

        var zerotdText = $(this).find("td:eq(0)").text();
        var firstText = $(this).find("td:eq(1) > input").val();
        var secondtd = $(this).find("td:eq(2) > input").val();
        var thirdtd = $(this).find("td:eq(3) >  input").val();
        var secondtdDate = new Date(secondtd);
        var thirdtdDate = new Date(thirdtd);
        var entityTmpID = $(this).find('.entityTmpID').val();
        var entityDtlID = $(this).find('.entityDtlID').val();

        var color = getRandomColor();
        legendStr += '<tr data-start-date="' + secondtd + '" data-end-date="' + thirdtd + '" currDTLID="' + entityTmpID + '" dataValue="' + firstText + '" propName="' + zerotdText +'" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Property Name: ' + zerotdText + '<br/> Start date: ' + secondtd + '<br/> End date: ' + thirdtd + '"><input type="hidden" value="' + entityTmpID + '"><td style="background-color:' + color + ' !important"></td><td>' + zerotdText + '</td></tr>';
        filterStr += '<option value=' + entityTmpID + '>' + zerotdText + '</option>';

        ccPropDetails.push({
            tmpID: entityTmpID,
            propName: zerotdText,
            startDate: secondtd,
            endDate: thirdtd,
            color: color,
            dataValue: firstText,
            entityDtlID: entityDtlID
        })
        $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
            var currMonth = $(this).attr('data-month');
            var currYear = $(this).attr('data-year');
            var currDay = $(this).text()
            var currDate = new Date(currYear, currMonth, currDay);
            if (secondtdDate <= currDate && thirdtdDate >= currDate) {
                if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                    $(this).children()
                        .attr('data-start-date', secondtd).attr('data-end-date', thirdtd)
                        .attr('data-ent-id', entityHDRID.val())
                        .attr('onclick', "openEditPopup(this)")
                        .css('background-color', '\'' + color + '\'')
                        .attr('isBorderedBox', '0')
                        .attr('data-bs-toggle', 'tooltip')
                        .attr('data-bs-placement', 'bottom')
                        .attr('data-bs-title', 'Property Name: ' + zerotdText + '<br/> Data Value: ' + firstText)
                        .attr('data-bs-html', true)
                        .attr('propName', zerotdText)
                        .attr('dataValue', firstText)
                        .attr('entityDtlID', entityDtlID)
                        .attr('entityTempID', entityTmpID);
                }
                else {
                    $(this).children().css('border', '2px solid black')
                        .attr('isBorderedBox', '1');
                }
            }
        })
    });
    $('#tblLegend > tbody > tr').remove();
    $('#tblLegend > tbody').append(legendStr);
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('.selectDrpDown').html(filterStr);
    $('#calendarControlModel').modal('show').css('z-index', '99999');;
    setTimeout(onChangeYear(), 500)
}


function onChangeYear() {
    $('#currentYear').text($('.ui-datepicker-year:first').text());
    filterFunction(dropDownVal);
}

function bindDate(filterVal = 0) {
    var year = $('#currentYear').text();
    $(".ui-datepicker-calendar > tbody > tr > td").each(function () { $(this).children().css('background-color', 'rgb(246, 246, 246)').css('border', 'none').attr('data-bs-toggle', '') });
    var currentYearData = ccPropDetails.filter(x => new Date(x.startDate).getFullYear() == year || new Date(x.endDate).getFullYear() >= year);
    currentYearData;
    if (filterVal > 0) {
        currentYearData = ccPropDetails.filter(x => x.tmpID == filterVal);
    }
    $(currentYearData).each(function () {
        var sDate = $(this)[0].startDate;
        var eDate = $(this)[0].endDate;
        var color = $(this)[0].color;
        var propName = $(this)[0].propName;
        var dataVal = $(this)[0].dataValue;
        var entityDtlID = $(this)[0].entityDtlID;
        var tmpID = $(this)[0].tmpID;

        $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
            var currMonth = $(this).attr('data-month');
            var currYear = $(this).attr('data-year');
            var currDay = $(this).text()
            var currDate = new Date(currYear, currMonth, currDay);
            if (new Date(sDate) <= currDate && new Date(eDate) >= currDate) {
                if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                    $(this).children()
                        .attr('data-start-date', sDate).attr('data-end-date', eDate)
                        .attr('data-ent-id', entityHDRID.val())
                        .attr('onclick', "openEditPopup(this)")
                        .css('background-color', '\'' + color + '\'')
                        .attr('isBorderedBox', '0')
                        .attr('data-bs-toggle', 'tooltip')
                        .attr('data-bs-placement', 'bottom')
                        .attr('data-bs-title', 'Property Name: ' + propName + '<br/> Data Value: ' + dataVal)
                        .attr('data-bs-html', true)
                        .attr('propName', propName)
                        .attr('dataValue', dataVal)
                        .attr('entityDtlID', entityDtlID)
                        .attr('entityTempID', tmpID);
                }
                else {
                    $(this).children().css('border', '2px solid black')
                        .attr('isBorderedBox', '1');
                }
            }
        })
    })
    $('[data-bs-toggle="tooltip"]').tooltip();
    spectrumColor();
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

$('.selectDrpDown').change(function () {
    dropDownVal = $(this).val();
    filterFunction(dropDownVal);
})


function filterFunction(dropDownVal) {
    $("#tblLegend tr").each(function (index) {
        var row = $(this);
        if (dropDownVal == 0) {
            row.show();
            bindDate(0)
        }
        else {
            if (index !== 0) {
                if (row.find('[type="hidden"]').val().toLowerCase() != dropDownVal.toLowerCase().trim()) {
                    row.hide();
                }
                else {
                    row.show();
                    bindDate(row.find('[type="hidden"]').val().toLowerCase());
                }
            }
        }

    });
}

function openEditPopup(element) {
    var sdate = $(element).attr('data-start-date');
    var edate = $(element).attr('data-end-date');
    var entityID = $(element).attr('data-ent-id');
    var propName = $(element).attr('propName');
    var dataValue = $(element).attr('dataValue');
    var entityDtlID = $(element).attr('entityDtlID');
    var isBorderedBoxVal = $(element).attr('isBorderedBox');
    var entityTempID = $(element).attr('entityTempID');
    $('#changeProp').attr('hidden', true);
    $('#saveData').attr('hidden', true );
    $('#updateData').attr('hidden', false );

    //if (isBorderedBoxVal == '1' || isDropDownChange) {
    // //$('#changeProp').attr('hidden', false).html(filterStr).val(entityTempID);
    //    //$($('#changeProp >  option')[0]).remove()
    //    // Neee to uncommit   
    //    isDropDownChange = false;
    //}
    //else {
    //    $('#changeProp').attr('hidden', true)
    //}
    $('#currEntDTLID').val(entityDtlID);
    $('#startDateLbl').text(sdate);
    $('#endDateLbl').text(edate);
    $('.updateStartDatepicker').val(sdate);
    $('.updateEndDatepicker').val(edate);
    $('#propName').text(propName);
    $('#dataValue').val(dataValue);
    resetEditModel();
    $('#editEntityEquipment').modal('show');
    $('#calendarControlModel').css('z-index', '1035')
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
    $('#calendarControlModel').css('z-index', '99999');
}

function updateEditOption() {
    var sdate = $('.updateStartDatepicker').val();
    var edate = $('.updateEndDatepicker').val();
    var dataValue = $('#dataValue').val();
    var changeValueEle = $('#tblTemplateDtl >  tbody').find("[value='" + $('#currEntDTLID').val() + "']");
    changeValueEle.parent().find('td:eq(1) > input').val(dataValue);
    changeValueEle.parent().find('td:eq(2) > input').val(sdate);
    changeValueEle.parent().find('td:eq(3) > input').val(edate);
    saveHDRTemplateDtl();
    $('#editEntityEquipment').modal('hide');
    $('#calendarControlModel').modal('hide');
    $("#entityHDR > tbody").find("[value='" + ccEntityID + "']").parent().trigger('click');
    $('#editTemplate').trigger('click');
    setTimeout(callFunction, 500)
}


//$('#changeProp').change(function () {
//    var propName = $(this).find(":selected").text();
//    var element = $('#tblLegend >  tbody').find('[propName="' + propName + '"]')
//    //var dtlID = element.attr('currdtlid');
//    //var sDate = element.attr('startDate');
//    //var eDate = element.attr('endDate')
//    //var dataValue = element.attr('dataValue');

//})

function GetAllTemplate() {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/GetEntityTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'entityType': currentEntityType },
        success: function (data) {
            if (data.IsValid) {
                var currPropDorpDown = '';
                for (var i = 0; i < data.data.length; i++) {
                    currPropDorpDown += '<option value="' + data.data[i].Ent_temp_id + '">' + data.data[i].Prop_name + '</option>';
                }
                $('#changeProp').html(currPropDorpDown);
            }
        }, error: function (ex) { }
    });
}

function saveData() {

    var newEntityTmpDtl = []
    newEntityTmpDtl.push({
        Ent_Dtl_ID: 0,
        Ent_Temp_ID: $('#changeProp').find(":selected").val(),
        Ent_Value: $('#dataValue').val(),
        Start_Date: $('.updateStartDatepicker').val(),
        End_Date: $('.updateEndDatepicker').val()
    })

    var newEntityHDR = [];
    newEntityHDR.push({
        ENT_TYPE: currentEntityType,
        ENT_NAME: currentEntityName,
        ENT_ID: currentEntityID
    })


    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/SaveEntityHDRTempData',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: JSON.stringify({ 'entityHDR': JSON.stringify(newEntityHDR), 'entityTmpDtl': JSON.stringify(newEntityTmpDtl) }),
        success: function (data) {
            if (data.IsValid) {
                $('#editEntityEquipment').modal('hide');
                $('#calendarControlModel').modal('hide');
                $("#entityHDR > tbody").find("[value='" + ccEntityID + "']").parent().trigger('click');
                $('#editTemplate').trigger('click');
                setTimeout(callFunction, 500)
            }
            else {
                alert(data.data)
            }
        }, error: function (ex) { }
    });
}