using InventoryTracker_WebApp.Domain.Entity;
using InventoryTracker_WebApp.Models;
using Microsoft.Office.Interop.Excel;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
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

        #region Entity Template
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
        public string GetEntityHeaderfromEntityEquipment(string searchString, int startIndex, int endIndex,string startDate)
        {
            List<EntityHeader> entityHeaders = _entityRepository.GetEntityHeaderfromEntityEquipment(searchString,startIndex,endIndex,startDate);
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

        #endregion

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
                if (entityHeaders[0].ENT_ID == 0)
                {
                    bool isDuplicate = _entityRepository.CheckDuplicateEntityHDR(entityHeaders[0]);
                    if (isDuplicate)
                    {
                        return JsonConvert.SerializeObject(new { IsValid = false, data = "This entity header is already exist." });
                    }
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

        #region Entity Export - Import

        public FileResult Export(string startDate)
        {
            string path = string.Empty;
            try
            {
                var entity = _entityRepository.ExportEntity(startDate);

                Application application = new Application();
                Workbook workbook = application.Workbooks.Add(Missing.Value);
                Worksheet worksheet = workbook.ActiveSheet;
                worksheet.Cells[1,2] = "Start Date:";
                worksheet.Cells[1,3] = startDate;
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                int i = 2;

                DirectoryInfo di = new DirectoryInfo(path);

                foreach (FileInfo file in di.GetFiles())
                {
                    file.Delete();
                }
                path += @"\Entity.xls";
                foreach (var e in entity)
                {
                    int j = 1;
                    foreach (var item in e)
                    {
                        if (i == 2)
                        {
                            worksheet.Cells[i, j] = item.Key;
                        }
                        else
                        {
                            worksheet.Cells[i,j] = item.Value;
                        }
                        j++;
                    }
                    i++;
                }

                workbook.SaveAs(path);
                workbook.Close();
                Marshal.ReleaseComObject(workbook);
            }
            catch(Exception e)
            {

            }
            byte[] fileBytes = System.IO.File.ReadAllBytes(path);
            return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, "Entity.xlsx");
        }
        #endregion
    }
}