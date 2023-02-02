$(document).ready(function () {
    loadEntity();
    $('#selectedMenu').text($('#menuEntTemp').text());
    $('#tblTemplateHDR > tbody').append('<tr><td>Entity Name</td><td>String</td></tr>')
})
function loadTemplate(entityType, currentLI) {
    $("#ul > li").removeClass('cls-selected-li');
    isFirstTimeEntEqu = true;
    if (currentLI != undefined) {
        $("#"+currentLI).addClass('cls-selected-li');
    }
    $.ajax({
        before: AddLoader(),
        complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
        url: '/Entity/GetEntityTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: { 'entityType': entityType },
        success: function (data) {
            if (data.IsValid) {
                var templateString = '';
                
                for (var i = 0; i < data.data.length; i++) {
                
                    templateString += '<tr><input type="hidden" value="' + data.data[i].Ent_temp_id + '"/><td> <label>' + data.data[i].Prop_name + '</label></td > <td><label>' + data.data[i].Datatype + '</label></td> <td><label>' + data.data[i].Sequence + '</label></td> <td> <svg style =" cursor: pointer " xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /> <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /> </svg> </td> </tr > ';
                }
                templateString += lastPlusRow;
                $("#tblTemplate > tbody > tr").remove();
                elementtblTemplateBody.append(templateString);
                elementTemplateName.text(entityType);
                $(".bi-trash , .bi-plus").click('');
                $(".bi-trash , .bi-plus").css('cursor', 'default');
            }
        }, error: function (ex) { }
    });
}

function loadEntity() {
    $.ajax({
        before: AddLoader(),
        complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
        url: '/Entity/GetEntityTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                var entityString = '';
                var entityTypeval ='';
                for (var i = 0; i < data.uniqueEntityTemplates.length; i++) {
                    if (i == 0) { entityTypeval = data.uniqueEntityTemplates[i].Ent_type }
                    entityString += '<li class="list-group-item entity" id="' + data.uniqueEntityTemplates[i].Ent_type + '" onclick="loadTemplate(\'' + data.uniqueEntityTemplates[i].Ent_type + '\',\'' + data.uniqueEntityTemplates[i].Ent_type + '\')">' + data.uniqueEntityTemplates[i].Ent_type + '</li>';
                }
                $("#ul > li").remove();
                $("#ul").append(entityString);
                if (data.uniqueEntityTemplates.length > 0) {
                    loadTemplate(data.uniqueEntityTemplates[0].Ent_type, entityTypeval);
                }
                else {
                    loadTemplate('');
                }
                disableSortable();
            }
        }, error: function (ex) { }
    });
}


function saveTemplate() {

    var entityTypeVal = $('#templateName >  input').val();
    if (elementTemplateName.text() == "" && entityTypeVal == "") {
        alert('Please enter entity type.');
        return;
    }

    var data = [];
    var entityType = elementTemplateName.text().trim() != '' ? elementTemplateName.text().trim() : entityTypeVal;

    $("#tblTemplate > tbody >  tr ").each(function () {
        data.push({
            Ent_temp_id: typeof $(this).find("input[type=hidden]").val() != 'undefined' ? $(this).find("input[type=hidden]").val() : 0,
            Ent_type: entityType,
            Prop_name: $(this).find("td:eq(0)").text().trim() != '' ? $(this).find("td:eq(0)").text().trim() : $(this).find("td:eq(0) > input").val(),
            Datatype: $(this).find("td:eq(1) > label").text().trim() != '' ? $(this).find("td:eq(1) > label").text().trim() : $(this).find("td:eq(1) #dataType").val(),
            Sequence: $(this).find("td:eq(2)").text().trim() != '' ? $(this).find("td:eq(2)").text().trim() : $(this).find("td:eq(2) > input").val()
        });
    })
    data.pop();
    if (data.length == 0) {
        alert('Please enter data into table.');
        return;
    }
    var isDuplicate = false;
    if (entityTypeVal != undefined) {
        $('#ul >  li').each(function () {
            if ($(this).text().trim().toLowerCase() == entityTypeVal.trim().toLowerCase()) {

                isDuplicate = true;
                return;
            }
        })
    }
    disableSortable();
    if (!isDuplicate) {
        entityTypeVal = data[0].Ent_type;
        $.ajax({
            before: AddLoader(),
            complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
            url: '/Entity/SaveEntityTemplate',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: JSON.stringify({ 'entityTemplate': JSON.stringify(data) }),
            success: function (data) {
                if (data.IsValid && data.data) {
                    alert('Template save successfully.')
                    loadEntity();
                    loadTemplate(entityType, entityTypeVal);
                }
            }, error: function (ex) { }
        });
    }
    else {
        alert('This entity template is already exist.')
    }
}



$('#newTemplate').click(function () {
    loadTemplate('');
    elementTemplateName.append('<input type="text" class="dropdown-control textBox-BackColor" id="templateName" />');
    addCursorFunc();
    isFirstTimeEntEqu = true;
})

deleteButton.click(function () {
    var templateName = elementTemplateName.text();
    if (templateName == "") {
        alert("Please select Entity");
        return;
    }
    if (confirm("Are you sure you want to delete Entity ?")) {
        $.ajax({
            before: AddLoader(),
            complete: function () {setTimeout(function () {RemoveLoader();}, 500);},
            url: '/Entity/DeleteEntity',
            data: JSON.stringify({ 'entityType': templateName }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            async: false,
            success: function (data) {
                if (data.IsValid && data.data) {
                    alert('Entity and template deleted successfully.')
                    loadEntity();
                }
            }, error: function (ex) { }
        });
    }
})

$('#editTemplate').click(function () {
    editTemplate('Entity.');
})



function importExcel() {
    if ($('#file').val().trim() == '') {
        alert('Please select file.')
        return;
    }
    else {
        BulkImportTemplate(true);
    }
}

function sampleFileDownload() {
    $("#bulkImport").popover('hide');
    window.location.href = '/ExcelFiles/Entity_Template.xlsx';
}