﻿var entityName = $('#entityName');
var isLoadTime = true;
var tblHDR = ' <th scope="col">Entity type</th> <th scope="col">Entity name</th><th scope="col">Assigned</th>';
var isFirstRowTextBox = false;

$(document).ready(function () {
    loadAllEntityTemp();
    disabled()
    $('#mainDate').datepicker({
        autoclose: true
    }).on('changeDate changeMonth changeYear', function (e) {
        currentDate = this.value;
        if (isLoadTime) {
            isLoadTime = false;
            return;
        }
        if (typeof (loadTemplateDetails) != 'undefined') {
            loadTemplateDetails(currentEntityID, currentEntityType, currentEntityName, currentDate)
        }
        else {
            loadEquipmentHDR('',false);
            addEquipmentHeader();
            loadEntityHDR($('#searchEntityStr').val().toLowerCase().trim(), true)
        }
        currentUpdateAssignDate = currentDate;
    }).datepicker('setDate', new Date());
})

$('#search').click(function () {
    addEntityHeader()
})

function disabled() {
    entityType.prop("disabled", true);
    entityType.css('opacity', '0.5');
    entityName.prop("disabled", true);
    entityName.css('opacity', '0.5');
}