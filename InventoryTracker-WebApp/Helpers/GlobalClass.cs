using System.Web.Configuration;

namespace InventoryTracker_WebApp.Helpers
{
    public static class GlobalClass
    {
        public static string GlobalConnectionString_Master = WebConfigurationManager.AppSettings["sqldb_connection_Master"];
    }
}