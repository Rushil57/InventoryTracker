using InventoryTracker_WebApp.Models;
using System.Collections.Generic;

namespace InventoryTracker_WebApp.Domain.Equipment
{
    public interface IEquipmentRepository
    {
        List<EquipmentHeader> GetEquipmentHeaders(string searchString, int startRow, int endRow);
        List<EquipmentHeader> GetEquipmentHeadersfromEquipmentEntity(string searchString, int startRow, int endRow,string startDate);
        bool DeleteEquipmentHeader(int equipID);
        List<EquipmentTemplate> GetEquipmentTemplates(string equipmentType);
        bool SaveEquipmentTemplate(List<EquipmentTemplate> equipmentTemplate);
        bool DeleteEquipment(string equipmentName);
        bool SaveEquipmentHDR(EquipmentHeader equipmentHDR, List<EquipmentDetail> equipmentDtl);
        List<EquipmentDetail> EquipmentValueByPropName(string propName);
        List<EquipmentDetail> GetEquipmentTemplateDetails(int equipID, string startDate);

        List<EntityHeader> GetEquipmentEntityAssignmentBYEquipID(int equipID);
        bool EquipmentEntityAssignment(int entityID, int equipID, string startDate, int isDelete, string endDate);

        List<EquipmentEntityAssignment> GetEquipmentEntityAssignment(string startDate);
        bool CheckDuplicateEquipmentHDR(EquipmentHeader equipmentHeader);

        List<dynamic> ExportEquipment(string startDate, string searchString);
        List<dynamic> ExportEquipmentEntityAssign(string startDate, string searchString,string columns);
        bool UpdateTemplateDetails(string startDate, List<string> columnHeader, List<string> values);
        bool UpdateInsertEQUENTASS(string startDate, List<string> columnHeader, List<string> values, out string totalNewAssigned, out int totalRemoved, out string invalidUnitID);
        List<EquipmentHeader> GetAllEquipmentHeaders(string unitID=null);
        List<EquipmentEntityAssignment> GetAllEquipment_Entity_AssignmentByDate(string startDate);

        bool InsertTemplateDetails(List<string> columnHeader, List<string> values);
        string IsValidEquipmentTemplate(List<string> columnHeader, string equipmentType);


        List<EquipmentDetail> GetAllEquipmentTemplateDetails();

        List<EntityHeader> GetAllEquipmentEntityAssignment();

        #region Equipment Calender Control
        List<EquipmentEntityAssignment> GetEquipmentEntityAssignmentByYear(string year,int entityID);
        #endregion
    }
}