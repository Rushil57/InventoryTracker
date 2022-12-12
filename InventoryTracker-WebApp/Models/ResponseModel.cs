using System;

namespace InventoryTracker_WebApp.Models
{
    public class ResponseModel
    {
        public string Message { get; set; }
        public bool Status { get; set; }
    }
    public class CommonResponseModel<T> : ResponseModel
    {
        public string Message { get; set; }
        public bool Status { get; set; }
        public T Data { get; set; }
        public override string ToString()
        {
            return Environment.NewLine + typeof(ResponseModel).Name + "<" + typeof(T).Name + ">:" + Environment.NewLine + Data + Environment.NewLine + base.ToString();
        }
    }
}