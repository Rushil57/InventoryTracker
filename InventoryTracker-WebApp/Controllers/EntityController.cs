using InventoryTracker_WebApp.Domain.Entity;
using InventoryTracker_WebApp.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    public class EntityController : Controller
    {
        private readonly IEntityRepository _entityRepository;
        public EntityController(IEntityRepository entityRepository)
        {
            this._entityRepository = entityRepository;
        }
        public ActionResult Index()
        {
            return View();
        }

        public string GetEntityTemplate(string entityType)
        {
            List<EntityTemplate> entityTemplates = _entityRepository.GetEntityTemplates(entityType);

            var uniqueEntityTemplates = entityTemplates.GroupBy(x => new
            {
                x.Ent_type
            }).Select(x => new EntityTemplate
            {
                Ent_type = x.Key.Ent_type
            }).ToList();

            var uniquePropName = entityTemplates.GroupBy(x => new
            {
                x.Prop_name
            }).Select(x => new EntityTemplate
            {
                Prop_name = x.Key.Prop_name
            }).ToList();

            return JsonConvert.SerializeObject(new { IsValid = true, data = entityTemplates, uniqueEntityTemplates = uniqueEntityTemplates, uniquePropName = uniquePropName });
        }
        public string GetEntityHeaders(string searchString, int startIndex, int endIndex)
        {
            List<EntityHeader> entityHeaders = _entityRepository.GetEntityHeaders(searchString,startIndex,endIndex);
            return JsonConvert.SerializeObject(new { IsValid = true, data = entityHeaders });
        }
        public string GetEntityHeaderfromEntityEquipment(string searchString, int startIndex, int endIndex)
        {
            List<EntityHeader> entityHeaders = _entityRepository.GetEntityHeaderfromEntityEquipment(searchString,startIndex,endIndex);
            return JsonConvert.SerializeObject(new { IsValid = true, data = entityHeaders });
        }

        [HttpPost]
        public string SaveEntityTemplate(string entityTemplate)
        {
            List<EntityTemplate> entityTemplates = JsonConvert.DeserializeObject<List<EntityTemplate>>(entityTemplate);
            if (entityTemplates.Count > 0)
            {
                bool isSaved = _entityRepository.SaveEntityTemplate(entityTemplates);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isSaved });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpPost]
        public string DeleteEntity(string entityType)
        {
            if (!string.IsNullOrEmpty(entityType))
            {
                bool isDeleted = _entityRepository.DeleteEntityTemplates(entityType);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isDeleted });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpGet]
        public string GetEntityTemplateDetails(int entityID,string startDate)
        {
            if (entityID > 0)
            {
                List<EntityDetail> entityTempDetails = _entityRepository.GetEntityTemplateDetails(entityID,startDate);
                List<EquipmentHeader> equipmentHeaders = _entityRepository.GetEntityEquipmentAssignment(entityID);
                return JsonConvert.SerializeObject(new { IsValid = true, data = entityTempDetails,equipmentHeaders = equipmentHeaders });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }


        #region Entity Search

        public ActionResult EntitySearch()
        {
            return View();
        }
        [HttpGet]
        public string EntityValueByPropName(string propName)
        {
            if (!string.IsNullOrEmpty(propName))
            {
                List<EntityDetail> entityDetails =  _entityRepository.EntityValueByPropName(propName);
                return JsonConvert.SerializeObject(new { IsValid = true, data = entityDetails });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpPost]
        public string DeleteEntityHeader(int entityID)
        {
            if (entityID > 0)
            {
                bool isDeleted = _entityRepository.DeleteEntityHeader(entityID);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isDeleted });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpPost]
        public string SaveEntityHDRTempData(string entityHDR, string entityTmpDtl)
        {
            if (!string.IsNullOrEmpty(entityHDR))
            {
                List<EntityHeader> entityHeaders = JsonConvert.DeserializeObject<List<EntityHeader>>(entityHDR);
                List<EntityDetail> entityDtl = JsonConvert.DeserializeObject<List<EntityDetail>>(entityTmpDtl);
                bool isDuplicate = _entityRepository.CheckDuplicateEntityHDR(entityHeaders[0]);
                if (isDuplicate)
                {
                    return JsonConvert.SerializeObject(new { IsValid = false, data = "This entity header is already exist." });
                }
                bool isInserted = _entityRepository.SaveEntityHDR(entityHeaders[0], entityDtl);
                return JsonConvert.SerializeObject(new { IsValid = true, data = true });
            }
            return JsonConvert.SerializeObject(new { IsValid = false });
        }

        #endregion

        #region  Entity Equipment Assignment
        public ActionResult EntityEquipmentAssignment()
        {
            return View();
        }
        #endregion
    }
}