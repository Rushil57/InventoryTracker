namespace InventoryTracker_WebApp.Models
{
    public class EntityHeader
    {
        public int ENT_ID { get; set; }
        public string ENT_TYPE { get; set; }
        public string ENT_NAME { get; set; }
        public string START_DATE{ get; set; }
        public string END_DATE{ get; set; }
        public int ASSIGNED { get; set; }
    }
}