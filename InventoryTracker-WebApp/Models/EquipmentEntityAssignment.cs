using System;

namespace InventoryTracker_WebApp.Models
{
    public class EquipmentEntityAssignment
    {
        public int EQUIP_ENT_ID { get; set; }
        public int EQUIP_ID { get; set; }
        public int ENT_ID { get; set; }
        public string UNIT_ID { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string ENT_NAME { get; set; }
    }
}