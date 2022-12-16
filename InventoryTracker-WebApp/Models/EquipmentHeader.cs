namespace InventoryTracker_WebApp.Models
{
    public class EquipmentHeader
    {
        public int EQUIP_ID { get; set; }
        public string EQUIP_TYPE { get; set; }
        public string VENDOR { get; set; }
        public string UNIT_ID { get; set; }
        public int ASSIGNED { get; set; }
        public string START_DATE { get; set; }
        public string END_DATE { get; set; }
        public int Active { get; set; }
    }
}