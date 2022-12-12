﻿using InventoryTracker_WebApp.Models;
using System.Collections.Generic;

namespace InventoryTracker_WebApp.Domain.Equipment
{
    public interface IEquipmentRepository
    {
        List<EquipmentHeader> GetEquipmentHeaders(string searchString, int startRow, int endRow);
        bool DeleteEquipmentHeader(int equipID);
        List<EquipmentTemplate> GetEquipmentTemplates(string equipmentType);
        bool SaveEquipmentTemplate(List<EquipmentTemplate> equipmentTemplate);
        bool DeleteEquipment(string equipmentName);
        bool SaveEquipmentHDR(EquipmentHeader equipmentHDR, List<EquipmentDetail> equipmentDtl);
        List<EquipmentDetail> EquipmentValueByPropName(string propName);
        List<EquipmentDetail> GetEquipmentTemplateDetails(int equipID, string startDate);

        List<EntityHeader> GetEquipmentEntityAssignment(int equipID);
        bool EquipmentEntityAssignment(int entityID, int equipID, string startDate, int isDelete);

        List<EquipmentEntityAssignment> GetEquipmentEntityAssignment(string startDate);
    }
}