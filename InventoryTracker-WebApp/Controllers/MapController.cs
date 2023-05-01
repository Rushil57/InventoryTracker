using InventoryTracker_WebApp.Domain.Entity;
using InventoryTracker_WebApp.Domain.Equipment;
using InventoryTracker_WebApp.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    public class MapController : Controller
    {

        private readonly IEntityRepository _entityRepository;
        private readonly IEquipmentRepository _equipmentRepository;

        public MapController(IEntityRepository entityRepository,IEquipmentRepository equipmentRepository)
        {
            this._entityRepository = entityRepository;
            this._equipmentRepository = equipmentRepository;
        }
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public string GetEntityLatLong()
        {
            List<EntityDetail> entityLatLong = _entityRepository.GetEntityTemplateDetails(0, string.Empty).Where(x => x.Prop_Name.Trim().ToLower() == "latitude" || x.Prop_Name.Trim().ToLower() == "longitude").OrderBy(x => x.Start_Date).OrderBy(x => x.End_Date).OrderBy(x => x.Ent_ID).ToList();
            return JsonConvert.SerializeObject(new { IsValid = true, entityLatLong = entityLatLong });
        }

        public string GetEntityEquipmentData()
        {
            var entityNumericPropValue = _entityRepository.GetEntityNumericProp();
            var entityNumericProp = entityNumericPropValue.Select(x => new EntityTemplate
            {
                Ent_type = x.Ent_type,
                Prop_name = x.Prop_name
            }).GroupBy(x => new
            {
                x.Ent_type,
                x.Prop_name
            }).Select(x => new EntityTemplate
            {
                Ent_type = x.Key.Ent_type,
                Prop_name = x.Key.Prop_name
            }).ToList();

            var equipNumericPropValue = _equipmentRepository.GetEquipmentNumericProp();
            var equipNumericProp = equipNumericPropValue.Select(x => new MapDetail
            {
                EQUIP_TYPE = x.EQUIP_TYPE,
                Prop_Name = x.Prop_Name 
            }).GroupBy(x => new
            {
                x.EQUIP_TYPE,
                x.Prop_Name
            }).Select(x => new MapDetail
            {
                EQUIP_TYPE = x.Key.EQUIP_TYPE,
                Prop_Name = x.Key.Prop_Name
            }).ToList();

            var equipNullNumericProp = _equipmentRepository.GetEquipmentNullNumericProp();

            var getAllEnEqAss = _entityRepository.GetAllEntityEquipmentAssignment();
            var uniqueEnEqAss = getAllEnEqAss.Select(x => new MapDetail
            {
                ENT_TYPE = x.ENT_TYPE,
                EQUIP_TYPE = x.EQUIP_TYPE
            }).GroupBy(x => new
            {
                x.ENT_TYPE,
                x.EQUIP_TYPE
            }).Select(x => new MapDetail
            {
                ENT_TYPE = x.Key.ENT_TYPE,
                EQUIP_TYPE = x.Key.EQUIP_TYPE
            }).ToList();

            return JsonConvert.SerializeObject(new { IsValid = true, entityNumericProp = entityNumericProp, entityNumericPropValue = entityNumericPropValue, equipNumericPropValue= equipNumericPropValue, equipNumericProp= equipNumericProp, getAllEnEqAss= getAllEnEqAss, uniqueEnEqAss = uniqueEnEqAss, equipNullNumericProp = equipNullNumericProp });

        }
    }
}