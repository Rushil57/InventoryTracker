using InventoryTracker_WebApp.Domain.Equipment;
using InventoryTracker_WebApp.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    public class EquipmentController : Controller
    {
        private readonly IEquipmentRepository _equipmentRepository;

        public EquipmentController(IEquipmentRepository equipmentRepository)
        {
            this._equipmentRepository = equipmentRepository;
        }
        public ActionResult Index()
        {
            return View();
        }

        public string GetEquipmentTemplate(string equipmentType)
        {
            List<EquipmentTemplate> equipmentTemplates = _equipmentRepository.GetEquipmentTemplates(equipmentType);
            var uniqueEquipmentTemplates = equipmentTemplates.GroupBy(x => new
            {
                x.Equipment_Type
            }).Select(x => new EquipmentTemplate
            {
                Equipment_Type = x.Key.Equipment_Type
            }).ToList();

            var uniquePropName = equipmentTemplates.GroupBy(x => new
            {
                x.Prop_Name
            }).Select(x => new EquipmentTemplate
            {
                Prop_Name = x.Key.Prop_Name
            }).ToList();
            return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentTemplates, uniqueEquipmentTemplates = uniqueEquipmentTemplates, uniquePropName = uniquePropName });
        }
        public string GetEquipmentHeaders(string searchString,int startIndex , int endIndex)
        {
            List<EquipmentHeader> equipmentHeaders = _equipmentRepository.GetEquipmentHeaders(searchString, startIndex, endIndex).ToList();
            return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentHeaders });
        }

        [HttpPost]
        public string SaveEquipmentTemplate(string equipmentTemplate)
        {
            List<EquipmentTemplate> equipmentTemplates = JsonConvert.DeserializeObject<List<EquipmentTemplate>>(equipmentTemplate);
            if (equipmentTemplates.Count > 0)
            {
                bool isSaved = _equipmentRepository.SaveEquipmentTemplate(equipmentTemplates);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isSaved });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpPost]
        public string DeleteEquipment(string equipmentType)
        {
            if (!string.IsNullOrEmpty(equipmentType))
            {
                bool isDeleted = _equipmentRepository.DeleteEquipment(equipmentType);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isDeleted });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        #region Equipment Search
        public ActionResult EquipmentSearch()
        {
            return View();
        }

        [HttpPost]
        public string SaveEquipmentHDRTempData(string equipmentHDR, string equipmentTmpDtl)
        {
            if (!string.IsNullOrEmpty(equipmentHDR))
            {
                List<EquipmentHeader> equipmentHeaders = JsonConvert.DeserializeObject<List<EquipmentHeader>>(equipmentHDR);
                List<EquipmentDetail> equipmentDtl = JsonConvert.DeserializeObject<List<EquipmentDetail>>(equipmentTmpDtl);
                bool isInserted = _equipmentRepository.SaveEquipmentHDR(equipmentHeaders[0], equipmentDtl);
                return JsonConvert.SerializeObject(new { IsValid = true, data = true });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpGet]
        public string EquipmentValueByPropName(string propName)
        {
            if (!string.IsNullOrEmpty(propName))
            {
                List<EquipmentDetail> equipmentDetails = _equipmentRepository.EquipmentValueByPropName(propName);
                return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentDetails });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpGet]
        public string GetEquipmentTemplateDetails(int equipID, string startDate)
        {
            if (equipID > 0 || !string.IsNullOrWhiteSpace(startDate))
            {
                List<EquipmentDetail> equipmentTempDetails = _equipmentRepository.GetEquipmentTemplateDetails(equipID, startDate);
                List<EntityHeader> entityHeaders = _equipmentRepository.GetEquipmentEntityAssignment(equipID);
                return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentTempDetails, entityHeaders = entityHeaders });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpPost]
        public string DeleteEquipmentHeader(int equipID)
        {
            if (equipID > 0)
            {
                bool isDeleted = _equipmentRepository.DeleteEquipmentHeader(equipID);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isDeleted });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        #endregion

        #region Equipment Entity Assignment
        public ActionResult EquipmentEntityAssignment()
        {
            return View();
        }
        [HttpGet]
        public string GetEquipmentEntityAssignment(string startDate)
        {
            if (!string.IsNullOrEmpty(startDate))
            {
                var data  = _equipmentRepository.GetEquipmentEntityAssignment(startDate);
                return JsonConvert.SerializeObject(new { IsValid = true, data = data });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpPost]
        public string SaveEquipmentEntityAssignment(int entityID, int equipID, string startDate,int isDelete,string endDate)
        {
            if (equipID > 0 && entityID > 0)
            {
                bool isAssigned = _equipmentRepository.EquipmentEntityAssignment(entityID, equipID, startDate,isDelete,endDate);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isAssigned });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }
        #endregion
    }
}