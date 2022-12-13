var entityName = $('#entityName');
var isLoadTime = true;
var tblHDR = ' <th scope="col">Entity type</th> <th scope="col">Entity name</th><th scope="col">Assigned</th>';

$(document).ready(function () {
    loadAllEntityTemp();
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
            loadTemplateDetails(currentEntityID, currentEntityType, currentEntityName, currentDate)
        }
        else {
            loadEquipmentHDR('');
            addEquipmentHeader();
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