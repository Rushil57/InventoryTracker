using InventoryTracker_WebApp.Domain.Entity;
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
    public class EntityController : Controller
    {
        private readonly IEntityRepository _entityRepository;
        private readonly IEquipmentRepository _equipmentRepository;

        public EntityController(IEntityRepository entityRepository,IEquipmentRepository equipmentRepository)
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
                List<EquipmentHeader> equipmentHeaders = _entityRepository.GetEntityEquipmentAssignment(entityID);
                return JsonConvert.SerializeObject(new { IsValid = true, data = entityTempDetails, equipmentHeaders = equipmentHeaders });
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
                List<EntityDetail> entityDetails = _entityRepository.EntityValueByPropName(propName);
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

        public FileResult Export(string startDate,string searchString)
        {
            string path = string.Empty;
            Application application = new Application();
            Workbook workbook = application.Workbooks.Add(Missing.Value);
            try
            {
                var entity = _entityRepository.ExportEntity(startDate,searchString);

                
                Worksheet worksheet = workbook.ActiveSheet;
                worksheet.Cells[1, 2] = "Start Date:";
                worksheet.Cells[1, 3] = startDate;
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                int i = 2;

                
                path += @"\Entity-" + DateTime.Now.Ticks + ".xlsx";
                foreach (var e in entity)
                {
                    int j = 1;
                    foreach (var item in e)
                    {
                        if (i == 2)
                        {
                            worksheet.Cells[i, j] = item.Key;
                            worksheet.Cells[i+1, j] = item.Value;
                            worksheet.Cells[i, j].Interior.Color = System.Drawing.ColorTranslator.ToOle(System.Drawing.Color.LightGray);
                            worksheet.Cells[i, j].EntireRow.Font.Bold = true;
                            worksheet.Cells[i, j].Borders.LineStyle = XlLineStyle.xlContinuous;
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

                worksheet.Columns.AutoFit();
                worksheet.get_Range("A1", "XFD1").Borders.LineStyle = XlLineStyle.xlContinuous;
                worksheet.get_Range("A2", "XFD2").Borders.LineStyle = XlLineStyle.xlContinuous;
                worksheet.get_Range("A3", "A1048576").Borders.LineStyle = XlLineStyle.xlContinuous;
                worksheet.get_Range("B3", "B1048576").Borders.LineStyle = XlLineStyle.xlContinuous;
                worksheet.get_Range("A1", "XFD1").Interior.Color = System.Drawing.ColorTranslator.ToOle(System.Drawing.Color.LightGray);
                worksheet.get_Range("A2", "XFD2").Interior.Color = System.Drawing.ColorTranslator.ToOle(System.Drawing.Color.LightGray);
                worksheet.get_Range("A3", "A1048576").Interior.Color = System.Drawing.ColorTranslator.ToOle(System.Drawing.Color.LightGray);
                worksheet.get_Range("B3", "B1048576").Interior.Color = System.Drawing.ColorTranslator.ToOle(System.Drawing.Color.LightGray);
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
            return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, "Entity.xlsx");
        }

        [HttpPost]
        public void Import(HttpPostedFileBase file)
        {
            var fileExt = Path.GetExtension(file.FileName);
            string path = string.Empty;
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
            
            path += @"\ImportEntity" + DateTime.Now.Ticks + ".xlsx";
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
                                bool isUpdated = _entityRepository.UpdateTemplateDetails(startDate.ToShortDateString(), columnHeader, values);
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


        #region Entity  Equipment Assign Export - Import

        public FileResult EntityEquipmentAssignExport(string startDate, string searchString, string columns)
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
                var equipments = _entityRepository.ExportEntityEquipmentAssign(startDate, searchString, columns);
                var entityHdr = _entityRepository.GetAllEntityHeaders();
                var equipment_ent_assignment = _equipmentRepository.GetAllEquipment_Entity_AssignmentByDate(startDate);

                Worksheet worksheet = workbook.ActiveSheet;
                worksheet.Cells[1, 2] = "Start Date:";
                worksheet.Cells[1, 3] = startDate;
                path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";
                int i = 2;


                path += @"\EntityEquipmentAssignExport-" + DateTime.Now.Ticks + ".xlsx";
                foreach (var e in equipments)
                {
                    int j = 1;
                    int equipmentID = 0;
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
                        if (item.Key == "EQUIP_ID")
                        {
                            equipmentID = item.Value;
                        }
                    }
                    if (i == 2)
                    {
                        i++;
                    }
                    var entIDList = equipment_ent_assignment.Where(x => x.EQUIP_ID == equipmentID).Select(x => x.ENT_ID).ToList();
                    foreach (var entityID in entIDList)
                    {
                        worksheet.Cells[i, j] = entityHdr.Where(x => x.ENT_ID == entityID).Select(x => x.ENT_NAME).FirstOrDefault();
                        worksheet.Cells[2, j] = "Entity Name";
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
            return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, "EntityEquipmentAssignExport.xlsx");
        }

        [HttpPost]
        public void EntityEquipmentAssignImport(HttpPostedFileBase file)
        {
            var fileExt = Path.GetExtension(file.FileName);
            string path = string.Empty;
            path = AppDomain.CurrentDomain.BaseDirectory.ToString() + "ExcelFiles";

            path += @"\EntityEquipmentAssignImport" + DateTime.Now.Ticks + ".xlsx";
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
                                bool isUpdated = _entityRepository.UpdateInsertEQUENTASS(startDate.ToShortDateString(), columnHeader, values);
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