using InventoryTracker_WebApp.Models;
using System.Collections.Generic;

namespace InventoryTracker_WebApp.Domain.Entity
{
    public interface IEntityRepository
    {
        List<EntityHeader> GetEntityHeaders(string searchString, int startIndex, int endIndex);
        List<EntityHeader> GetEntityHeaderfromEntityEquipment(string searchString, int startIndex, int endIndex,string startDate);
        List<EntityTemplate> GetEntityTemplates(string entityType);
        bool SaveEntityTemplate(List<EntityTemplate> entityTemplate);
        bool CheckDuplicateEntityHDR(EntityHeader entityHeader);
        bool DeleteEntityTemplates(string entityType);
        List<EntityDetail> GetEntityTemplateDetails(int entityID, string startDate);
        List<EntityDetail> EntityValueByPropName(string propName);
        List<EquipmentHeader> GetEntityEquipmentAssignment(int entityID);
        bool DeleteEntityHeader(int entityID);
        bool SaveEntityHDR(EntityHeader entityHDR, List<EntityDetail> entityDtl);
        List<dynamic> ExportEntity(string startDate);
    }
}