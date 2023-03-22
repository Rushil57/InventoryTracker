using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using InventoryTracker_WebApp.Domain.Equipment;
using InventoryTracker_WebApp.Helpers;
using InventoryTracker_WebApp.Models;
using Newtonsoft.Json;
using SpreadsheetLight;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Runtime.Serialization.Formatters.Binary;
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

            var uniquePropNameEqu = equipmentTemplates.GroupBy(x => new
            {
                x.Prop_Name,
                x.Equipment_Type
            }).Select(x => new EquipmentTemplate
            {
                Prop_Name = x.Key.Prop_Name,
                Equipment_Type = x.Key.Equipment_Type
            }).ToList();

            return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentTemplates, uniqueEquipmentTemplates = uniqueEquipmentTemplates, uniquePropName = uniquePropName, uniquePropNameEqu = uniquePropNameEqu });
        }
        public string GetEquipmentHeaders(string searchString)
        {
            List<EquipmentHeader> equipmentHeaders = _equipmentRepository.GetEquipmentHeaders(searchString).ToList();
            int totalCount = _equipmentRepository.GetTotalCountEquipmentHeaders();
            return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentHeaders, totalCount = totalCount });
        }
        public string GetEquipmentHeadersfromEquipmentEntity(string searchString, string startDate)
        {
            List<EquipmentHeader> equipmentHeaders = _equipmentRepository.GetEquipmentHeadersfromEquipmentEntity(searchString, startDate).ToList();
            int totalCount = _equipmentRepository.GetTotalCountEquipmentHeaders();
            return JsonConvert.SerializeObject(new { IsValid = true, data = equipmentHeaders, totalCount = totalCount });
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
        public string SaveEquipmentHDRTempData(string equipmentHDR, string equipmentTmpDtl,string currEquipmentDTLID)
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
                bool isInserted = _equipmentRepository.SaveEquipmentHDR(equipmentHeaders[0], equipmentDtl, currEquipmentDTLID);
                if (!isInserted)
                {
                    return JsonConvert.SerializeObject(new { IsValid = true, data = "Value is already present on selected date range for this property." });
                }
                return JsonConvert.SerializeObject(new { IsValid = true, data = "Data save successfully!" });
            }
            return JsonConvert.SerializeObject(new { IsValid = false });
        }

        [HttpGet]
        public string EquipmentValueByPropName(string propName, string date)
        {
            if (!string.IsNullOrEmpty(propName))
            {
                List<EquipmentDetail> equipmentDetails = _equipmentRepository.EquipmentValueByPropName(propName, date);
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
        public string SaveEquipmentEntityAssignment(int entityID, int equipID, string startDate, int isDelete, string endDate, int equipEntID)
        {
            if (equipID > 0 && entityID > 0)
            {
                bool isAssigned = _equipmentRepository.EquipmentEntityAssignment(entityID, equipID, startDate, isDelete, endDate, equipEntID);
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
                    sLStyleColor.Protection.Locked = true;
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

                    int newcolumnCount = 0;
                    var firstEquipIDCount = equipment[0].Columns.Count;
                    var valueStr = "Value";
                    var startDateStr = "Start Date";
                    var endDateStr = "End Date";
                    var equipDtlIDStr = "Equip_Dtl_ID";
                    foreach (var eRows in equipment[0].Rows.Cast<DataRow>())
                    {
                        var rowList = equipment[1].Rows.Cast<DataRow>().Where(x => x.ItemArray[1].Equals(eRows[1]) && x.ItemArray[0].Equals(eRows[0])).OrderBy(x => x.ItemArray[4]).ToList();
                        var j = firstEquipIDCount;
                        foreach (var eRowsVal in rowList)
                        {
                            if (newcolumnCount < rowList.Count)
                            {
                                equipment[0].Columns.Add(equipDtlIDStr);
                                equipment[0].Columns.Add(valueStr);
                                equipment[0].Columns.Add(startDateStr);
                                equipment[0].Columns.Add(endDateStr);
                                newcolumnCount++;
                                valueStr += " ";
                                startDateStr += " ";
                                endDateStr += " ";
                                equipDtlIDStr += " ";
                            }
                            eRows[j] = eRowsVal[2];
                            j++;
                            eRows[j] = eRowsVal[3];
                            j++;
                            eRows[j] = Convert.ToDateTime(eRowsVal[4]).ToShortDateString();
                            j++;
                            eRows[j] = Convert.ToDateTime(eRowsVal[5]).ToShortDateString();
                            j++;
                        }
                    }

                    equipment[0].Columns.Remove("Equip_ID");
                    equipment[0].Columns.Remove("Equip_Temp_ID");
                    sl.ImportDataTable("A2", equipment[0], true);
                    sl.AutoFitColumn(1, equipment[0].Columns.Count);
                    sl.SetColumnStyle(1, equipment[0].Columns.Count, sLStyle);
                    sl.SetRowStyle(1, equipment[0].Rows.Count + 2, sLStyleColor);
                    sl.SetColumnStyle(6, equipment[0].Columns.Count, sLStyle);
                    for (int i = 5; i < equipment[0].Columns.Count; i = i + 4)
                    {
                        sl.SetColumnStyle(i, sLStyleColor);
                    }

                    sl.RemoveRowStyle(1, 2);
                    sl.SetRowStyle(1, 2, sLStyleColor);
                    sl.ProtectWorksheet(sp);
                    sl.SaveAs(ms);
                }
                ms.Position = 0;
                ControllerContext.HttpContext.Response.Cookies.Add(new HttpCookie("cookie_EquipmentSearchData", new DateTime().ToShortDateString()));
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
            var fileExt = Path.GetExtension(file.FileName);
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            path += @"\ImportEquipment" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);
            FileStream fs = new FileStream(path, FileMode.Open);
            int CurrentRow = 0;
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
                            CurrentRow = i;
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
                                        if (!string.IsNullOrEmpty(cellValue) && cellValue.IndexOf("-") < 0 && (columnHeader[j - 1].ToLower().ToString().Trim() == "start date" || columnHeader[j - 1].ToLower().ToString().Trim() == "end date"))
                                        {
                                            cellValue = (sheet.GetCellValueAsDateTime(i, j)).ToShortDateString();
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
                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message.ToString() + "Issue occured in excel row number : " + CurrentRow });
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
            path += @"\BulkImportEquipment" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);
            FileStream fs = new FileStream(path, FileMode.Open);
            int CurrentRow = 0;
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
                            CurrentRow = i;
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
                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message.ToString() + "Issue occured in excel row number : " + CurrentRow });
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
                sLStyleColor.Protection.Locked = true;
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
                int newcolumnCount = 0;
                var firstUnitID = entities.Columns.Count;
                var unitIDStr = "Unit ID";
                foreach (var eRows in entities.Rows.Cast<DataRow>())
                {
                    var entityID =Convert.ToInt64(((System.Data.DataRow)eRows).ItemArray[0]);
                    var equipIDList = equipment_ent_assignment.Where(x => x.ENT_ID == entityID).Select(x => x.EQUIP_ID).ToList();

                    var j = firstUnitID;
                    foreach (var equipID in equipIDList)
                    {
                        if (newcolumnCount < equipIDList.Count)
                        {
                            entities.Columns.Add(unitIDStr);
                            newcolumnCount++;
                            unitIDStr += " ";
                        }
                        eRows[j] = equipmentHdr.Where(x => x.EQUIP_ID == equipID).Select(x => x.UNIT_ID).FirstOrDefault();
                        j++;
                    }
                }
                sl.ImportDataTable("A2", entities, true);
                sl.AutoFitColumn(1, entities.Columns.Count);
                sl.SetColumnStyle(1, firstUnitID, sLStyleColor);
                sl.SetColumnStyle(firstUnitID + 1, entities.Columns.Count + 1000, sLStyle);
                sl.SetRowStyle(1, sLStyleColor);

                sl.ProtectWorksheet(sp);
                sl.SaveAs(ms);
            }
            ms.Position = 0;
            ControllerContext.HttpContext.Response.Cookies.Add(new HttpCookie("cookie_EquipmentEntityAssignExport", new DateTime().ToShortDateString()));
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

            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            path += @"\EquipmentEntityAssignImport" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);
            FileStream fs = new FileStream(path, FileMode.Open);
            int CurrentRow = 0;
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
                            CurrentRow = i;
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
                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message.ToString() + "Issue occured in excel row number : " + CurrentRow });
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
        public string GetEquipmentEntityAssignmentByYear(string year, int entityID = 0, int equipID = 0)
        {
            if (!string.IsNullOrEmpty(year))
            {
                var data = _equipmentRepository.GetEquipmentEntityAssignmentByYear(year, entityID, equipID);
                data.ForEach(x => x.RendomColor = System.Drawing.Color.FromArgb
                (rnd.Next(0, 256), rnd.Next(0, 256), rnd.Next(0, 256)).Name.ToString());
                return JsonConvert.SerializeObject(new { IsValid = true, data = data });
            }
            return JsonConvert.SerializeObject(new { IsValid = false, data = false });
        }

        #endregion

        #region Equipment Entity Assign Date Range Export - Import

        public FileResult EquipmentEntityAssignDateRangeExport(string startDate, string searchString, string cookievalue)
        {
            MemoryStream ms = new MemoryStream();
            using (SLDocument sl = new SLDocument())
            {
                var entities = _equipmentRepository.ExportEquipmentEntityAssign(startDate, searchString, string.Empty);
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
                sLStyleColor.Protection.Locked = true;
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
                int newcolumnCount = 0;
                var firstUnitID = entities.Columns.Count;
                var unitIDStr = "Unit ID";
                var startDateStr = "Start Date";
                var endDateStr = "End Date";
                foreach (var eRows in entities.Rows.Cast<DataRow>())
                {
                    var entityID = Convert.ToInt64(((System.Data.DataRow)eRows).ItemArray[0]);
                    var equipIDList = equipment_ent_assignment.Where(x => x.ENT_ID == entityID).Select(x => x.EQUIP_ID).ToList();

                    var j = firstUnitID;
                    foreach (var equipID in equipIDList)
                    {
                        if (newcolumnCount < equipIDList.Count)
                        {
                            entities.Columns.Add(unitIDStr);
                            entities.Columns.Add(startDateStr);
                            entities.Columns.Add(endDateStr);
                            newcolumnCount++;
                            unitIDStr += " ";
                            startDateStr += " ";
                            endDateStr += " ";
                        }
                        eRows[j] = equipmentHdr.Where(x => x.EQUIP_ID == equipID).Select(x => x.UNIT_ID).FirstOrDefault();
                        j++;
                       
                        eRows[j] = equipment_ent_assignment.Where(x => x.EQUIP_ID == equipID && x.ENT_ID == entityID).Select(x => x.START_DATE.ToShortDateString()).FirstOrDefault();
                        j++;
                        eRows[j] = equipment_ent_assignment.Where(x => x.EQUIP_ID == equipID && x.ENT_ID == entityID).Select(x => x.END_DATE.ToShortDateString()).FirstOrDefault();
                        j++;
                    }
                }
                sl.ImportDataTable("A2", entities, true);
                sl.AutoFitColumn(1, entities.Columns.Count);
                sl.SetColumnStyle(1, firstUnitID, sLStyleColor);
                sl.SetColumnStyle(firstUnitID + 1, entities.Columns.Count + 1000, sLStyle);
                sl.ProtectWorksheet(sp);
                sl.SaveAs(ms);
            }
            ms.Position = 0;
            ControllerContext.HttpContext.Response.Cookies.Add(new HttpCookie("cookie_EquipData", cookievalue));
            return File(ms, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "EquipmentEntityAssignDateRangeExport.xlsx");
        }

        [HttpPost]
        public string EquipmentEntityAssignDateRangeImport(HttpPostedFileBase file, int operation)
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
            string excelTotalUpdated = string.Empty;
            int excelUpdatedCount = 0;

            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            path += @"\EquipmentEntityAssignDateRangeImport" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);
            FileStream fs = new FileStream(path, FileMode.Open);
            int CurrentRow = 0;
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
                            CurrentRow = i;
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
                                        if (!string.IsNullOrEmpty(cellValue) && cellValue.IndexOf("-") < 0 && (columnHeader[j - 1].ToLower().ToString().Trim() == "start date" || columnHeader[j - 1].ToLower().ToString().Trim() == "end date"))
                                        {
                                            cellValue = (sheet.GetCellValueAsDateTime(i, j)).ToShortDateString();
                                        }
                                        var valueOFCell = cellValue == null ? "" : cellValue.ToString();
                                        values.Add(valueOFCell.Trim());
                                    }
                                }
                                if (i != 2)
                                {
                                    var isUpdated = _equipmentRepository.UpdateInsertEQUENTDateRangeASS(startDate.ToShortDateString(), columnHeader, values, operation, out string totalNewAssigned, out int totalRemoved, out string invalidUnitID, out string totalNewUpdated);
                                    excelTotalAssign += totalNewAssigned;
                                    excelTotalRemove = excelTotalRemove + totalRemoved;
                                    excelInvalidUnitID += invalidUnitID;
                                    excelTotalUpdated += totalNewUpdated;
                                }
                                else
                                {
                                    if (columnHeader[0].Trim().ToString().ToLower() != "ent_id" || columnHeader[1].Trim().ToString().ToLower() != "ent_name" || columnHeader.Count == 2)
                                    {
                                        isValidColHDR = false;
                                    }
                                    for (int colHDR = 2; colHDR < columnHeader.Count; colHDR = colHDR + 3)
                                    {
                                        if (columnHeader[colHDR].Trim().ToString().ToLower() != "unit id" || columnHeader[colHDR + 1].Trim().ToString().ToLower() != "start date" || columnHeader[colHDR + 2].Trim().ToString().ToLower() != "end date")
                                        {
                                            isValidColHDR = false;
                                        }
                                    }
                                    if (!isValidColHDR)
                                    {
                                        fs.Close();
                                        return JsonConvert.SerializeObject(new { IsValid = false, data = "This excel file is not valid for Equipment Entity date range assign import. Please view sample file!" });
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
                        if (!string.IsNullOrEmpty(excelTotalUpdated))
                        {
                            var totalUpdated = excelTotalUpdated.Substring(0, excelTotalUpdated.Length - 1).Split(',');
                            excelUpdatedCount = totalUpdated.Count();
                        }
                        fs.Close();
                    }
                }
                return JsonConvert.SerializeObject(new { IsValid = true, excelTotalNewAssign = excelTotalNewAssign, excelTotalRemove = excelTotalRemove, gtOneAssign = gtOneAssign, totalRecords = totalRecords, excelInvalidUnitID = excelInvalidUnitID, excelInvalidUnitIDCount = excelInvalidUnitIDCount, data = "", excelUpdatedCount = excelUpdatedCount });
            }
            catch (Exception e)
            {
                fs.Close();
                return JsonConvert.SerializeObject(new { IsValid = false, data = e.Message.ToString() + "Issue occured in excel row number : " + CurrentRow });
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