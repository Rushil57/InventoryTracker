using System;

namespace InventoryTracker_WebApp.Models
{
    public class EquipmentDetail
    {
        public int Equip_Dtl_ID { get; set; }
        public int Equip_ID { get; set; }
        public int Equip_Temp_ID { get; set; }
        public string Eq_Value { get; set; }
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Prop_Name { get; set; }
        public string Datatype { get; set; }
    }
}