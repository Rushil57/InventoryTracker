$(document).ready(function () {
    loadEquipment();
    $('#selectedMenu').text($('#menuEquipTemp').text());
    $('#tblTemplateHDR > tbody').append('<tr><td>Unit ID</td><td>String</td></tr><tr><td>Vendor</td><td>String</td></tr>')
})



function loadTemplate(equipmentType, currentLI) {
    isFirstTimeEntEqu = true;
    $("#ul > li").removeClass('cls-selected-li');
    if (currentLI != undefined) {
        $(currentLI).addClass('cls-selected-li');
    }
   
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'equipmentType': equipmentType },
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';
                for (var i = 0; i < data.data.length; i++) {
                    templateString += '<tr><input type="hidden" value="' + data.data[i].Equip_Temp_ID + '"/><td> <label>' + data.data[i].Prop_Name + '</label></td > <td><label>' + data.data[i].Datatype + '</label></td> <td><label>' + data.data[i].Sequence + '</label></td> <td> <svg style =" cursor: pointer " xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /> <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /> </svg> </td> </tr > ';
                }
                templateString += lastPlusRow;
                $("#tblTemplate > tbody > tr").remove();
                elementtblTemplateBody.append(templateString);
                elementTemplateName.text(equipmentType);
                $(".bi-trash , .bi-plus").click('');
                $(".bi-trash , .bi-plus").css('cursor', 'default');
                disableSortable();
            }
        }, error: function (ex) { }
    });
}

function loadEquipment() {
    $.ajax({
        before: AddLoader(),
        after: RemoveLoader(),
        url: '/Equipment/GetEquipmentTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                var equipmentString = '';
                for (var i = 0; i < data.uniqueEquipmentTemplates.length; i++) {
                    equipmentString += '<li class="list-group-item entity" onclick="loadTemplate(\'' + data.uniqueEquipmentTemplates[i].Equipment_Type + '\',this)">' + data.uniqueEquipmentTemplates[i].Equipment_Type + '</li>';
                }
                $("#ul > li").remove();
                $("#ul").append(equipmentString);
                if (data.data.length > 0) {
                    loadTemplate(data.data[0].Equipment_Type, $("#ul > li:eq(0)"));
                }
                else {
                    loadTemplate('');
                }
            }
        }, error: function (ex) { }
    });
}


function saveTemplate() {
    var equipmentTypeVal = $('#templateName >  input').val();

    if (elementTemplateName.text().trim() == "" && equipmentTypeVal == "") {
        alert('Please enter equipment type.');
        return;
    }

    var data = [];
    var equipmentType = elementTemplateName.text().trim() != '' ? elementTemplateName.text().trim() : equipmentTypeVal;
    $("#tblTemplate > tbody >  tr ").each(function () {
        data.push({
            Equip_Temp_ID: typeof $(this).find("input[type=hidden]").val() != 'undefined' ? $(this).find("input[type=hidden]").val() : 0,
            Prop_Name: $(this).find("td:eq(0)").text().trim() != '' ? $(this).find("td:eq(0)").text().trim() : $(this).find("td:eq(0) > input").val(),
            Datatype: $(this).find("td:eq(1) > label").text().trim() != '' ? $(this).find("td:eq(1) > label").text().trim() : $(this).find("td:eq(1) #dataType").val(),
            Sequence: $(this).find("td:eq(2)").text().trim() != '' ? $(this).find("td:eq(2)").text().trim() : $(this).find("td:eq(2) > input").val(),
            Equipment_Type: equipmentType
        });
    })
    data.pop();
    if (data.length == 0) {
        alert('Please enter data into table.');
        return;
    }
    var isDuplicate = false;
    if (equipmentTypeVal != undefined) {
        $('#ul >  li').each(function () {
            if ($(this).text().trim().toLowerCase() == equipmentTypeVal.trim().toLowerCase()) {
                isDuplicate = true;
                return;
            }
        })
    }

    disableSortable();
    if (!isDuplicate) {
        $.ajax({
            before: AddLoader(),
            after: RemoveLoader(),
            url: '/Equipment/SaveEquipmentTemplate',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: JSON.stringify({ 'equipmentTemplate': JSON.stringify(data) }),
            success: function (data) {
                if (data.IsValid && data.data) {
                    alert('Template save successfully.')
                    loadEquipment();
                    loadTemplate(equipmentType ,$("#ul > li:eq(0)"));
                }
            }, error: function (ex) {
            }
        });
    }
    else {
        alert('This equipment template is already exist.')
    }
}


$('#newTemplate').click(function () {
    loadTemplate('');
    elementTemplateName.append('<input class="dropdown-control textBox-BackColor" type="text" id="templateName" />');
    addCursorFunc();
    isFirstTimeEntEqu = true;
})

deleteButton.click(function () {
    var templateName = elementTemplateName.text();
    if (templateName == "") {
        alert("Please select equipment.");
        return;
    }
    if (confirm("Are you sure you want to delete Equipment ?")) {
        $.ajax({
            before: AddLoader(),
            after: RemoveLoader(),
            url: '/Equipment/DeleteEquipment',
            data: JSON.stringify({ 'equipmentType': templateName }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            async: false,
            success: function (data) {
                if (data.IsValid && data.data) {
                    alert('Equipment and template deleted successfully.')
                    loadEquipment();
                }
            }, error: function (ex) { }
        });
    }
})

$('#editTemplate').click(function () {
    editTemplate('Equipment.');
})


function importExcel() {
    if ($('#file').val().trim() == '') {
        alert('Please select file.')
        return;
    }
    else {
        BulkImportTemplate(false);
    }
}


function sampleFileDownload() {
    $("#bulkImport").popover('hide');
    window.location.href = '/ExcelFiles/Equipment_Template.xlsx';
}