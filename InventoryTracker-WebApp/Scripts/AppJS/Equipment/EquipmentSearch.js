
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

$(document).ready(function () {
    $('#selectedMenu').text($('#menuEquipSearch').text());
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
    }
    if (startIndexEntity == 0) {
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
                if ($('#searchEquipmentStr').val() == '' && startIndexEquip == 0) {
                    $("#equipHDR > tbody >  tr").remove();
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
    var searchString = $('#searchEquipmentStr').val().toLowerCase().trim();
    if (searchString != '') {
        if (previousequipsearch == searchString) {
            previousequipsearch = searchString;
            loadEquipmentHDR(searchString, false);
            return;
        }
        previousequipsearch = searchString;
        startIndexEquip = 0;
        endIndexEquip = 30;
        loadEquipmentHDR(searchString, true);
    } else {
        startIndexEquip = 0;
        endIndexEquip = 30;
        loadEquipmentHDR(searchString, false);
    } //$('#searchEquipmentStr').val().trim()
    //addEquipmentColumn();
    //$("#equipHDR tr").each(function (index) {
    //    if (index !== 0) {
    //        var row = $(this);
    //        var isHide = true;
    //        row.find('td').each(function () {
    //            if ($(this).text().toLowerCase().indexOf($('#searchEquipmentStr').val().toLowerCase().trim()) != -1 && $(this).css('display') != 'none') {
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


$('#newTemplate').click(function () {
    enabled();
    unitidEle.val("");
    equipTypeEle.val(0);
    vendorEle.val("");
    equipmentHDRID.val(0);
    var todayDate = (new Date()).toLocaleDateString().split('T')[0];
    $("#tblTemplateDtl > tbody >  tr").remove();
    $('.datepicker').datepicker({
        autoclose: true
    });
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
    if (!isExist) {
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
                    loadEquipmentHDR($('#searchEquipmentStr').val());
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

    disabled();
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


function loadTemplateDetails(equipID, startDate, unitID, equipmentType, vendor, element) {

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
    equipTypeEle.val(equipmentType);
    vendorEle.val(vendor);
    equipmentHDRID.val(equipID);
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
                        eqValue = '<a href="' + data.data[i].Eq_Value + '" target="_blank">' + data.data[i].Eq_Value + '</a>'
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
                    entityHeadersString += '<tr  style="cursor:pointer" onclick= showEntityDetails(this)><input type="hidden" value="' + data.entityHeaders[i].ENT_ID + '" /><td>' + data.entityHeaders[i].ENT_NAME + '</td><td>' + sDate + '</td><td>' + eDate + '</td></tr>';
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
                        loadEquipmentHDR($('#searchEquipmentStr').val().trim());
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