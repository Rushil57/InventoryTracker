const features = [];
var entTypeWithColor = [];
var selectPoly;
var drawingLayer;
var polySelectedMapData = [];
var entityNumericProp, entityNumericPropValue;
var equipNumericPropValue, equipNumericProp;
var getAllEnEqAss, uniqueEnEqAss;
var currentDate = "";
var equipNullNumericProp;
var miniMaxSliderLastCall;
var miniMaxOpacitySliderLastCall;
var predefinedStyles = {
    'circles': new ol.style.Style({
        text: new ol.style.Text({
            font: 'normal ' + 30 + 'px FontAwesome',
            fill: new ol.style.Fill({ color: '#006688' }),
            stroke: new ol.style.Stroke({ color: "black", width: 1 }),
            //opacity: 0.2,
        })
    })
};

$(document).ready(function () {

    loadAllEntityEquipType();
    $('#mainDate').datepicker({
        autoclose: true
    }).on('changeDate changeMonth changeYear', function (e) {
        currentDate = this.value;
        highLightSpotOfEntityEquipAssign(currentDate)
    }).datepicker('setDate', new Date());
    $('#selectedMenu').text($('#menuMap').text());
    document.getElementById("defaultOpen").click();
})

function getLatLong() {
    $.ajax({
        before: AddLoader(),
        complete: function () { setTimeout(function () { RemoveLoader(); }, 500); },
        url: '/Map/GetEntityLatLong',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                for (var i = 0; i < data.entityLatLong.length; i = i + 2) {
                    var latVal = data.entityLatLong[i].Ent_Value;
                    var Ent_ID = data.entityLatLong[i].Ent_ID;
                    var Ent_type = data.entityLatLong[i].Ent_type;
                    var Ent_Dtl_ID = data.entityLatLong[i].Ent_Dtl_ID;

                    var longVal = data.entityLatLong.filter(x => x.Ent_ID == Ent_ID && x.Start_Date == data.entityLatLong[i].Start_Date && x.End_Date == data.entityLatLong[i].End_Date && x.Ent_Temp_ID != data.entityLatLong[i].Ent_Temp_ID)[0].Ent_Value;


                    if (latVal != null && latVal != "" && longVal != null && longVal != "") {
                        latVal = Number(latVal);
                        longVal = Number(longVal);
                        var ftr = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([
                                longVal, latVal
                            ])),
                            Ent_type: Ent_type,
                            Ent_Dtl_ID: Ent_Dtl_ID,
                            Ent_ID: Ent_ID
                        });

                        if (entTypeWithColor.length == 0 || entTypeWithColor.filter(x => x.Ent_type == data.entityLatLong[i].Ent_type).length == 0) {
                            var newColor = getRandomColor();
                            while (newColor == "#FF0000") {
                                newColor = getRandomColor();
                            }
                            entTypeWithColor.push({
                                Ent_type: data.entityLatLong[i].Ent_type,
                                color: newColor
                            });
                        }

                        features.push(ftr);
                    }
                }
            }
        }, error: function (ex) { }
    });
}
const viewport = document.getElementById('map');
function getMinZoom() {
    const width = viewport.clientWidth;
    return Math.ceil(Math.LOG2E * Math.log(width / 256));
}

const initialZoom = getMinZoom();

getLatLong();

// create the source and layer for random features
var vectorSource = new ol.source.Vector({
    features
});
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    //style: new ol.style.Style({
    //    image: new ol.style.Circle({
    //        radius: 5,
    //        fill: new ol.style.Fill({ color: getRandomColor() })
    //    })
    //})
});




var map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        vectorLayer
    ],
    target: 'map',
    view: new ol.View({
        center: [0, 0],
        minZoom: initialZoom,
        zoom: 2,
    }),
});

colorFeatureByEntityType();

function colorFeatureByEntityType() {
    var features = vectorLayer.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        var clr = entTypeWithColor.filter(x => x.Ent_type == features[i].N.Ent_type)[0];
        features[i].setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: clr.color })
            })
        }));
    }


}

window.addEventListener('resize', function () {
    const minZoom = getMinZoom();
    const view = map.getView();
    if (minZoom !== view.getMinZoom()) {
        view.setMinZoom(minZoom);
    }
});

$("#traybtn").click(function () {
    if ($(this).hasClass('tray-open')) {
        $(this).toggleClass('tray-open').toggleClass('tray-close');
    } else {
        $(this).toggleClass('tray-close').toggleClass('tray-open');
        $('.right-sidebar').removeAttr('style');
    }
    $('.right-sidebar').toggleClass('showTray');
    $('.traybtn-group').toggleClass('showTraybtns');
});

function openTool(evt, toolsName) {

    isDraw = false;
    removeDrawFeature();
    $('.right-sidebar .tabcontent button.active').removeClass('active');

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(toolsName).style.display = "block";
    evt.currentTarget.className += " active";
}

function removeDrawFeature() {
    if (selectedFeatures) {
        selectedFeatures = [];
    }
    map.removeInteraction(draw);
    polySelectedMapData = [];
}


$('.color-picker').spectrum({
    type: "color",
    showInput: true,
    showPalette: false,
    preferredFormat: "hex"
}).on('hide.spectrum', function (e, color) {
    if (color != null) {
        if ($(this).hasClass("cls-bubble-clr-pckr")) {
            ChangeBubbleColor(color);
        }
    }
});

function ChangeBubbleColor(color) {


    color = '' + color + '';

    var features = vectorLayer.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        features[i].setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: color })
            })
        }));
    }
    //map.removeLayer(vectorLayer[0]);
    //vectorLayer = new ol.layer.Vector({
    //    source: vectorSource,
    //    style: new ol.style.Style({
    //        image: new ol.style.Circle({
    //            radius: 5,
    //            fill: new ol.style.Fill({ color: color })
    //        })
    //    })
    //});
    //map.addLayer(vectorLayer);
}


function loadAllEntityEquipType() {
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Entity/GetEntityTemplate',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                uniqueEntityType = "";
                uniqueEntityType += "<option value='0'> -- Select All -- </option>";
                for (var j = 0; j < data.uniqueEntityTemplates.length; j++) {
                    var entType = data.uniqueEntityTemplates[j].Ent_type;
                    uniqueEntityType += '<option value=' + entType.toUpperCase() + ' >' + entType + '</option>'
                }
                $('#selectEntityType').html(uniqueEntityType);
            }
        }, error: function (ex) { }
    });

    //$.ajax({
    //    before: AddLoader(),
    //    complete: function () {
    //        setTimeout(function () {
    //            RemoveLoader();
    //        }, 500);
    //    },
    //    url: '/Equipment/GetEquipmentTemplate',
    //    contentType: 'application/json; charset=utf-8',
    //    dataType: 'json',
    //    type: 'GET',
    //    async: false,
    //    success: function (data) {
    //        if (data.IsValid) {
    //            uniqueEquipType = "";
    //            uniqueEquipType += "<option value='0' >Select equipment type</option>";
    //            for (var j = 0; j < data.uniqueEquipmentTemplates.length; j++) {
    //                var equipType = data.uniqueEquipmentTemplates[j].Equipment_Type;
    //                uniqueEquipType += '<option value=' + equipType.toUpperCase() + ' >' + equipType + '</option>'
    //            }
    //            $('#selectEquipType').html(uniqueEquipType);
    //            $('#DBCatAttrib').html(uniqueEquipType);
    //            $('#coolorby').html(uniqueEquipType);
    //        }
    //    }, error: function (ex) { }
    //});

    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Map/GetEntityEquipmentData',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            if (data.IsValid) {
                entityNumericProp = data.entityNumericProp;
                entityNumericPropValue = data.entityNumericPropValue;
                equipNumericPropValue = data.equipNumericPropValue;
                equipNumericProp = data.equipNumericProp;
                getAllEnEqAss = data.getAllEnEqAss;
                uniqueEnEqAss = data.uniqueEnEqAss;
                equipNullNumericProp = data.equipNullNumericProp;
            }
        }, error: function (ex) { }
    });
}


$('#selectEntityType').change(function () {
    colorFeatureByEntityType();
    var selectedDropDown = $('#selectEntityType :selected');
    var selectedDropDownVal = selectedDropDown.val();
    var selectedDropDownText = selectedDropDown.text();
    var selectEntityTypeProp = $('#selectEntityTypeProp');
    var entityTypePropVal = '';

    var assignedEquipment = uniqueEnEqAss.filter(x => x.ENT_TYPE == selectedDropDownText);
    uniqueEquipType = "";
    uniqueEquipType += "<option value='0' > -- Select -- </option>";
    for (var k = 0; k < assignedEquipment.length; k++) {
        var equipType = assignedEquipment[k].EQUIP_TYPE;
        uniqueEquipType += '<option value=' + equipType.toUpperCase() + ' >' + equipType + '</option>'
    }
    $('#selectEquipType').html(uniqueEquipType);

    selectEntityTypeProp.html('');
    $('#multiSelectEquProp').multiselect()
    $('#multiSelectEquProp').multiselect('destroy').html('');
    //$('#countLbl').text(0);
    //$('#sumLbl').text(0);
    //$('#maxLbl').text(0);
    //$('#minLbl').text(0);
    //$('#avgLbl').text(0);

    if (selectedDropDownText != '' && selectedDropDownText != null && selectedDropDownVal != "0") {
        selectEntityTypeProp.html('');
        var newEntityNumericProp = entityNumericProp.filter(x => x.Ent_type == selectedDropDownText);
        for (var i = 0; i < newEntityNumericProp.length; i++) {
            entityTypePropVal += '<option>' + newEntityNumericProp[i].Prop_name + '</option>';
        }
        selectEntityTypeProp.html(entityTypePropVal);

        var features = vectorLayer.getSource().getFeatures();
        for (var i = 0; i < features.length; i++) {
            if ($('#selectEntityType').val() != features[i].N.Ent_type) {
                features[i].setStyle(new ol.style.Style({}));
            }   
        }
    }
})

$('#selectEquipType').change(function () {
    var selectedDropDown = $('#selectEquipType :selected');
    var selectedDropDownText = selectedDropDown.text();
    var selectedDropDownVal = selectedDropDown.val();
    var selectEquipTypeProp = $('#selectEquipTypeProp');
    var equipTypePropVal = '';

    selectEquipTypeProp.html('');
    $('#countLbl').text(0);
    $('#sumLbl').text(0);
    $('#maxLbl').text(0);
    $('#minLbl').text(0);
    $('#avgLbl').text(0);
    $('#nullLbl').text(0);
    if (selectedDropDownText != '' && selectedDropDownText != null && selectedDropDownVal != "0") {
        var newEquipNumericProp = equipNumericProp.filter(x => x.Equipment_Type == selectedDropDownText);
        for (var i = 0; i < newEquipNumericProp.length; i++) {
            var propName = newEquipNumericProp[i].Prop_Name;
            var currPropList = equipNumericPropValue.filter(x => x.Prop_Name == propName && x.Equipment_Type == selectedDropDownText).length;
            equipTypePropVal += '<option value="' + propName + '"> ' + propName + ' (' + currPropList +')</option>';
        }
        selectEquipTypeProp.html(equipTypePropVal);

        var noneAddedtoOption = '<option>None</option>'
        $('#DBCatAttrib').html(noneAddedtoOption + equipTypePropVal);
        $('#coolorby').html(noneAddedtoOption + equipTypePropVal);
        $('#multiSelectEquProp').html(equipTypePropVal);
        $('#multiSelectEquProp').multiselect({
            buttonWidth: 265,  
            checkAll: function (element) {
                setDbAttrSortabelRows(true)
            },
            uncheckAll: function (element) {
                setDbAttrSortabelRows(false);
            },
            click: function (event, ui) {
                setDbAttrSortabelRows(false, ui.value, ui.checked);
            },
        });
        $("#ddl_dbAttributes").append(equipTypePropVal);

    }
    else {
        $('#multiSelectEquProp').multiselect('destroy').html('');
    }
})

$('#selectEquipTypeProp').change(function () {
    var selectedProp = $('#selectEquipTypeProp :selected').text();
    selectedProp = selectedProp.substring(1, selectedProp.indexOf('(') - 1);
    var selectedDropDown = $('#selectEquipType :selected');
    var selectedDropDownText = selectedDropDown.text();
    var currPropList = equipNumericPropValue.filter(x => x.Prop_Name == selectedProp && x.Equipment_Type == selectedDropDownText);
    var currPropCount = currPropList.length;
    var currPropSum = 0;
    var maxProp = 0;
    var minProp = 0;
    var isFirstMax = true;
    var isFirstMin = true;
    for (var i = 0; i < currPropList.length; i++) {
        var num = parseFloat(currPropList[i].Eq_Value);
        currPropSum += num;
        if (num > maxProp || isFirstMax) {
            maxProp = num;
            isFirstMax = false;
        }
        if (num < minProp || isFirstMin) {
            minProp = num;
            isFirstMin = false;
        }
    }
    var currPorpAvg = 0;
    if (currPropCount > 0 && currPropSum > 0) {
        currPorpAvg = currPropSum / currPropCount;
    }
    $('#countLbl').text(currPropCount);
    $('#sumLbl').text(currPropSum.toFixed(2));
    $('#maxLbl').text(maxProp);
    $('#minLbl').text(minProp);
    $('#avgLbl').text(currPorpAvg.toFixed(2));

    var currNullPropList = equipNullNumericProp.filter(x => x.Prop_Name == selectedProp && x.Equipment_Type == selectedDropDownText);
    $('#nullLbl').text(currNullPropList.length);
})

//$('#selectEntityTypeProp').change(function () {
//    var selectedProp = $('#selectEntityTypeProp :selected').text();
//    var selectedDropDown = $('#selectEntityType :selected');
//    var selectedDropDownText = selectedDropDown.text();
//    var currPropList = entityNumericPropValue.filter(x => x.Prop_name == selectedProp && x.Ent_type == selectedDropDownText);
//    var currPropCount = currPropList.length;
//    var currPropSum = 0;
//    var maxProp = 0;
//    var minProp = 0;
//    var isFirstMax = true;
//    var isFirstMin = true;

//    for (var i = 0; i < currPropList.length; i++) {
//        var num = Number(currPropList[i].Ent_Value);
//        currPropSum += num;
//        if (num > maxProp || isFirstMax) {
//            maxProp = num;
//            isFirstMax = false;
//        }
//        if (num < minProp || isFirstMin) {
//            minProp = num;
//            isFirstMin = false;
//        }
//    }
//    var currPorpAvg = 0;
//    if (currPropCount > 0 && currPropSum > 0) {
//        currPorpAvg = currPropSum / currPropCount;
//    }
//    $('#countLbl').text(currPropCount);
//    $('#sumLbl').text(currPropSum);
//    $('#maxLbl').text(maxProp);
//    $('#minLbl').text(minProp);
//    $('#avgLbl').text(currPorpAvg);
//})

$("#btn_draw_polygon").click(function () {

    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        removeDrawFeature();
        isDraw = false;
    }
    else {
        isDraw = true;
        $('.right-sidebar .tabcontent button.active').removeClass('active');
        $(this).addClass('active');
        $("#btn_Measure_distance").css("background-color", "#222222");
        mapInActivation();
        activationToggle = 0;
        InitDrawFeature();
        if (selectPoly) {
            selectPoly.setActive(false);
        }
    }
});


function mapInActivation() {

    mapActivationId = 1;
    //map.getLayers().getArray()
    //    .filter(layer => layer.values_.name === 'LinesLayer' || layer.values_.name === "PointLayer")
    //    .forEach(layer => map.removeLayer(layer));

    //map.getOverlays().getArray()
    //    .filter(layer => layer.options.name === 'tooltipOverlay')
    //    .forEach(layer => map.removeOverlay(layer));
}


var selectedFeatures;
var draw;
function InitDrawFeature() {
    try {
        // Drawing feature start

        /* Add drawing vector source */
        drawingSource = new ol.source.Vector({
            useSpatialIndex: false
        });
        if (drawingLayer) {
            map.removeLayer(drawingLayer);
        }

        /* Add drawing layer */
        drawingLayer = new ol.layer.Vector({
            source: drawingSource
        });
        map.addLayer(drawingLayer);

        /* Declare interactions and listener globally so we can attach listeners to them later. */
        var selectedType = "Polygon";

        var listener;
        var fill = new ol.style.Fill({ color: "red" });
        var newStyle = new ol.style.Style({
            //stroke: stroke,
            fill: fill
        });
        var newLiteralStyle = predefinedStyles['triangles'];
        // 
        selectPoly = new ol.interaction.Select();
        //selectPoly = new Select({ style: newLiteralStyle });
        //selectPoly.on('select', function (evt) {
        //  var newStylez = new ol.style.Style({
        //    //stroke: stroke,
        //    fill: fill
        //  });
        //  var newLiteralStyle = predefinedStyles['triangles'];
        //  evt.selected.forEach(function (each) {
        //    each.setStyle(newLiteralStyle);
        //  });
        //  evt.deselected.forEach(function (each) {
        //    each.setStyle(null); // more likely you want to restore the original style
        //  });
        //});
        function addInteraction(selectedType) {
            draw = new ol.interaction.Draw({
                source: drawingSource,
                type: selectedType,
                //only draw when Ctrl is pressed.
                //condition: ol.events.condition.shiftKeyOnly
                //condition: platformModifierKeyOnly
            });

            /* add ol.collection to hold all selected features */

            map.addInteraction(selectPoly);
            selectedFeatures = selectPoly.getFeatures();


            draw.on('drawstart', function (event) {

                drawingSource.clear();
                selectPoly.setActive(false);
                //selectedFeatures.clear();
                //deSelectAllRow();
            }, this);


            draw.on('drawend', function (event) {

                //delaySelectActivate();
                //selectedFeatures.clear();
                var polygon = event.feature.getGeometry();
                var features = vectorLayer.getSource().getFeatures();
                //vectorLayer_Comp pointsLayer
                for (var i = 0; i < features.length; i++) {
                    if (polygon.intersectsExtent(features[i].getGeometry().getExtent())) {
                        features[i].setStyle(new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 5,
                                fill: new ol.style.Fill({ color: "red" })
                            })
                        }));
                        selectedFeatures.push(features[i]);

                    }
                }
                polySelectedMapData = [];
                setTimeout(function () {

                    drawingSource.clear();
                }, 500)
                //if (selectedFeatures.array_.length > 0) {
                //    UpdateFilterGrid(selectedFeatures);
                //}
            });

            map.addInteraction(draw);
        }
        addInteraction('Polygon');
        // Drawing interaction
    } catch (err) {
        alert(err)
    }
}

function ResetSelection() {
    if (selectedFeatures) {
        selectedFeatures = [];
    }
    colorFeatureByEntityType();
}

function InvertSelection() {
    colorFeatureByEntityType();
    setTimeout(function () {
        var newFeatures = [];

        //for (var i = 0; i < selectedFeatures.a.length; i++) {
        //    if (i == 0) {
        //        newFeatures = features.filter(x => x.N.Ent_Dtl_ID != selectedFeatures.a[i].N.Ent_Dtl_ID);
        //    }
        //    else {
        //        newFeatures = newFeatures.filter(x => x.N.Ent_Dtl_ID != selectedFeatures.a[i].N.Ent_Dtl_ID);
        //    }
        //}
        if (selectedFeatures.a != undefined) {
            newFeatures = features.filter(item => !selectedFeatures.a.includes(item));
        }
        else {
            newFeatures = features.filter(item => !selectedFeatures.includes(item))
        }
        if (newFeatures.length > 0) {
            selectedFeatures.a = [];
        }
        for (var i = 0; i < newFeatures.length; i++) {
            newFeatures[i].setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({ color: "red" })
                })
            }));
            selectedFeatures.a.push(newFeatures[i]);
        }
    }, 500);
}

function FilterSelection() {
    var newFeatures = [];
    if (selectedFeatures.a != undefined) {
        newFeatures = features.filter(item => !selectedFeatures.a.includes(item));
    }
    else {
        newFeatures = features.filter(item => !selectedFeatures.includes(item))
    }
    for (var i = 0; i < newFeatures.length; i++) {
        newFeatures[i].setStyle(new ol.style.Style({}));
    }
}

function ResetFilter() {
    var newFeatures = [];
    if (selectedFeatures.a != undefined) {
        newFeatures = features.filter(item => !selectedFeatures.a.includes(item));
    }
    else {
        newFeatures = features.filter(item => !selectedFeatures.includes(item))
    }
    for (var i = 0; i < newFeatures.length; i++) {
        var clr = entTypeWithColor.filter(x => x.Ent_type == features[i].N.Ent_type)[0];
        newFeatures[i].setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: clr.color })
            })
        }));
    }
}

//$("#drpMapType").change(function () {
//    MapViewChanged();
//});




//var styles = [
//    'RoadOnDemand',
//    'Aerial',
//    'AerialWithLabelsOnDemand'
//];
//var bingmapLayer = [];
//for (var ik = 0; ik < styles.length; ik++) {
//    var isMapVisible = false;
//    if (ik == 0) {
//        isMapVisible = true;
//    }
//    bingmapLayer.push(
//        new ol.layer.Tile({
//            visible: isMapVisible,
//            preload: Infinity,
//            source: new ol.source.BingMaps({
//                key: 'Aove9RiHxtBjJJDsF2CbjZCM3MW3k2URHnNC1mCJX8onG9Zi-z8_aNwHMcVOWl4z',
//                imagerySet: styles[ik]
//            }),
//        })
//    );
//}


//function MapViewChanged() {
//    var style = $("#drpMapType").val();
//    for (var i = 0, ii = bingmapLayer.length; i < ii; ++i) {
//        bingmapLayer[i].setVisible(styles[i] === style);
//    }
//}


$('#ShowHideBubble').on('click', function () {
    $('.show-bubble').toggleClass("hide-bubble");
    if ($('.innertxt').text() == "Hide Bubbles") {
        $('.innertxt').text("Show Bubbles")
        hideShowPointLayer(true);
    } else {
        $('.innertxt').text("Hide Bubbles");
        hideShowPointLayer(false);
    }
});


function hideShowPointLayer(isHide) {
    if (isHide) {
        map.removeLayer(vectorLayer);
    }
    else {
        vectorLayer.setZIndex(9999);
        map.addLayer(vectorLayer);
    }
}
function highLightSpotOfEntityEquipAssign(currentDate) {
    var assignedEntEqu = getAllEnEqAss.filter(x => new Date(x.START_DATE) <= new Date(currentDate) && new Date(x.END_DATE) >= new Date(currentDate));
    ResetSelection();
    for (var i = 0; i < assignedEntEqu.length; i++) {
        var newFeatures = features.filter(item => item.N.Ent_ID == assignedEntEqu[i].ENT_ID);
        if (newFeatures.length == 1) {
            newFeatures[0].setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({ color: "red" })
                })
            }));
        }
    }
}


function setDbAttrSortabelRows(isCheckedAll, value, isChecked) {
    var tbody = $("#dbAttrSortable tbody");
    if (value == undefined && isChecked == undefined) {
        tbody.html('');
        if (isCheckedAll) {
            var allDbAttr = $($('#multiSelectEquProp')[0]).find('option');
            var totalAllDbAttr = allDbAttr.length;
            if (totalAllDbAttr.length == 0) {
                if (!$(".tblSortableContainer").hasClass('d-none')) {
                    $(".tblSortableContainer").addClass('d-none')
                }
            } else {
                if ($(".tblSortableContainer").hasClass('d-none')) {
                    $(".tblSortableContainer").removeClass('d-none')
                }
            }
            allDbAttr.each(function () {
                var propName = $(this).text();
                propName = propName.substring(0, propName.indexOf('(') - 1);
                tbody.append('<tr class="ui-state-default">'
                    + '<td colspan="4"  data-colValue="' + propName + '">' + propName + '</td>'
                    + '</tr>');
            })
        }
        else if (!isCheckedAll) {
            if (!$(".tblSortableContainer").hasClass('d-none')) {
                $(".tblSortableContainer").addClass('d-none')
            }
            $('#dbAttrSortable > tbody').html('');
        }
    }
    else {
        if (isChecked) {
            if ($(".tblSortableContainer").hasClass('d-none')) {
                $(".tblSortableContainer").removeClass('d-none')
            }
            tbody.append('<tr class="ui-state-default">'
                + '<td colspan="4"  data-colValue="' + value + '">' + value + '</td>'
                + '</tr>');
        }
        else {
            tbody.find('[data-colValue="' + value + '"]').remove();
            if (tbody.find('td').length == 0) {
                if (!$(".tblSortableContainer").hasClass('d-none')) {
                    $(".tblSortableContainer").addClass('d-none')
                }
            }
        }
    }
}

$("#dbAttrSortable tbody").sortable({

    stop: function (e, ui) {
        //multiSelectValues = [];
        //var tds = $("#dbAttrSortable tbody td");
        //tds.each(function (e) {
        //    var sortColVal = this.dataset.colvalue
        //    multiSelectValues.push(sortColVal);
        //});

        //setLabelBasedOnDataAttribute();

    },
    receive: function (event, ui) {
        alert("receive")
    },
    deactivate: function () {
        $(this).css("background-color", "");
    }
});
$("#dbAttrSortable tbody").disableSelection();

$(".js-calculator_range").on("change input", function (e) {
    var rangeValue = $(this).val();
    $(this).parent().find(".js-calculator_text-input").val($(this).val());
    if ($(this).hasClass("cls-range-gbl-opacity")) {
        if (IsProjectWellStyleSelected) {
            if (miniMaxSliderLastCall != undefined) {
                clearTimeout(miniMaxSliderLastCall);
            }
            miniMaxSliderLastCall = setTimeout(function () {
                ChangeBubbleSize();
            }, 100);
        }
        else {
            if (miniMaxOpacitySliderLastCall != undefined) {
                clearTimeout(miniMaxOpacitySliderLastCall);
            }
            miniMaxOpacitySliderLastCall = setTimeout(function () {
                ChangeBubbleOpacity();
            }, 100);
        }
    }
    else if ($(this).hasClass("cls-range-min-size") || $(this).hasClass("cls-range-max-size")) {

        var currentMax = $(".cls-range-max-size").val();
        var currentMin = $(".cls-range-min-size").val();
        if ($(this).hasClass("cls-range-min-size")) {
            // Min Changed
            if (currentMin >= (currentMax - 1)) {
                try {
                    $(".cls-range-max-size").val(parseInt(currentMin) + 1).change();
                } catch (e1) {

                }

            }
        }
        else {
            // Max Changed
            if (currentMax <= (currentMin + 1)) {
                try {
                    $(".cls-range-min-size").val(parseInt(currentMax) - 1).change();
                } catch (e2) {

                }
            }
        }
        if (miniMaxSliderLastCall != undefined) {
            clearTimeout(miniMaxSliderLastCall);
        }
        miniMaxSliderLastCall = setTimeout(function () {
            ChangeBubbleSize();
        }, 600);
    }
});