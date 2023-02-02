using DocumentFormat.OpenXml.Spreadsheet;
using InventoryTracker_WebApp.Domain.Entity;
using InventoryTracker_WebApp.Domain.Equipment;
using InventoryTracker_WebApp.Helpers;
using InventoryTracker_WebApp.Models;
using Newtonsoft.Json;
using SpreadsheetLight;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    [SessionTimeout]
    public class EntityController : Controller
    {
        private readonly IEntityRepository _entityRepository;
        private readonly IEquipmentRepository _equipmentRepository;

        public EntityController(IEntityRepository entityRepository, IEquipmentRepository equipmentRepository)
        {
            this._entityRepository = entityRepository;
            this._equipmentRepository = equipmentRepository;
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
            List<EntityHeader> entityHeaders = _entityRepository.GetEntityHeaders(searchString, startIndex, endIndex);
            return JsonConvert.SerializeObject(new { IsValid = true, data = entityHeaders });
        }
        public string GetEntityHeaderfromEntityEquipment(string searchString, int startIndex, int endIndex, string startDate)
        {
            List<EntityHeader> entityHeaders = _entityRepository.GetEntityHeaderfromEntityEquipment(searchString, startIndex, endIndex, startDate);
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
        public string GetEntityTemplateDetails(int entityID, string startDate)
        {
            if (entityID > 0)
            {
                List<EntityDetail> entityTempDetails = _entityRepository.GetEntityTemplateDetails(entityID, startDate);
                List<EntityDetail> AllEntityTemplateProp = _entityRepository.GetAllEntityTemplateProp(entityID);

                List<EquipmentHeader> equipmentHeaders = _entityRepository.GetEntityEquipmentAssignment(entityID);
                return JsonConvert.SerializeObject(new { IsValid = true, data = entityTempDetails, equipmentHeaders = equipmentHeaders, defaultentity = AllEntityTemplateProp });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpGet]
        public string GetAllEntityTemplateDetails()
        {
            List<EntityDetail> entTempDetails = _entityRepository.GetAllEntityTemplateDetails();
            return JsonConvert.SerializeObject(new { IsValid = true, data = entTempDetails });
        }

        [HttpPost]
        public string RemoveEntityEquipmentTemplateDetail(int deatailID, int isEntity)
        {
            try
            {
                if (deatailID > 0)
                {
                    var isDeleted = _entityRepository.RemoveEntityEquipmentTemplateDetail(deatailID, isEntity);
                    if (isDeleted)
                    {
                        return JsonConvert.SerializeObject(new { IsValid = true, data = "Data deleted successfully!" });
                    }
                }
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Data not deleted!" });
            }
            catch (Exception e)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Data not deleted!" });
            }
        }
        #endregion

        #region Entity Search

        public ActionResult EntitySearch()
        {
            return View();
        }
        [HttpGet]
        public string EntityValueByPropName(string propName, string date)
        {
            if (!string.IsNullOrEmpty(propName))
            {
                List<EntityDetail> entityDetails = _entityRepository.EntityValueByPropName(propName, date);
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
                if (!isInserted)
                {
                    return JsonConvert.SerializeObject(new { IsValid = true, data = "Value is already present on selected date range for this property." });
                }
                return JsonConvert.SerializeObject(new { IsValid = true, data = "Data save successfully!" });
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

        public FileResult Export(string startDate, string searchString)
        {
            MemoryStream ms = new MemoryStream();
            using (SLDocument sl = new SLDocument())
            {
                var entity = _entityRepository.ExportEntity(startDate, searchString);

                SLStyle sLStyle = new SLStyle();
                sLStyle.Protection.Locked = false;

                sLStyle.Fill.SetPattern(PatternValues.Solid, System.Drawing.Color.White, System.Drawing.Color.White);

                sLStyle.Border.LeftBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.LeftBorder.Color = System.Drawing.Color.Black;

                sLStyle.Border.RightBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.RightBorder.Color = System.Drawing.Color.Black;

                sLStyle.Border.BottomBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.BottomBorder.Color = System.Drawing.Color.Black;

                sLStyle.Border.TopBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.TopBorder.Color = System.Drawing.Color.Black;
                sLStyle.Font.Bold = false;

                SLSheetProtection sp = new SLSheetProtection();
                sp.AllowEditObjects = true;
                SLStyle sLStyleColor = new SLStyle();
                sLStyleColor.Fill.SetPattern(PatternValues.Solid, System.Drawing.Color.LightGray, System.Drawing.Color.LightGray);

                sLStyleColor.Font.Bold = true;

                sLStyleColor.Border.LeftBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.LeftBorder.Color = System.Drawing.Color.Black;

                sLStyleColor.Border.RightBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.RightBorder.Color = System.Drawing.Color.Black;

                sLStyleColor.Border.BottomBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.BottomBorder.Color = System.Drawing.Color.Black;

                sLStyleColor.Border.TopBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.TopBorder.Color = System.Drawing.Color.Black;

                sl.SetCellValue(1, 2, "Start Date:");
                sl.SetCellValue(1, 3, startDate);

                int i = 2;
                sl.SetRowStyle(1, sLStyleColor);
                sl.SetRowStyle(i + 1, sLStyleColor);
                sl.AutoFitColumn(1);
                int j = 0;
                foreach (var e in entity)
                {
                    j = 1;
                    sl.SetRowStyle(i, sLStyleColor);
                    sl.AutoFitColumn(j);
                    foreach (var item in e)
                    {
                        if (i == 2)
                        {
                            sl.SetCellValue(i, j, item.Key);
                            sl.SetCellValue((i + 1), j, item.Value == null ? "" : item.Value.ToString());
                            if (j != 1 && j != 2)
                            {
                                sl.RemoveCellStyle((i + 1), j);
                                sl.SetCellStyle((i + 1), j, sLStyle);
                            }
                        }
                        else
                        {
                            sl.SetCellValue(i, j, item.Value == null ? "" : item.Value.ToString());
                            if (j != 1 && j != 2)
                            {
                                sl.RemoveCellStyle(i, j);
                                sl.SetCellStyle(i, j, sLStyle);
                            }
                        }
                        j++;
                    }
                    if (i == 2)
                    {
                        i++;
                    }
                    i++;
                }
                sl.AutoFitColumn(1, j);
                sl.ProtectWorksheet(sp);
                sl.SaveAs(ms);
            }
            ms.Position = 0;

            return File(ms, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Entity.xlsx");
        }

        [HttpPost]
        public string Import(HttpPostedFileBase file)
        {

            string path = string.Empty;
            var fileExt = Path.GetExtension(file.FileName);
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            path += @"\ImportEntity" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);

            FileStream fs = new FileStream(path, FileMode.Open);
            try
            {
                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {
                    List<string> columnHeader = new List<string>();
                    using (SLDocument sl = new SLDocument())
                    {
                        
                        SLDocument sheet = new SLDocument(fs);
                        var startDate = (sheet.GetCellValueAsDateTime(1, 3));
                        SLWorksheetStatistics stats = sheet.GetWorksheetStatistics();
                        for (int i = 2; i <= stats.EndRowIndex; i++)
                        {
                            var headerCellValue = (sheet.GetCellValueAsString(i, 1));
                            if (headerCellValue.ToString() == null)
                            {
                                break;
                            }
                            else
                            {
                                List<string> values = new List<string>();
                                for (int j = 1; j <= stats.EndColumnIndex; j++)
                                {
                                    var cellValue = (sheet.GetCellValueAsString(i, j));
                                    if (i == 2)
                                    {
                                        if (cellValue != null)
                                        {
                                            columnHeader.Add(cellValue);
                                        }
                                        else
                                        {
                                            break;
                                        }
                                    }
                                    else
                                    {
                                        if (columnHeader.Count < j)
                                        {
                                            break;
                                        }
                                        var valueOFCell = cellValue == null ? "" : cellValue.ToString();
                                        values.Add(valueOFCell);
                                    }
                                }
                                if (i != 2)
                                {
                                    bool isUpdated = _entityRepository.UpdateTemplateDetails(startDate.ToShortDateString(), columnHeader, values);
                                }
                            }
                        }

                        fs.Close();
                    }
                    return JsonConvert.SerializeObject(new { IsValid = true, data = "File imported successfully." });
                }
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Issue occured when file is imported." });
            }
            catch (Exception e)
            {

                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message });
            }
            finally
            {
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
        }
        #endregion

        #region Bulk Import

        [HttpPost]
        public string BulkImport(HttpPostedFileBase file)
        {
            string path = string.Empty;
            bool isValidColHDR = true;
            var fileExt = Path.GetExtension(file.FileName);
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            path += @"\BulkImportEntity" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);
            FileStream fs = new FileStream(path, FileMode.Open);
            try
            {
                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {
                    List<string> columnHeader = new List<string>();
                    using (SLDocument sl = new SLDocument())
                    {
                        
                        SLDocument sheet = new SLDocument(fs);

                        SLWorksheetStatistics stats = sheet.GetWorksheetStatistics();
                        for (int i = 1; i <= stats.EndRowIndex; i++)
                        {
                            var headerCellValue = (sheet.GetCellValueAsString(i, 1));
                            if (headerCellValue.ToString() == null)
                            {
                                break;
                            }
                            else
                            {
                                List<string> values = new List<string>();
                                for (int j = 1; j <= stats.EndColumnIndex; j++)
                                {
                                    var cellValue = (sheet.GetCellValueAsString(i, j));
                                    if (i == 1)
                                    {
                                        if (!string.IsNullOrEmpty(cellValue))
                                        {
                                            columnHeader.Add(cellValue);
                                        }
                                        else
                                        {
                                            break;
                                        }
                                    }
                                    else
                                    {
                                        if (columnHeader.Count < j)
                                        {
                                            break;
                                        }
                                        var valueOFCell = "";
                                        if (columnHeader[j - 1] == "Start Date" || columnHeader[j - 1] == "End Date")
                                        {
                                            var cellValueOfDateTime = (sheet.GetCellValueAsDateTime(i, j));
                                            valueOFCell = cellValueOfDateTime.ToShortDateString().ToString();
                                        }
                                        else
                                        {
                                            valueOFCell = cellValue == null ? "" : cellValue.ToString();
                                        }
                                        values.Add(valueOFCell);
                                    }
                                }
                                if (i != 1)
                                {
                                    string invalidColumnHeader = _entityRepository.IsValidEntityTemplate(columnHeader, values[0]);
                                    if (!string.IsNullOrEmpty(invalidColumnHeader))
                                    {
                                        fs.Close();
                                        return JsonConvert.SerializeObject(new { IsValid = false, data = "Error message: " + invalidColumnHeader + " template not found for Entity Type: " + values[0] });
                                    }
                                    else
                                    {
                                        bool isInserted = _entityRepository.InsertTemplateDetails(columnHeader, values);
                                    }
                                }
                                else
                                {
                                    if (columnHeader[0].Trim().ToString().ToLower() != "entity type" || columnHeader[1].Trim().ToString().ToLower() != "entity name")
                                    {
                                        isValidColHDR = false;
                                    }
                                    for (int colHDR = 2; colHDR < columnHeader.Count; colHDR = colHDR + 3)
                                    {
                                        if (string.IsNullOrEmpty(columnHeader[colHDR].Trim().ToString().ToLower()) || columnHeader[colHDR + 1].Trim().ToString().ToLower() != "start date" || columnHeader[colHDR + 2].Trim().ToString().ToLower() != "end date")
                                        {
                                            isValidColHDR = false;

                                            break;
                                        }
                                    }
                                    if (!isValidColHDR)
                                    {
                                        fs.Close();
                                        return JsonConvert.SerializeObject(new { IsValid = false, data = "This excel file is not valid for Entity bulk import. Please view sample file!" });
                                    }
                                }
                            }
                        }

                        fs.Close();
                    }
                    return JsonConvert.SerializeObject(new { IsValid = true, data = "File imported successfully." });
                }
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Issue occured when file is imported." });
            }
            catch (Exception e)
            {
                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message });
            }
            finally
            {
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
        }

        #endregion

        #region Entity  Equipment Assign Export - Import

        public FileResult EntityEquipmentAssignExport(string startDate, string searchString, string columns)
        {
            MemoryStream ms = new MemoryStream();
            using (SLDocument sl = new SLDocument())
            {
                var columnsValue = string.Empty;
                if (!string.IsNullOrEmpty(columns))
                {
                    columns = columns.Substring(0, columns.Length - 1);
                    foreach (var col in columns.Split(',').Select(x => "[" + x + "]").ToList())
                    {
                        columnsValue += col + ",";
                    }
                    columnsValue = columnsValue.Substring(0, columnsValue.Length - 1);
                }
                var equipments = _entityRepository.ExportEntityEquipmentAssign(startDate, searchString, columnsValue);
                var entityHdr = _entityRepository.GetAllEntityHeaders();
                var equipment_ent_assignment = _equipmentRepository.GetAllEquipment_Entity_AssignmentByDate(startDate);


                SLStyle sLStyle = new SLStyle();
                sLStyle.Protection.Locked = false;
                sLStyle.Fill.SetPattern(PatternValues.Solid, System.Drawing.Color.White, System.Drawing.Color.White);

                sLStyle.Border.LeftBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.LeftBorder.Color = System.Drawing.Color.Black;

                sLStyle.Border.RightBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.RightBorder.Color = System.Drawing.Color.Black;

                sLStyle.Border.BottomBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.BottomBorder.Color = System.Drawing.Color.Black;

                sLStyle.Border.TopBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyle.Border.TopBorder.Color = System.Drawing.Color.Black;
                sLStyle.Font.Bold = false;


                SLSheetProtection sp = new SLSheetProtection();
                sp.AllowEditObjects = true;

                SLStyle sLStyleColor = new SLStyle();
                sLStyleColor.Fill.SetPattern(PatternValues.Solid, System.Drawing.Color.LightGray, System.Drawing.Color.LightGray);

                sLStyleColor.Font.Bold = true;

                sLStyleColor.Border.LeftBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.LeftBorder.Color = System.Drawing.Color.Black;

                sLStyleColor.Border.RightBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.RightBorder.Color = System.Drawing.Color.Black;

                sLStyleColor.Border.BottomBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.BottomBorder.Color = System.Drawing.Color.Black;

                sLStyleColor.Border.TopBorder.BorderStyle = BorderStyleValues.Thin;
                sLStyleColor.Border.TopBorder.Color = System.Drawing.Color.Black;


                sl.SetCellValue(1, 2, "Start Date:");
                sl.SetCellValue(1, 3, startDate);

                int i = 2;
                sl.AutoFitColumn(1);
                int j = 0;

                foreach (var e in equipments)
                {
                    j = 1;
                    int equipmentID = 0;
                    foreach (var item in e)
                    {
                        sl.SetColumnStyle(j, sLStyleColor);
                        sl.AutoFitColumn(j);
                        if (i == 2)
                        {
                            sl.RemoveCellStyle((i + 1), j);
                            sl.SetCellValue(i, j, item.Key);
                            sl.SetCellValue((i + 1), j, item.Value == null ? "" : item.Value.ToString());
                        }
                        else
                        {
                            sl.RemoveCellStyle(i, j);
                            sl.SetCellValue(i, j, item.Value == null ? "" : item.Value.ToString());
                        }
                        j++;
                        if (item.Key == "EQUIP_ID")
                        {
                            equipmentID = item.Value;
                        }
                    }
                    if (i == 2)
                    {
                        i++;
                    }

                    sl.SetColumnStyle(j, j + 200, sLStyle);
                    var entIDList = equipment_ent_assignment.Where(x => x.EQUIP_ID == equipmentID).Select(x => x.ENT_ID).ToList();
                    sl.SetCellValue(2, j, "Entity Name");
                    foreach (var entityID in entIDList)
                    {
                        sl.SetCellValue(i, j, entityHdr.Where(x => x.ENT_ID == entityID).Select(x => x.ENT_NAME).FirstOrDefault());
                        sl.SetCellValue(2, j, "Entity Name");
                        j++;
                    }
                    i++;
                }
                sl.AutoFitColumn(1, j);
                sLStyleColor.Protection.Locked = true;
                sl.SetRowStyle(1, sLStyleColor);
                sl.ProtectWorksheet(sp);
                sl.SaveAs(ms);
            }
            ms.Position = 0;

            return File(ms, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "EntityEquipmentAssignExport.xlsx");
        }

        [HttpPost]
        public string EntityEquipmentAssignImport(HttpPostedFileBase file)
        {
            var fileExt = Path.GetExtension(file.FileName);
            string path = string.Empty;
            string excelTotalAssign = string.Empty;
            string excelInvalidEntityName = string.Empty;
            int excelTotalRemove = 0;
            int totalRecords = 0;
            int excelTotalNewAssign = 0;
            int gtOneAssign = 0;
            int excelInvalidEntCount = 0;
            bool isValidColHDR = true;
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            path += @"\EntityEquipmentAssignImport" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);

            FileStream fs = new FileStream(path, FileMode.Open);
           
            try
            {
                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {
                    List<string> columnHeader = new List<string>();
                    using (SLDocument sl = new SLDocument())
                    {
                        
                        SLDocument sheet = new SLDocument(fs);

                        SLWorksheetStatistics stats = sheet.GetWorksheetStatistics();
                        var startDate = (sheet.GetCellValueAsDateTime(1, 3));

                        for (int i = 2; i <= stats.EndRowIndex; i++)
                        {
                            var headerCellValue = (sheet.GetCellValueAsString(i, 1));
                            if (headerCellValue == null)
                            {
                                break;
                            }
                            else
                            {
                                totalRecords = i - 2;
                                List<string> values = new List<string>();
                                for (int j = 1; j <= stats.EndColumnIndex; j++)
                                {
                                    var cellValue = (sheet.GetCellValueAsString(i, j));
                                    if (i == 2)
                                    {
                                        if (!string.IsNullOrEmpty(cellValue))
                                        {
                                            columnHeader.Add(cellValue);
                                        }
                                        else
                                        {
                                            break;
                                        }
                                    }
                                    else
                                    {
                                        if (columnHeader.Count < j)
                                        {
                                            break;
                                        }
                                        var valueOFCell = cellValue == null ? "" : cellValue.ToString();
                                        values.Add(valueOFCell);
                                    }
                                }
                                if (i != 2)
                                {
                                    var isUpdated = _entityRepository.UpdateInsertEQUENTASS(startDate.ToShortDateString(), columnHeader, values, out string totalNewAssigned, out int totalRemoved, out string invalidEntName);
                                    excelTotalAssign += totalNewAssigned;
                                    excelTotalRemove = excelTotalRemove + totalRemoved;
                                    excelInvalidEntityName += invalidEntName;
                                }
                                else
                                {
                                    if (columnHeader[0].Trim().ToString().ToLower() != "equip_id" || columnHeader[1].Trim().ToString().ToLower() != "equip_type" || columnHeader[2].Trim().ToString().ToLower() != "vendor" || columnHeader[3].Trim().ToString().ToLower() != "unit_id" || columnHeader.Count == 4)
                                    {
                                        isValidColHDR = false;
                                    }

                                    for (int colHDR = 4; colHDR < columnHeader.Count; colHDR++)
                                    {
                                        if (columnHeader[colHDR].Trim().ToString().ToLower() != "entity name")
                                        {
                                            isValidColHDR = false;
                                        }
                                    }
                                    if (!isValidColHDR)
                                    {
                                        fs.Close();
                                        return JsonConvert.SerializeObject(new { IsValid = false, data = "This excel file is not valid for Entity Equipment assign import. Please view sample file!" });
                                    }
                                }
                            }
                        }
                        if (!string.IsNullOrEmpty(excelTotalAssign))
                        {
                            var totalAssignment = excelTotalAssign.Substring(0, excelTotalAssign.Length - 1).Split(',');
                            gtOneAssign = excelTotalAssign.Split(',').GroupBy(x => x).Where(g => g.Count() > 1).Count();
                            excelTotalNewAssign = totalAssignment.Count();
                        }
                        if (!string.IsNullOrEmpty(excelInvalidEntityName))
                        {
                            excelInvalidEntityName = excelInvalidEntityName.Substring(0, excelInvalidEntityName.Length - 1);
                            excelInvalidEntCount = excelInvalidEntityName.Split(',').Count();
                        }
                        fs.Close();
                    }
                }
                return JsonConvert.SerializeObject(new { IsValid = true, excelTotalNewAssign = excelTotalNewAssign, excelTotalRemove = excelTotalRemove, gtOneAssign = gtOneAssign, totalRecords = totalRecords, excelInvalidEntityName = excelInvalidEntityName, excelInvalidEntCount = excelInvalidEntCount, data = "" });
            }
            catch (Exception e)
            {
                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message });
            }
            finally
            {
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
        }
        #endregion


        #region Bulk Import Template

        [HttpPost]
        public string BulkImportTemplate(HttpPostedFileBase file, bool isEntity)
        {
            string path = string.Empty;
            var fileExt = Path.GetExtension(file.FileName);
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            path += @"\BulkImportTemplate" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);

            FileStream fs = new FileStream(path, FileMode.Open);
            try
            {
                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {
                    List<string> columnHeader = new List<string>();
                    using (SLDocument sl = new SLDocument())
                    {
                        SLDocument sheet = new SLDocument(fs);

                        SLWorksheetStatistics stats = sheet.GetWorksheetStatistics();
                        for (int i = 1; i <= stats.EndRowIndex; i++)
                        {
                            var headerCellValue = (sheet.GetCellValueAsString(i, 1));
                            if (headerCellValue.ToString() == null)
                            {
                                break;
                            }
                            else
                            {
                                List<string> values = new List<string>();
                                for (int j = 1; j <= stats.EndColumnIndex; j++)
                                {
                                    var cellValue = (sheet.GetCellValueAsString(i, j));
                                    if (i == 1)
                                    {
                                        if (cellValue != null)
                                        {
                                            columnHeader.Add(cellValue);
                                        }
                                        else
                                        {
                                            break;
                                        }
                                    }
                                    else
                                    {
                                        if (columnHeader.Count < j)
                                        {
                                            break;
                                        }
                                        var valueOFCell = "";
                                        valueOFCell = cellValue == null ? "" : cellValue.ToString();
                                        values.Add(valueOFCell);
                                    }
                                }
                                if (i != 1)
                                {
                                    bool isInserted = _entityRepository.InsertTemplate(columnHeader, values, isEntity);
                                }
                                else
                                {
                                    if (isEntity)
                                    {
                                        if ((columnHeader[0].Trim().ToString().ToLower() != "entitytype") || (columnHeader[1].Trim().ToString().ToLower() != "property") || (columnHeader[2].Trim().ToString().ToLower() != "datatype") || (columnHeader[3].Trim().ToString().ToLower() != "seqance"))
                                        {
                                            fs.Close();
                                            return JsonConvert.SerializeObject(new { IsValid = false, data = "This excel file is not valid for Entity. Please view sample file!" });
                                        }
                                    }
                                    else
                                    {
                                        if ((columnHeader[0].Trim().ToString().ToLower() != "equipmenttype") || (columnHeader[1].Trim().ToString().ToLower() != "property") || (columnHeader[2].Trim().ToString().ToLower() != "datatype") || (columnHeader[3].Trim().ToString().ToLower() != "seqance"))
                                        {
                                            fs.Close();
                                            return JsonConvert.SerializeObject(new { IsValid = false, data = "This excel file is not valid for Equipment. Please view sample file!" });
                                        }
                                    }
                                }
                            }
                        }

                        fs.Close();
                    }
                    return JsonConvert.SerializeObject(new { IsValid = true, data = "File imported successfully." });
                }
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Issue occured when file is imported." });
            }
            catch (Exception e)
            {
                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message });
            }
            finally
            {
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
        }

        #endregion
    }
}