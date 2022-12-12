using System;

namespace InventoryTracker_WebApp.Models
{
    public class EntityDetail
    {
        public int Ent_Dtl_ID { get; set; }
        public int Ent_ID { get; set; }
        public int Ent_Temp_ID { get; set; }
        public string Ent_Value { get; set; }
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Prop_Name { get; set; }
        public string Datatype { get; set; }
        public string Sequence { get; set; }
    }
}