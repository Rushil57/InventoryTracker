using InventoryTracker_WebApp.Domain.Equipment;
using InventoryTracker_WebApp.Models;
using Microsoft.Office.Interop.Excel;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Web;
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

        #region Equipment Temolate
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
                List<EntityHeader> entityHeaders = _equipmentRepository.GetEquipmentEntityAssignmentBYEquipID(equipID);
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
            string path = string.Empty;
            Application application = new Application();
            Workbook workbook = application.Workbooks.Add(Missing.Value);
            try
            {
                var equipment = _equipmentRepository.ExportEquipment(startDate, searchString);


                Worksheet worksheet = workbook.ActiveSheet;
                worksheet.Cells[1, 2] = "Start Date:";
                worksheet.Cells[1, 3] = startDate;
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                int i = 2;


                path += @"\Equipment-" + DateTime.Now.Ticks + ".xlsx";
                foreach (var e in equipment)
                {
                    int j = 1;
                    foreach (var item in e)
                    {
                        if (i == 2)
                        {
                            worksheet.Cells[i, j] = item.Key;
                            worksheet.Cells[i + 1, j] = item.Value;
                        }
                        else
                        {
                            worksheet.Cells[i, j] = item.Value;
                        }
                        j++;
                    }
                    if (i == 2)
                    {
                        i++;
                    }
                    i++;
                }
                worksheet.Cells.Locked = false;
                worksheet.get_Range("A1", "XFD1").Locked = true;
                worksheet.get_Range("A2", "XFD2").Locked = true;
                worksheet.get_Range("A3", "A1048576").Locked = true;
                worksheet.get_Range("B3", "B1048576").Locked = true;
                worksheet.get_Range("C3", "C1048576").Locked = true;
                worksheet.get_Range("D3", "D1048576").Locked = true;
                worksheet.Protect();
                workbook.SaveAs(path);
            }
            catch (Exception e)
            {

            }
            finally
            {
                workbook.Close();
                Marshal.ReleaseComObject(workbook);
            }
            byte[] fileBytes = System.IO.File.ReadAllBytes(path);
            if (System.IO.File.Exists(path))
            {
                System.IO.File.Delete(path);
            }
            return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, "Equipment.xlsx");
        }

        [HttpPost]
        public void Import(HttpPostedFileBase file)
        {
            var fileExt = Path.GetExtension(file.FileName);
            string path = string.Empty;
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";

            path += @"\ImportEquipment" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);
            Application oExcel = new Application();
            Workbook workbook = oExcel.Workbooks.Open(path);
            try
            {
                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {

                    string ExcelWorkbookname = workbook.Name;
                    int worksheetcount = workbook.Worksheets.Count;

                    Worksheet wks = (Worksheet)workbook.Worksheets[1];
                    string firstworksheetname = wks.Name;
                    List<string> columnHeader = new List<string>();
                    var startDate = ((Range)wks.Cells[1, 3]).Value;
                    startDate = Convert.ToDateTime(startDate);

                    for (int i = 2; i < wks.Rows.Count; i++)
                    {
                        var headerCellValue = ((Range)wks.Cells[i, 1]).Value;
                        if (headerCellValue.ToString() == null)
                        {
                            break;
                        }
                        else
                        {
                            List<string> values = new List<string>();
                            for (int j = 1; j < wks.Columns.Count; j++)
                            {
                                var cellValue = ((Range)wks.Cells[i, j]).Value;
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

                    workbook.Close();
                }
            }
            catch (Exception e)
            {
            }
            finally
            {
                workbook.Close();
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
            string path = string.Empty;
            Application application = new Application();
            Workbook workbook = application.Workbooks.Add(Missing.Value);
            try
            {
                if (!string.IsNullOrEmpty(columns))
                {
                    columns = columns.Substring(0, columns.Length - 1);
                }
                var entities = _equipmentRepository.ExportEquipmentEntityAssign(startDate, searchString, columns);
                var equipmentHdr = _equipmentRepository.GetAllEquipmentHeaders();
                var equipment_ent_assignment = _equipmentRepository.GetAllEquipment_Entity_AssignmentByDate(startDate);

                Worksheet worksheet = workbook.ActiveSheet;
                worksheet.Cells[1, 2] = "Start Date:";
                worksheet.Cells[1, 3] = startDate;
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                int i = 2;


                path += @"\EquipmentEntityAssignExport-" + DateTime.Now.Ticks + ".xlsx";
                foreach (var e in entities)
                {
                    int j = 1;
                    int entID = 0;
                    foreach (var item in e)
                    {
                        if (i == 2)
                        {
                            worksheet.Cells[i, j] = item.Key;
                            worksheet.Cells[i + 1, j] = item.Value;
                        }
                        else
                        {
                            worksheet.Cells[i, j] = item.Value;
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
                    var equipIDList = equipment_ent_assignment.Where(x => x.ENT_ID == entID).Select(x => x.EQUIP_ID).ToList();
                    foreach (var equipID in equipIDList)
                    {
                        worksheet.Cells[i, j] = equipmentHdr.Where(x => x.EQUIP_ID == equipID).Select(x => x.UNIT_ID).FirstOrDefault() ;
                        worksheet.Cells[2, j] = "Unit ID";
                        j++;
                    }
                    i++;
                }
                worksheet.Cells.Locked = false;
                worksheet.get_Range("A1", "XFD1").Locked = true;
                worksheet.get_Range("A2", "XFD2").Locked = true;
                worksheet.get_Range("A3", "A1048576").Locked = true;
                worksheet.get_Range("B3", "B1048576").Locked = true;
                worksheet.Protect();
                workbook.SaveAs(path);
            }
            catch (Exception e)
            {

            }
            finally
            {
                workbook.Close();
                Marshal.ReleaseComObject(workbook);
            }
            byte[] fileBytes = System.IO.File.ReadAllBytes(path);
            if (System.IO.File.Exists(path))
            {
                System.IO.File.Delete(path);
            }
            return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, "EquipmentEntityAssignExport.xlsx");
        }

        [HttpPost]
        public void EquipmentEntityAssignImport(HttpPostedFileBase file)
        {
            var fileExt = Path.GetExtension(file.FileName);
            string path = string.Empty;
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";

            path += @"\EquipmentEntityAssignImport" + DateTime.Now.Ticks + ".xlsx";
            file.SaveAs(path);
            Application oExcel = new Application();
            Workbook workbook = oExcel.Workbooks.Open(path);
            try
            {
                if (fileExt == ".xls" || fileExt == ".xlsx" || fileExt == ".csv")
                {

                    string ExcelWorkbookname = workbook.Name;
                    int worksheetcount = workbook.Worksheets.Count;

                    Worksheet wks = (Worksheet)workbook.Worksheets[1];
                    string firstworksheetname = wks.Name;
                    List<string> columnHeader = new List<string>();
                    var startDate = ((Range)wks.Cells[1, 3]).Value;
                    startDate = Convert.ToDateTime(startDate);

                    for (int i = 2; i < wks.Rows.Count; i++)
                    {
                        var headerCellValue = ((Range)wks.Cells[i, 1]).Value;
                        if (headerCellValue.ToString() == null)
                        {
                            break;
                        }
                        else
                        {
                            List<string> values = new List<string>();
                            for (int j = 1; j < wks.Columns.Count; j++)
                            {
                                var cellValue = ((Range)wks.Cells[i, j]).Value;
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
                                bool isUpdated = _equipmentRepository.UpdateInsertEQUENTASS(startDate.ToShortDateString(), columnHeader, values);
                            }
                        }
                    }

                    workbook.Close();
                }
            }
            catch (Exception e)
            {
            }
            finally
            {
                workbook.Close();
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
        }
        #endregion
    }
}