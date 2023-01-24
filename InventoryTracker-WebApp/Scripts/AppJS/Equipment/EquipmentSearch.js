
var currentDate = '';
var currentEquipID = 0;
//var equipmentTemplate = $('#equipmentTemplate');
//var equipTypeEle = $('#equipType');
//var vendorEle = $('#vendor');
//var unitidEle = $('#uID');
var equipmentHDRID = $('#equipHDRID');
var currentStartDate = '';
var currentUnitID = 0;
var currentEquipmentType = 0;
var currentVendor = '';
/*var isLoadTime = true;*/
var previousElement = '';
var entityModelBody = $('#entityModelBody');
var entityTempDTL = $('#entityTempDTL');
var vendorLblEle = $('#vendorLbl');
var unitidLblEle = $('#uIDLbl');
var dropDownVal = 0;
var ccEquipID = 0;
var ccUnitID = '';
var isDropDownChange = false;
var filterStr = '';

$(document).ready(function () {
    $('#selectedMenu').text($('#menuEquipSearch').text());
    $('#equipActive').remove();
    loadEquipmentHDR('', false);
    //    //loadEquipmentHDR();
    //    loadAllEquipTemp();
    //    //enabled();
    //    disabled()
    //    $('.datepicker').datepicker({
    //        autoclose: true
    //    }).on('change', function (e) {
    //        currentDate = this.value;
    //        if (isLoadTime) {
    //            isLoadTime = false;
    //            return;
    //        }
    //        loadTemplateDetails(currentEquipID, currentDate, currentUnitID, currentEquipmentType, currentVendor)
    //    }).datepicker('setDate', new Date());
})

function loadEquipmentHDR(searchString, searchflag) {
    if (searchflag == true) {
        equipsearchflag = true;
        $("#equipHDR > tbody > tr").remove();
        startIndexEquip = 0;
    }
    if (startIndexEquip == 0) {
        equipsearchflag = false;
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
                var equipmentString = '';
                var isaddEquipmentColumn = false;
                for (var i = 0; i < data.data.length; i++) {
                    equipmentString += '<tr style="cursor:pointer" onclick="loadTemplateDetails(' + data.data[i].EQUIP_ID + ',' + null + ',\'' + data.data[i].UNIT_ID + '\',\'' + data.data[i].EQUIP_TYPE + '\',\'' + data.data[i].VENDOR + '\',this)"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td>' + data.data[i].EQUIP_TYPE + '</td><td>' + data.data[i].VENDOR + '</td><td>' + data.data[i].UNIT_ID + '</td><td>' + data.data[i].ASSIGNED + '</td></tr>';
                }


                var tableHeadLength = $("#equipHDR > thead > tr >  th").length
                for (var th = 4; th <= tableHeadLength;) {
                    isaddEquipmentColumn = true;
                    $($("#equipHDR > thead > tr >  th")[th]).remove();
                    $("#equipHDR > tbody > tr").find("td:eq(" + th + ")").remove();
                    tableHeadLength = tableHeadLength - 1;
                }
                $("#equipHDR > tbody").append(equipmentString);
                if (isaddEquipmentColumn) {
                    addEquipmentColumn();
                }
            }
        }, error: function (ex) { }
    });
}

//function showEquipModel() {
//    equipmentTemplate.modal('show');
//}

//function loadAllEquipTemp() {
//    //var equipType = [];
//    $.ajax({
//        before: AddLoader(),
//        after: RemoveLoader(),
//        url: '/Equipment/GetEquipmentTemplate',
//        contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'GET',
//        async: false,
//        success: function (data) {
//            if (data.IsValid) {
//                var templateString = '';

//                for (var i = 0; i < data.uniquePropName.length; i++) {
//                    var propName = data.uniquePropName[i].Prop_Name.trim();
//                    //equipType.push(data.data[i].Equipment_Type.trim());
//                    templateString += '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="' + propName + '"> <label class="form-check-label" for="' + propName + '"> ' + propName + ' </label> </div>';
//                }
//                //$.unique(equipType);
//                var uniqueEquipType = "";
//                uniqueEquipType += "<option value='0' >Select equipment type</option>";
//                for (var j = 0; j < data.uniqueEquipmentTemplates.length; j++) {
//                    var equipType = data.uniqueEquipmentTemplates[j].Equipment_Type;
//                    uniqueEquipType += '<option value=' + equipType + ' >' + equipType + '</option>'
//                }
//                equipTypeEle.html(uniqueEquipType);
//                $('#modelBody').html(templateString);
//            }
//        }, error: function (ex) { }
//    });
//}

//function addEquipmentColumn() {
//    var tableHeader = '';
//    tableHeader += '<th scope="col">Equip. type</th><th scope="col">Vendor</th><th scope="col">Unit ID</th><th scope="col">Assigned</th>';
//    $('.form-check-input').each(function () {
//        if ($(this).is(':checked')) {
//            tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
//            $.ajax({
//                before: AddLoader(),
//                after: RemoveLoader(),
//                url: '/Equipment/EquipmentValueByPropName',
//                contentType: 'application/json; charset=utf-8',
//                dataType: 'json',
//                type: 'GET',
//                async: false,
//                data: { 'propName': $(this).attr('id') },
//                success: function (data) {
//                    $("#equipHDR > tbody >  tr").each(function () {
//                        $(this).find('td:last').after('<td></td>')
//                    })
//                    for (var i = 0; i < data.data.length; i++) {
//                        $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find('td:last').text(data.data[i].Eq_Value);
//                    }
//                },
//                error: function (ex) { }
//            });
//        }
//    })
//    $("#equipHDR > thead >  tr > th").remove();
//    $("#equipHDR > thead >  tr").append(tableHeader);
//    equipmentTemplate.modal('hide');
//}
function addEquipmentHeader() {
    //var searchString = $('#searchEquipmentStr').val().toLowerCase().trim();
    //if (searchString != '') {
    //    if (previousequipsearch == searchString) {
    //        previousequipsearch = searchString;
    //        loadEquipmentHDR(searchString, false);
    //        return;
    //    }
    //    previousequipsearch = searchString;
    //    startIndexEquip = 0;
    //    endIndexEquip = 30;
    //    loadEquipmentHDR(searchString, true);
    //} else {
    //    startIndexEquip = 0;
    //    endIndexEquip = 30;
    //    loadEquipmentHDR(searchString, false);
    //}

    startIndexEquip = 0;
    endIndexEquip = 30;
    loadEquipmentHDR($('#searchEquipmentStr').val());
    addEquipmentColumn();
    //$('#searchEquipmentStr').val().trim()
    //addEquipmentColumn();
    $("#equipHDR tr").each(function (index) {
        if (index !== 0) {
            var row = $(this);
            var isHide = true;
            row.find('td').each(function () {
                if ($(this).text().toLowerCase().indexOf($('#searchEquipmentStr').val().toLowerCase().trim()) != -1 && $(this).css('display') != 'none') {
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


$('#newTemplate').click(function () {
    currentEquipID = 0;
    currentUnitID = '';
    currentEquipmentType = '';
    currentVendor = '';

    enabled();
    unitidEle.val("").addClass('textBox-BackColor');
    equipTypeEle.val(0).addClass('textBox-BackColor');
    vendorEle.val("").addClass('textBox-BackColor');
    equipmentHDRID.val(0);
    $('#entityCC').attr('onclick', '').css('opacity', '0.4');
    unitidLblEle.attr('hidden', true);
    unitidLblEle.text('');
    unitidEle.attr('hidden', false);
    vendorLblEle.attr('hidden', true);
    vendorLblEle.text('');
    vendorEle.attr('hidden', false);


    var todayDate = (new Date()).toLocaleDateString().split('T')[0];
    $("#tblTemplateDtl > tbody >  tr").remove();
    bootStrapDropDown();
})

function saveHDRTemplateDtl() {
    var equipType = equipTypeEle.val().trim();
    var vendor = vendorEle.val().trim();
    var unitid = unitidEle.val().trim();
    var isExist = false;

    var alertText = 'Please enter ';
    var isPreVal = false;
    if (equipType == null || equipType == "" || equipType == 0) {
        alertText += "Equipment type";
        isPreVal = true;
    }
    if (vendor == null || vendor == "") {
        if (isPreVal) {
            alertText += ","
        }
        alertText += " Vendor ";
        isPreVal = true;
    }
    if (unitid == null || unitid == "") {
        if (isPreVal) {
            alertText += ","
        }
        alertText += " Unit ID";
        isPreVal = true;
    }
    if (alertText != '' && isPreVal) {
        alert(alertText + " !");
        return;
    }
    $('#equipHDR > tbody >  tr').each(function () {
        if ($(this).find("td:eq(0)").text().trim().toLowerCase() == equipType.toLowerCase() && $(this).find("td:eq(1)").text().trim().toLowerCase() == vendor.toLowerCase() && $(this).find("td:eq(2)").text().trim().toLowerCase() == unitid.toLowerCase()) {
            isExist = true;
            return;
        }
    })
    if (isExist == false || equipmentHDRID.val() > 0) {
        var equipmentHDR = [];
        equipmentHDR.push({
            EQUIP_TYPE: equipType,
            VENDOR: vendor,
            UNIT_ID: unitid,
            EQUIP_ID: equipmentHDRID.val()
        })

        var equipmentTmpDtl = [];
        var isStartGTEnd = false;
        $("#tblTemplateDtl > tbody >  tr").each(function () {
            var Equip_Dtl_ID = $(this).find('.equipDtlID').val();
            var Equip_Temp_ID = $(this).find('.equipTmpID').val();
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

            equipmentTmpDtl.push({
                Equip_Dtl_ID: Equip_Dtl_ID,
                Equip_Temp_ID: Equip_Temp_ID,
                Eq_Value: firsttd,
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
            url: '/Equipment/SaveEquipmentHDRTempData',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: JSON.stringify({ 'equipmentHDR': JSON.stringify(equipmentHDR), 'equipmentTmpDtl': JSON.stringify(equipmentTmpDtl) }),
            success: function (data) {
                if (data.IsValid) {
                    loadEquipmentHDR($('#searchEquipmentStr').val(), true);
                    $('#equipHDR > tbody >  tr:last').trigger('click');
                    addEquipmentColumn();
                }
                else {
                    alert(data.data)
                }
            }, error: function (ex) { }
        });
    }
    else {
        alert('This equipment header is already exist.')
    }
}

//$('#search').click(function () {
//    addEquipmentHeader()
//})

$('#editTemplate').click(function () {
    if (currentEquipID > 0) {
        unitidEle.addClass('textBox-BackColor');
        equipTypeEle.addClass('textBox-BackColor');
        vendorEle.addClass('textBox-BackColor');

        unitidLblEle.attr('hidden', true);
        unitidLblEle.text('');
        unitidEle.attr('hidden', false);
        vendorLblEle.attr('hidden', true);
        vendorLblEle.text('');
        vendorEle.attr('hidden', false);

        disabled();


        $('#entityCC').attr('onclick', 'openCC(\'' + currentUnitID + '\',' + currentEquipID + ')')
            .css('opacity', '1');;

        $("#tblTemplateDtl > tbody >  tr").each(function () {
            var firsttd = $(this).find("td:eq(1)");
            var secondtd = $(this).find("td:eq(2)");
            var thirdtd = $(this).find("td:eq(3)");
            firsttd.html("<input type='text' class='dropdown-control' style='width:100%' value='" + firsttd.text().trim() + "'>");
            secondtd.html("<input type='text' class='datepicker dropdown-control' value='" + secondtd.text().trim() + "'>");
            thirdtd.html("<input type='text' class='datepicker dropdown-control' value='" + thirdtd.text().trim() + "'>");
        });
        bootStrapDropDown();
    }
})


function loadTemplateDetails(equipID, startDate, unitID, equipmentType, vendor, element) {
    unitidEle.removeClass('textBox-BackColor').attr('hidden', true);
    equipTypeEle.removeClass('textBox-BackColor');
    vendorEle.removeClass('textBox-BackColor').attr('hidden', true);
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
    unitidEle.val(unitID);
    equipTypeEle.val(equipmentType.toUpperCase());
    vendorEle.val(vendor);
    equipmentHDRID.val(equipID);
    unitidLblEle.text(unitID);
    unitidLblEle.attr('hidden', false);
    vendorLblEle.text(vendor);
    vendorLblEle.attr('hidden', false);
    disabled();

    //$(element).find('td:eq(0)').text()
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentTemplateDetails',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'equipID': equipID != 0 ? equipID : currentEquipID, 'startDate': date },
        success: function (data) {
            if (data.IsValid) {
                var equipmentDetailString = '';
                for (var i = 0; i < data.data.length; i++) {
                    var startDate = data.data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].Start_Date);

                    var eqValue = '';
                    if (data.data[i].Datatype.toLowerCase() == 'hyperlink') {
                        eqValue = '<a href="https://' + data.data[i].Eq_Value + '" target="_blank">' + data.data[i].Eq_Value + '</a>'
                    }
                    else {
                        eqValue = data.data[i].Eq_Value;
                    }
                    var endDate = data.data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].End_Date);
                    equipmentDetailString += '<tr><input type="hidden" class="equipDtlID" value="' + data.data[i].Equip_Dtl_ID + '" /><input type="hidden" class="equipTmpID" value="' + data.data[i].Equip_Temp_ID + '" /><td>' + data.data[i].Prop_Name + '</td><td>' + eqValue + '</td><td>' + startDate + '</td><td>' + endDate + '</td></tr>';
                }
                $("#tblTemplateDtl > tbody >  tr").remove();
                $("#tblTemplateDtl > tbody").append(equipmentDetailString);

                var entityHeadersString = '';
                for (var i = 0; i < data.entityHeaders.length; i++) {
                    var sDate = data.entityHeaders[i].START_DATE == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.entityHeaders[i].START_DATE);
                    var eDate = data.entityHeaders[i].END_DATE == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.entityHeaders[i].END_DATE);
                    var mainDate = $('#mainDate').val();
                    var lightGreenClass = "";

                    if (new Date(mainDate) >= new Date(sDate) && new Date(mainDate) <= new Date(eDate)) {
                        lightGreenClass = "lightGreenCls";
                    }

                    entityHeadersString += '<tr  style="cursor:pointer" onclick= showEntityDetails(this) class="' + lightGreenClass + '"><input type="hidden" value="' + data.entityHeaders[i].ENT_ID + '" /><td>' + data.entityHeaders[i].ENT_NAME + '</td><td>' + sDate + '</td><td>' + eDate + '</td></tr>';
                }
                $("#tblEntityHistory > tbody >  tr").remove();
                $("#tblEntityHistory > tbody").append(entityHeadersString);

            }
        }, error: function (ex) { }
    });
    currentEquipID = equipID;
    currentDate = date;
    currentUnitID = unitID;
    currentEquipmentType = equipmentType;
    currentVendor = vendor;
}

var previousEntityElement = '';


function showEntityDetails(element) {
    $(previousEntityElement).css('background-color', 'white').css('color', 'black');
    $(element).css('background-color', '#96a6c3').css('color', 'white');
    previousEntityElement = element;

    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Entity/GetEntityTemplateDetails',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'entityID': $(element).find("input[type='hidden']").val() },
        success: function (data) {
            if (data.IsValid) {
                var entityTemplateString = '';
                entityTemplateString += '<table class="table" ><thead style="background-color: #4472c4; color: white; "><tr><th scope="col">Property Name</th><th scope="col">Data Value</th><th scope="col">Start Date</th><th scope="col">End Date</th></tr></thead><tbody>';

                for (var i = 0; i < data.data.length; i++) {
                    var entityValue = data.data[i].Ent_Value.trim();

                    var sDate = data.data[i].Start_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].Start_Date);
                    var eDate = data.data[i].End_Date == '0001-01-01T00:00:00' ? '' : getFormattedDate(data.data[i].End_Date);
                    entityTemplateString += '<tr><td>' + data.data[i].Prop_Name + '</td><td>' + entityValue + '</td><td>' + sDate + '</td><td>' + eDate + '</td>';
                }
                entityTemplateString += '</tbody></table>';
                entityModelBody.html(entityTemplateString);
                entityTempDTL.modal('show');
            }
        }, error: function (ex) { }
    });
}

$('#deleteTemplate').click(function () {
    if (previousElement == '') {
        alert('Please select Equipment type.')
    }
    else {
        if (confirm('Are you sure you want to delete this record?')) {
            $.ajax({
                before: AddLoader(),
                after: RemoveLoader(),
                url: '/Equipment/DeleteEquipmentHeader',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST',
                async: false,
                data: JSON.stringify({ 'equipID': $(previousElement).find('input[type="hidden"]').val() }),
                success: function (data) {
                    if (data.IsValid) {
                        loadEquipmentHDR($('#searchEquipmentStr').val().trim(), true);
                        addEquipmentColumn();
                        $('#newTemplate').trigger('click')
                    }
                }, error: function (ex) { }
            });
        }
    }
})

//function disabled() {
//    unitidEle.prop("disabled", true);
//    unitidEle.css('opacity', '0.5');
//    equipTypeEle.prop("disabled", true);
//    equipTypeEle.css('opacity', '0.5');
//    vendorEle.prop("disabled", true);
//    vendorEle.css('opacity', '0.5');
//}

//function addEquipmentColumn() {
//    var tableHeader = '';
//    tableHeader += '<th scope="col">Equip. type</th><th scope="col">Vendor</th><th scope="col">Unit ID</th><th scope="col">Assigned</th>';
//    $('#equipmentTemplateModelBody .form-check-input').each(function () {
//        if ($(this).is(':checked')) {
//            tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
//            $.ajax({
//                before: AddLoader(),
//                after: RemoveLoader(),
//                url: '/Equipment/EquipmentValueByPropName',
//                contentType: 'application/json; charset=utf-8',
//                dataType: 'json',
//                type: 'GET',
//                async: false,
//                data: { 'propName': $(this).attr('id') },
//                success: function (data) {
//                    $("#equipHDR > tbody >  tr").each(function () {
//                        $(this).find('td:last').after('<td></td>')
//                    })
//                    for (var i = 0; i < data.data.length; i++) {
//                        $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find('td:last').text(data.data[i].Eq_Value);
//                    }
//                },
//                error: function (ex) { }
//            });

//        }
//    })
//    $("#equipHDR > thead >  tr > th").remove();
//    $("#equipHDR > thead >  tr").append(tableHeader);
//    equipmentTemplate.modal('hide');
//}

function enabled() {
    unitidEle.prop("disabled", false);
    unitidEle.css('opacity', '1');
    equipTypeEle.prop("disabled", false);
    equipTypeEle.css('opacity', '1');
    vendorEle.prop("disabled", false);
    vendorEle.css('opacity', '1');
}

$('#equipType').change(function () {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'equipmentType': $(this).val() },
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';
                for (var i = 0; i < data.data.length; i++) {
                    templateString += "<tr><input type='hidden' class='equipDtlID' value='0' /> <input type='hidden' class='equipTmpID' value='" + data.data[i].Equip_Temp_ID + "'/><td>" + data.data[i].Prop_Name + "</td><td><input type='text' class='dropdown-control' style='width:100%' value=''> </td><td><input type='text' class='datepicker startdate dropdown-control' value=''></td><td><input type='text' class='datepicker enddate dropdown-control' value=''> </td></tr>";
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
    window.location = "/Equipment/Export?startDate=" + $('#mainDate').val() + "&searchString=" + $('#searchEquipmentStr').val().trim();
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
                url: '/Equipment/BulkImport',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    var newData = JSON.parse(data);
                    alert(newData.data);
                    if (newData.IsValid) {
                        $('#importExcel').modal('hide');
                        loadEquipmentHDR('', false);
                    }
                },
                error: function (e1, e2, e3) {
                }
            });
        }
        else {
            $.ajax({
                before: AddLoader(),
                after: RemoveLoader(),
                type: "POST",
                url: '/Equipment/Import',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    var newData = JSON.parse(data);
                    alert(newData.data);
                    if (newData.IsValid) {
                        $('#importExcel').modal('hide');
                        loadTemplateDetails(currentEquipID, currentDate, currentUnitID, currentEquipmentType, currentVendor)
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
    window.location.href = '/ExcelFiles/Equipment_Bulk_Import.xlsx';
}




nextPrevYear();

function openCC(unitID, equipID) {
    ccEquipID = equipID;
    ccUnitID = unitID;
    if (unitID != '') {
        ccUnitID = unitID;
    }

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

    $('#ccUnitID').attr('hidden', false).text(ccUnitID);

    var legendStr = '';
    filterStr = '<option value="0" selected>No Filter</option>';
    ccPropDetails = [];
    var equipmentTmpIDList = [];
    $("#tblTemplateDtl > tbody >  tr").each(function () {
        var zerotdText = $(this).find("td:eq(0)").text();
        var firstText = $(this).find("td:eq(1) > input").val();
        var secondtd = $(this).find("td:eq(2) > input").val();
        var thirdtd = $(this).find("td:eq(3) >  input").val();
        var secondtdDate = new Date(secondtd);
        var thirdtdDate = new Date(thirdtd);
        var equipTmpID = $(this).find('.equipTmpID').val();
        var equipDtlID = $(this).find('.equipDtlID').val();

        var color = getRandomColor();
        legendStr += '<tr data-start-date="' + secondtd + '" data-end-date="' + thirdtd + '" currDTLID="' + equipTmpID + '" dataValue="' + firstText + '" propName="' + zerotdText +'" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="Property Name: ' + zerotdText + '<br/> Start date: ' + secondtd + '<br/> End date: ' + thirdtd + '"><input type="hidden" value="' + equipTmpID + '"><td style="background-color:' + color + ' !important"></td><td>' + zerotdText + '</td></tr>';
        
        if (equipmentTmpIDList.filter(x => x.id == equipTmpID) == 0) {
            filterStr += '<option value=' + equipTmpID + '>' + zerotdText + '</option>';
            equipmentTmpIDList.push({
                id: equipTmpID
            })
        }

        ccPropDetails.push({
            tmpID: equipTmpID,
            propName: zerotdText,
            startDate: secondtd,
            endDate: thirdtd,
            color: color,
            dataValue: firstText,
            equipDtlID: equipDtlID
        })
        $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
            var currMonth = $(this).attr('data-month');
            var currYear = $(this).attr('data-year');
            var currDay = $(this).text()
            var currDate = new Date(currYear, currMonth, currDay);
            if (secondtdDate <= currDate && thirdtdDate >= currDate) {
                if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                    $(this).children()
                        .attr('data-start-date', secondtd)
                        .attr('data-end-date', thirdtd)
                        .attr('data-equip-id', equipmentHDRID.val())
                        .attr('onclick', "openEditPopup(this)")
                        .css('background-color', '\'' + color + '\'')
                        .attr('isBorderedBox', '0')
                        .attr('data-bs-toggle', 'tooltip')
                        .attr('data-bs-placement', 'bottom')
                        .attr('data-bs-title', 'Property Name: ' + zerotdText + '<br/> Data Value: ' + firstText)
                        .attr('data-bs-html', true)
                        .attr('propName', zerotdText)
                        .attr('dataValue', firstText)
                        .attr('equipDtlID', equipDtlID)
                        .attr('equipTmpID', equipTmpID);
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
    bindTooltip();
    $('.selectDrpDown').html(filterStr).val(dropDownVal);
    $('#calendarControlModel').modal('show').css('z-index', '1055');
    setTimeout(onChangeYear(), 500)
}


function onChangeYear() {
    $('#currentYear').text($('.ui-datepicker-year:first').text());
    filterFunction(dropDownVal);
}


function bindDate(filterVal = 0) {
    var year = $('#currentYear').text();
    $(".ui-datepicker-calendar > tbody > tr > td").each(function () { $(this).children().css('background-color', 'rgb(246, 246, 246)').css('border', 'none').attr('data-bs-toggle', '') });
    var currentYearData = ccPropDetails.filter(x => new Date(x.startDate).getFullYear() <= year && new Date(x.endDate).getFullYear() >= year);

    $('#tblLegend >  tbody >  tr').hide();

    if (filterVal > 0) {
        currentYearData = currentYearData.filter(x => x.tmpID == filterVal);
    }
    $(currentYearData).each(function () {
        var sDate = $(this)[0].startDate;
        var eDate = $(this)[0].endDate;
        var color = $(this)[0].color;
        var propName = $(this)[0].propName;
        var dataVal = $(this)[0].dataValue;
        var equipDtlID = $(this)[0].equipDtlID;
        var tmpID = $(this)[0].tmpID;


        $('#tblLegend >  tbody > tr > td').filter(function () {
            var newColor = $(this).css("background-color");
            return rgba2hex(newColor).toUpperCase() === color;
        }).parent().show();

        $(".ui-datepicker-calendar > tbody > tr > td").each(function () {
            var currMonth = $(this).attr('data-month');
            var currYear = $(this).attr('data-year');
            var currDay = $(this).text()
            var currDate = new Date(currYear, currMonth, currDay);
            if (new Date(sDate) <= currDate && new Date(eDate) >= currDate) {
                if ($(this).children().css('background-color') == 'rgb(246, 246, 246)') {
                    $(this).children()
                        .attr('data-start-date', sDate)
                        .attr('data-end-date', eDate)
                        .attr('data-equip-id', equipmentHDRID.val())
                        .attr('onclick', "openEditPopup(this)")
                        .css('background-color', '\'' + color + '\'')
                        .attr('isBorderedBox', '0')
                        .attr('data-bs-toggle', 'tooltip')
                        .attr('data-bs-placement', 'bottom')
                        .attr('data-bs-title', 'Property Name: ' + propName + '<br/> Data Value: ' + dataVal)
                        .attr('data-bs-html', true)
                        .attr('propName', propName)
                        .attr('dataValue', dataVal)
                        .attr('equipDtlID', equipDtlID)
                        .attr('equipTmpID', tmpID);
                }
                else {
                    $(this).children().css('border', '2px solid black')
                        .attr('isBorderedBox', '1');
                }
            }
        })
    })
    bindTooltip();
    spectrumColor();
}



function openEditPopup(element) {
    var sdate = $(element).attr('data-start-date');
    var edate = $(element).attr('data-end-date');
    var equipID = $(element).attr('data-equip-id');
    var propName = $(element).attr('propName');
    var dataValue = $(element).attr('dataValue');
    var equipDtlID = $(element).attr('equipDtlID');
    var isBorderedBoxVal = $(element).attr('isBorderedBox');
    var equipTmpID = $(element).attr('equipTmpID');
    $('#changeProp').attr('hidden', true);
    $('#saveData').attr('hidden', true);
    $('#updateData').attr('hidden', false);
    //if (isBorderedBoxVal == '1' || isDropDownChange) {
    //    //$('#changeProp').attr('hidden', false).html(filterStr).val(equipTmpID);
    //    //$($('#changeProp >  option')[0]).remove()
    //    // Neee to uncommit
    //    isDropDownChange = false;
    //}
    //else {
    //    $('#changeProp').attr('hidden', true)
    //}
    $('#currEntDTLID').val(equipDtlID);
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
    $("#equipHDR > tbody").find("[value='" + ccEquipID + "']").parent().trigger('click');
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
        url: '/Equipment/GetEquipmentTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'equipmentType': currentEquipmentType },
        success: function (data) {
            if (data.IsValid) {
                var currPropDorpDown = '';
                for (var i = 0; i < data.data.length; i++) {
                    currPropDorpDown += '<option value="' + data.data[i].Equip_Temp_ID + '">' + data.data[i].Prop_Name + '</option>';
                }
                $('#changeProp').html(currPropDorpDown);
            }
        }, error: function (ex) { }
    });
}

function saveData() {

    var newEquipmentHDR = [];
    newEquipmentHDR.push({
        EQUIP_TYPE: currentEquipmentType,
        VENDOR: currentVendor,
        UNIT_ID: currentUnitID,
        EQUIP_ID: currentEquipID
    })

    var newEquipmentTmpDtl = [];
    newEquipmentTmpDtl.push({
        Equip_Dtl_ID: 0,
        Equip_Temp_ID: $('#changeProp').find(":selected").val(),
        Eq_Value: $('#dataValue').val(),
        Start_Date: $('.updateStartDatepicker').val(),
        End_Date: $('.updateEndDatepicker').val()
    })


    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/SaveEquipmentHDRTempData',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: JSON.stringify({ 'equipmentHDR': JSON.stringify(newEquipmentHDR), 'equipmentTmpDtl': JSON.stringify(newEquipmentTmpDtl) }),
        success: function (data) {
            if (data.IsValid) {
                $('#editEntityEquipment').modal('hide');
                $('#calendarControlModel').modal('hide');
                $("#equipHDR > tbody").find("[value='" + ccEquipID + "']").parent().trigger('click');
                $('#editTemplate').trigger('click');
                setTimeout(callFunction, 500)
            }
            else {
                alert(data.data)
            }
        }, error: function (ex) { }
    });

}