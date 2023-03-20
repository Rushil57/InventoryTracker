using InventoryTracker_WebApp.Models;
using System.Collections.Generic;
using System.Data;

namespace InventoryTracker_WebApp.Domain.Entity
{
    public interface IEntityRepository
    {
        List<EntityHeader> GetEntityHeaders(string searchString);
        List<EntityHeader> GetEntityHeaderfromEntityEquipment(string searchString,string startDate);
        List<EntityTemplate> GetEntityTemplates(string entityType);
        bool SaveEntityTemplate(List<EntityTemplate> entityTemplate);
        bool CheckDuplicateEntityHDR(EntityHeader entityHeader);
        bool DeleteEntityTemplates(string entityType);
        List<EntityDetail> GetEntityTemplateDetails(int entityID, string startDate);
        List<EntityDetail> GetAllEntityTemplateProp(int entityID);
        bool RemoveEntityEquipmentTemplateDetail(int deatailID, int isEntity);
        List<EntityDetail> EntityValueByPropName(string propName, string date);
        List<EquipmentHeader> GetEntityEquipmentAssignment(int entityID);
        bool DeleteEntityHeader(int entityID);
        bool SaveEntityHDR(EntityHeader entityHDR, List<EntityDetail> entityDtl,string currEntDTLID);
        DataTable ExportEntity(string startDate,string searchString);
        bool UpdateTemplateDetails(string startDate,List<string> columnHeader, List<string> values);
       
        DataTable ExportEntityEquipmentAssign(string startDate, string searchString, string columns);
        List<EntityHeader> GetAllEntityHeaders(string entityName = null);
        bool UpdateInsertEQUENTASS(string startDate, List<string> columnHeader, List<string> values, out string totalNewAssigned, out int totalRemoved, out string invalidEntityName);

        bool InsertTemplateDetails(List<string> columnHeader, List<string> values);
        string IsValidEntityTemplate(List<string> columnHeader, string entityType);
        bool InsertTemplate(List<string> columnHeader, List<string> values, bool isEntity);
        List<EntityDetail> GetAllEntityTemplateDetails();
        int GetEntityHeaderRowCount();

        #region Entity Equipment Assign Date Range Export - Import
        bool UpdateInsertENTEQUDateRangeASS(string startDate, List<string> columnHeader, List<string> values, int operation, out string totalNewAssigned, out int totalRemoved, out string invalidEntityName, out string totalNewUpdated);
        #endregion
    }
}