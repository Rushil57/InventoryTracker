using DocumentFormat.OpenXml.Spreadsheet;
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
    public class EquipmentController : Controller
    {
        private readonly IEquipmentRepository _equipmentRepository;
        private Random rnd = new Random();

        public EquipmentController(IEquipmentRepository equipmentRepository)
        {
            this._equipmentRepository = equipmentRepository;
        }

        #region Equipment Template
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
        public string GetEquipmentHeaders(string searchString, int startIndex, int endIndex)
        {
            List<EquipmentHeader> equipmentHeaders = _equipmentRepository.GetEquipmentHeaders(searchString, startIndex, endIndex).ToList();
            return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentHeaders });
        }
        public string GetEquipmentHeadersfromEquipmentEntity(string searchString, int startIndex, int endIndex, string startDate)
        {
            List<EquipmentHeader> equipmentHeaders = _equipmentRepository.GetEquipmentHeadersfromEquipmentEntity(searchString, startIndex, endIndex, startDate).ToList();
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

        #endregion

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
                if (equipmentHeaders[0].EQUIP_ID == 0)
                {
                    bool isDuplicate = _equipmentRepository.CheckDuplicateEquipmentHDR(equipmentHeaders[0]);
                    if (isDuplicate)
                    {
                        return JsonConvert.SerializeObject(new { IsValid = false, data = "This equipment header is already exist." });
                    }
                }
                bool isInserted = _equipmentRepository.SaveEquipmentHDR(equipmentHeaders[0], equipmentDtl);
                return JsonConvert.SerializeObject(new { IsValid = true, data = true });
            }
            return JsonConvert.SerializeObject(new { IsValid = false });
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
                List<EquipmentDetail> AllEquipmentTemplateProp = _equipmentRepository.GetAllEquipmentTemplateProp(equipID);
                List<EntityHeader> entityHeaders = _equipmentRepository.GetEquipmentEntityAssignmentBYEquipID(equipID);
                return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentTempDetails, entityHeaders = entityHeaders, defaultEquipment = AllEquipmentTemplateProp });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }
        
        [HttpGet]
        public string GetAllEquipmentTemplateDetails()
        {
                List<EquipmentDetail> equipmentTempDetails = _equipmentRepository.GetAllEquipmentTemplateDetails();
                List<EntityHeader> entityHeaders = _equipmentRepository.GetAllEquipmentEntityAssignment();
                return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentTempDetails, entityHeaders = entityHeaders });   
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
                var data = _equipmentRepository.GetEquipmentEntityAssignment(startDate);
                return JsonConvert.SerializeObject(new { IsValid = true, data = data });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        [HttpPost]
        public string SaveEquipmentEntityAssignment(int entityID, int equipID, string startDate, int isDelete, string endDate)
        {
            if (equipID > 0 && entityID > 0)
            {
                bool isAssigned = _equipmentRepository.EquipmentEntityAssignment(entityID, equipID, startDate, isDelete, endDate);
                return JsonConvert.SerializeObject(new { IsValid = true, data = isAssigned });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }
        #endregion

        #region Equipment Export - Import

        public FileResult Export(string startDate, string searchString)
        {
            try
            {
                MemoryStream ms = new MemoryStream();
                using (SLDocument sl = new SLDocument())
                {
                    var equipment = _equipmentRepository.ExportEquipment(startDate, searchString);

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
                    foreach (var e in equipment)
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
                                if (j != 1 && j != 2 && j != 3 && j != 4)
                                {
                                    sl.RemoveCellStyle((i + 1), j);
                                    sl.SetCellStyle((i + 1), j, sLStyle);
                                }
                            }
                            else
                            {
                                sl.SetCellValue(i, j, item.Value == null ? "" : item.Value.ToString());
                                if (j != 1 && j != 2 && j != 3 && j != 4)
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

                return File(ms, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Equipment.xlsx");
            }
            catch (Exception e)
            {
                throw;
            }
            finally
            {
            }
        }

        [HttpPost]
        public string Import(HttpPostedFileBase file)
        {
            string path = string.Empty;
            try
            {
                var fileExt = Path.GetExtension(file.FileName);
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                path += @"\ImportEquipment" + DateTime.Now.Ticks + ".xlsx";
                file.SaveAs(path);

                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {
                    List<string> columnHeader = new List<string>();
                    using (SLDocument sl = new SLDocument())
                    {
                        FileStream fs = new FileStream(path, FileMode.Open);
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
                                    bool isUpdated = _equipmentRepository.UpdateTemplateDetails(startDate.ToShortDateString(), columnHeader, values);
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
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Issue occured when file is imported." });
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
            try
            {
                var fileExt = Path.GetExtension(file.FileName);
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                path += @"\BulkImportEquipment" + DateTime.Now.Ticks + ".xlsx";
                file.SaveAs(path);

                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {
                    List<string> columnHeader = new List<string>();
                    using (SLDocument sl = new SLDocument())
                    {
                        FileStream fs = new FileStream(path, FileMode.Open);
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
                                    string invalidColumnHeader = _equipmentRepository.IsValidEquipmentTemplate(columnHeader, values[0]);
                                    if (!string.IsNullOrEmpty(invalidColumnHeader))
                                    {
                                        fs.Close();
                                        return JsonConvert.SerializeObject(new { IsValid = false, data = "Error message: " + invalidColumnHeader + " template not found for Equipment Type: " + values[0] });
                                    }
                                    else
                                    {
                                        bool isInserted = _equipmentRepository.InsertTemplateDetails(columnHeader, values);
                                    }
                                }
                                else
                                {
                                    if (columnHeader[0].Trim().ToString().ToLower() != "equipment type" || columnHeader[1].Trim().ToString().ToLower() != "vendor" || columnHeader[2].Trim().ToString().ToLower() != "unit id")
                                    {
                                        isValidColHDR = false;
                                    }
                                    for (int colHDR = 3; colHDR < columnHeader.Count; colHDR = colHDR + 3)
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
                                        return JsonConvert.SerializeObject(new { IsValid = false, data = "This excel file is not valid for Equipment bulk import. Please view sample file!" });
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
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Issue occured when file is imported." });
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

        #region Equipment Entity Assign Export - Import

        public FileResult EquipmentEntityAssignExport(string startDate, string searchString, string columns)
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
                var entities = _equipmentRepository.ExportEquipmentEntityAssign(startDate, searchString, columnsValue);
                var equipmentHdr = _equipmentRepository.GetAllEquipmentHeaders();
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
                sl.SetColumnStyle(1, sLStyleColor);
                sl.SetColumnStyle(i + 1, sLStyleColor);
                sl.AutoFitColumn(1);
                int j = 0;
                foreach (var e in entities)
                {
                    j = 1;
                    int entID = 0;
                    sl.SetColumnStyle(i, sLStyleColor);
                    sl.AutoFitColumn(j);

                    foreach (var item in e)
                    {
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
                        if (item.Key == "ENT_ID")
                        {
                            entID = item.Value;
                        }
                    }
                    if (i == 2)
                    {
                        i++;
                    }
                    sl.SetColumnStyle(j, j + 200, sLStyle);
                    var equipIDList = equipment_ent_assignment.Where(x => x.ENT_ID == entID).Select(x => x.EQUIP_ID).ToList();
                    sl.SetCellValue(2, j, "Unit ID");
                    foreach (var equipID in equipIDList)
                    {
                        sl.SetCellValue(i, j, equipmentHdr.Where(x => x.EQUIP_ID == equipID).Select(x => x.UNIT_ID).FirstOrDefault());
                        sl.SetCellValue(2, j, "Unit ID");

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

            return File(ms, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "EquipmentEntityAssignExport.xlsx");
        }

        [HttpPost]
        public string EquipmentEntityAssignImport(HttpPostedFileBase file)
        {

            var fileExt = Path.GetExtension(file.FileName);
            string path = string.Empty;
            string excelTotalAssign = string.Empty;
            string excelInvalidUnitID = string.Empty;
            int excelTotalRemove = 0;
            int totalRecords = 0;
            int excelTotalNewAssign = 0;
            int gtOneAssign = 0;
            int excelInvalidUnitIDCount = 0;
            bool isValidColHDR = true;

            try
            {
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                path += @"\EquipmentEntityAssignImport" + DateTime.Now.Ticks + ".xlsx";
                file.SaveAs(path);

                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {
                    List<string> columnHeader = new List<string>();
                    using (SLDocument sl = new SLDocument())
                    {
                        FileStream fs = new FileStream(path, FileMode.Open);
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
                                    var isUpdated = _equipmentRepository.UpdateInsertEQUENTASS(startDate.ToShortDateString(), columnHeader, values, out string totalNewAssigned, out int totalRemoved, out string invalidUnitID);
                                    excelTotalAssign += totalNewAssigned;
                                    excelTotalRemove = excelTotalRemove + totalRemoved;
                                    excelInvalidUnitID += invalidUnitID;
                                }
                                else
                                {
                                    if (columnHeader[0].Trim().ToString().ToLower() != "ent_id" || columnHeader[1].Trim().ToString().ToLower() != "ent_name" || columnHeader.Count == 2)
                                    {
                                        isValidColHDR = false;
                                    }
                                    for (int colHDR = 2; colHDR < columnHeader.Count; colHDR++)
                                    {
                                        if (columnHeader[colHDR].Trim().ToString().ToLower() != "unit id")
                                        {
                                            isValidColHDR = false;
                                        }
                                    }
                                    if (!isValidColHDR)
                                    {
                                        fs.Close();
                                        return JsonConvert.SerializeObject(new { IsValid = false, data = "This excel file is not valid for Equipment Entity assign import. Please view sample file!" });
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
                        if (!string.IsNullOrEmpty(excelInvalidUnitID))
                        {
                            excelInvalidUnitID = excelInvalidUnitID.Substring(0, excelInvalidUnitID.Length - 1);
                            excelInvalidUnitIDCount = excelInvalidUnitID.Split(',').Count();
                        }
                        fs.Close();
                    }
                }
                return JsonConvert.SerializeObject(new { IsValid = true, excelTotalNewAssign = excelTotalNewAssign, excelTotalRemove = excelTotalRemove, gtOneAssign = gtOneAssign, totalRecords = totalRecords, excelInvalidUnitID = excelInvalidUnitID, excelInvalidUnitIDCount = excelInvalidUnitIDCount, data = "" });
            }
            catch (Exception e)
            {
                throw;
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

        #region Equipment Calender Control
        public string GetEquipmentEntityAssignmentByYear(string year,int entityID=0, int equipID=0)
        {
            if (!string.IsNullOrEmpty(year))
            {
                var data = _equipmentRepository.GetEquipmentEntityAssignmentByYear(year, entityID,equipID);
                data.ForEach(x => x.RendomColor = System.Drawing.Color.FromArgb
                (rnd.Next(0,256), rnd.Next(0,256), rnd.Next(0,256)).Name.ToString());
                return JsonConvert.SerializeObject(new { IsValid = true, data = data });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        #endregion
    }
}