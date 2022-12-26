namespace InventoryTracker_WebApp.Domain.Admin
{
    public interface IAdminRepository
    {
        //List<dynamic> GetAllTablesData();
        //bool UpdateAdminRights(string rights, int id);
        //bool UpdateMasterTables(string tableName, int id, string name, string type);
        //int IsValidRequestAccess(string email);
        //string GetPermissionsList(int companyId, int sectionId, int groupingId);
        //string GetTriggersList(int companyId, int sectionId, int groupingId);
        //bool UpdateSequences(AdminSectionSequence model);
        //bool AddNewData(AddNewBlocks model);
        //bool AddNewAssosiatedTrigger(int companyId, int sectionId, int groupingId, int triggerId);
        //bool AddNewAssosiatedPermission(int companyId, int sectionId, int groupingId, int userId);
        //bool DeleteAssosiatedTrigger(int id);
        //bool DeleteAssosiatedPermission(int id);
        //string GetAllPermissions();
        //string GetAllUser_Relation();
        string SendEmail(string bodyString, string userMail, string subject);
    }
}