//var equipTypeEle = $('#equipType');
/*var equipmentTemplate = $('#equipmentTemplate');*/
var isLoadTime = true;
var vendorEle = $('#vendor');
var unitidEle = $('#uID');

$(document).ready(function () {
    //loadEquipmentHDR();
    loadAllEquipTemp();
    //enabled();
    disabled()
    $('.datepicker').datepicker({
        autoclose: true
    }).on('change', function (e) {
        currentDate = this.value;
        if (isLoadTime) {
            isLoadTime = false;
            return;
        }
        if (typeof (loadTemplateDetails) != 'undefined') {
            loadTemplateDetails(currentEquipID, currentDate, currentUnitID, currentEquipmentType, currentVendor)
        }
        else {
            loadEntityHDR('');
            addEntityHeader();
        }
    }).datepicker('setDate', new Date());
})

//function loadEquipmentHDR(searchString) {
//    $.ajax({
//        before: AddLoader(),
//        after: RemoveLoader(),
//        url: '/Equipment/GetEquipmentHeaders',
//        contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'GET',
//        async: false,
//        data: { 'searchString': searchString },
//        success: function (data) {
//            if (data.IsValid) {
//                var equipmentString = '';
//                for (var i = 0; i < data.data.length; i++) {
//                    equipmentString += '<tr style="cursor:pointer" onclick="loadTemplateDetails(' + data.data[i].EQUIP_ID + ',' + null + ',\'' + data.data[i].UNIT_ID + '\',\'' + data.data[i].EQUIP_TYPE + '\',\'' + data.data[i].VENDOR + '\',this)"><input type="hidden" value="' + data.data[i].EQUIP_ID + '"/><td>' + data.data[i].EQUIP_TYPE + '</td><td>' + data.data[i].VENDOR + '</td><td>' + data.data[i].UNIT_ID + '</td><td>' + data.data[i].ASSIGNED + '</td></tr>';
//                }
//                $("#equipHDR > tbody >  tr").remove();
//                $("#equipHDR > tbody").append(equipmentString);
//            }
//        }, error: function (ex) { }
//    });
//}

$('#search').click(function () {
    addEquipmentHeader()
})

//function addEquipmentHeader() {
//    loadEquipmentHDR(''); //$('#searchEquipmentStr').val().trim()
//    addEquipmentColumn();
//    $("#equipHDR tr").each(function (index) {
//        if (index !== 0) {
//            var row = $(this);
//            var isHide = true;
//            row.find('td').each(function () {
//                if ($(this).text().toLowerCase().indexOf($('#searchEquipmentStr').val().toLowerCase().trim()) != -1) {
//                    isHide = false;
//                    return;
//                }
//            })
//            if (isHide) {
//                row.hide();
//            }
//            else {
//                row.show();
//            }
//        }
//    });
//}




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
//                $('#equipmentTemplateModelBody').html(templateString);
//            }
//        }, error: function (ex) { }
//    });
//}


function addEquipmentColumn() {
    var tableHeader = '';
    //tableHeader += '<th scope="col">Equip. type</th><th scope="col">Vendor</th><th scope="col">Unit ID</th><th scope="col">Assigned</th>';
    $('#equipmentTemplateModelBody .form-check-input').each(function () {
        if ($(this).is(':checked')) {
            var isPresent = true;

            var id = $(this).attr('id');
            var th = 0;
            $("#equipHDR th").each(function (index) {
                
                if ($(this).text().toLowerCase() == id.toLowerCase()) {
                    isPresent = false;
                    $('#equipHDR tbody tr').each(function (ind, el) {
                        $('td', el).eq(index).show();
                        
                    });
                    $.ajax({
                        url: '/Equipment/EquipmentValueByPropName',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        type: 'GET',
                        async: false,
                        data: { 'propName': id },
                        success: function (data) {
                            for (var i = 0; i < data.data.length; i++) {

                                $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find("td:eq(" + th + ")").text(data.data[i].Eq_Value);
                            }
                        },
                        error: function (ex) { }
                    });
                    $(this).show();
                    return false;
                }
                th = th + 1;
            });
            if (isPresent) {
                tableHeader += '<th scope="col">' + $(this).attr('id') + '</th>';
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
                            $(this).find('td:last').after('<td></td>')
                        })
                        for (var i = 0; i < data.data.length; i++) {
                            $("#equipHDR > tbody >  tr").find('input[value="' + data.data[i].Equip_ID + '"]').parent().find('td:last').text(data.data[i].Eq_Value);
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
                        $('td', el).eq(index).hide();
                    });
                    $(this).hide();
                }
            });
        }
    })
    //$("#equipHDR > thead >  tr > th").remove();
    $("#equipHDR > thead >  tr").append(tableHeader);
    equipmentTemplate.modal('hide');
}


function disabled() {
    unitidEle.prop("disabled", true);
    unitidEle.css('opacity', '0.5');
    equipTypeEle.prop("disabled", true);
    equipTypeEle.css('opacity', '0.5');
    vendorEle.prop("disabled", true);
    vendorEle.css('opacity', '0.5');
}
