using InventoryTracker_WebApp.Domain.MultiInstance;
using InventoryTracker_WebApp.Helpers;
using Newtonsoft.Json;
using System;
using System.Data.SqlClient;
using System.Data;
using System.IO;
using System.Web.Configuration;
using Dapper;

namespace InventoryTracker_WebApp.Repositories.MultiInstance
{
    public class MultiInstanceRepository : IMultiInstanceRepository
    {
        public string GetAllInstance(string email)
        {
            try
            {
                string query = $"SELECT u.id, u.instance_name, u.instance_note, u.isdefaultDB FROM INSTANCE u " +
                    $"WHERE u.isactive = 'Y' AND u.instance_name in (select mu.instance_name from MASTER_USER mu where mu.user_email =@UserEmail)";
                DataTable dt = CommonDatabaseOperationHelper.Get_Master(query, new { @UserEmail = email });
                return JsonConvert.SerializeObject(dt);
            }
            catch (Exception)
            {
                throw;
            }
        }
        public string AddNewInstanceName(string instanceName, string instanceNotes)
        {
            try
            {
                CommonDatabaseOperationHelper.ExecuteStoreProcedure_Master("SP_CopyDatabase_UsingBackup", new { @TargetDatabaseName = instanceName, @InstanceNote = instanceNotes, @BackupPath = WebConfigurationManager.AppSettings["BackupPath_for_CopyDB"] });
                InsertDefaultUser(instanceName);
                DeleteBackupFiles();
                return "Instance created Successfully";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
        private void DeleteBackupFiles()
        {
            try
            {
                DirectoryInfo di = new DirectoryInfo(WebConfigurationManager.AppSettings["BackupPath_for_CopyDB"]);
                foreach (FileInfo file in di.GetFiles())
                {
                    file.Delete();
                }
            }
            catch (Exception ex)
            {
            }
        }
        private void InsertDefaultUser(string instanceName)
        {
            try
            {
                var session = System.Web.HttpContext.Current.Session;
                if (session["Email"] != null)
                {
                    DataTable dt = new DataTable();
                    var con = new SqlConnection(WebConfigurationManager.AppSettings["sqldb_connection"] + instanceName); ;
                    con.Open();
                    dt.Load(con.ExecuteReader("sp_InsertUser", new { @Useremail = session["Email"], @InstanceName = instanceName }, commandTimeout: 250, commandType: CommandType.StoredProcedure));
                    con.Close();
                }


            }
            catch (Exception ex)
            {
            }
        }

        public string DeleteInstance(string email, string instanceName)
        {
            try
            {
                if (!string.IsNullOrEmpty(email) && !(string.IsNullOrEmpty(instanceName)))
                {
                    CommonDatabaseOperationHelper.ExecuteStoreProcedure_Master("SP_DeleteInstance", new { @email = email, @InstanceName = instanceName });
                   
                    return "Deleted Successfully";
                }
                else
                {
                    return "Email & InstanceName Required";
                }
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }

        }
    }
}