using System;
using System.Data.SqlClient;
using System.Data;
using System.IO;
using System.Web;
using System.Web.Configuration;
using Dapper;

namespace InventoryTracker_WebApp.Helpers
{
    public class CommonDatabaseOperationHelper
    {
        public static string sqldb_connection = WebConfigurationManager.AppSettings["sqldb_connection"];
        #region Common Database Functions
        public static int InsertUpdateDelete(string query, object Params = null)
        {
            try
            {
                int noOfRecords = 0;
                if (string.IsNullOrEmpty(query))
                    return noOfRecords;

                var con = CreateMasterConnection();
                //var con = CreateConnection();
                con.Open();
                noOfRecords = con.Execute(query, Params, commandTimeout: 250);
                con.Close();
                return noOfRecords;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper InsertUpdateDelete Using Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static int InsertUpdateDeleteWithScalar(string query, object Params = null)
        {
            try
            {
                int id = 0;
                if (string.IsNullOrEmpty(query))
                    return id;

                var con = CreateConnection();
                con.Open();
                var dbVal = con.ExecuteScalar(query, Params, commandTimeout: 250);
                id = dbVal == DBNull.Value ? 0 : Convert.ToInt32(dbVal);
                con.Close();
                return id;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper InsertUpdateDeleteWithScalar Using Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static DataTable Get(string query, object Params = null)
        {
            try
            {
                DataTable dt = new DataTable();
                if (string.IsNullOrEmpty(query))
                    return dt;

                //var con = CreateConnection();
                var con = CreateMasterConnection();
                con.Open();
                dt.Load(con.ExecuteReader(query, Params, commandTimeout: 250));
                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper Get Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }
        public static DataSet GetDataSet(string query, object Params = null)
        {
            try
            {
                DataSet dt = new DataSet();
                if (string.IsNullOrEmpty(query))
                    return dt;

                var con = CreateConnection();
                con.Open();
                dt = ConvertDataReaderToDataSet((con.ExecuteReader(query, Params, commandTimeout: 250)));
                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper Get Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static string Scalar(string query, object Params = null)
        {
            try
            {
                string value = string.Empty;
                if (string.IsNullOrEmpty(query))
                    return value;

                var con = CreateConnection();
                con.Open();
                value = con.ExecuteScalar(query, Params, commandTimeout: 250).ToString();
                con.Close();
                return value;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper Scalar Using Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static DataTable ExecuteStoreProcedure(string procedureName, object Params = null)
        {
            try
            {
                DataTable dt = new DataTable();
                if (string.IsNullOrEmpty(procedureName))
                    return dt;

                var con = CreateConnection();
                con.Open();
                dt.Load(con.ExecuteReader(procedureName, Params, commandTimeout: 250, commandType: CommandType.StoredProcedure));
                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper ExecuteStoreProcedure Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static bool ExecuteQuery(string query, object Params = null)
        {
            try
            {
                bool dt = false;
                if (string.IsNullOrEmpty(query))
                    return dt;

                var con = CreateConnection();
                con.Open();
                con.Query(query, Params, commandTimeout: 250);
                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper ExecuteQuery Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static int InsertUpdateStoreProcedure(string procedureName, object Params = null)
        {
            try
            {
                int dt = 0;
                if (string.IsNullOrEmpty(procedureName))
                    return dt;

                var con = CreateConnection();
                con.Open();
                var dbVal = con.ExecuteScalar(procedureName, Params, commandTimeout: 250, commandType: CommandType.StoredProcedure);
                dt = dbVal == DBNull.Value ? 0 : Convert.ToInt32(dbVal);

                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper InsertUpdateStoreProcedure Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static DataSet GetDataSetStoreProcedure(string procedureName, object Params = null)
        {
            try
            {
                DataSet ds = new DataSet();
                if (string.IsNullOrEmpty(procedureName))
                    return ds;

                var con = CreateConnection();
                con.Open();
                ds = ConvertDataReaderToDataSet(con.ExecuteReader(procedureName, Params, commandTimeout: 250, commandType: CommandType.StoredProcedure));
                con.Close();
                return ds;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper GetDataSetStoreProcedure Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }
        public static DataSet ConvertDataReaderToDataSet(IDataReader data)
        {
            DataSet ds = new DataSet();
            int i = 0;
            while (!data.IsClosed)
            {
                ds.Tables.Add("Table" + (i + 1));
                ds.EnforceConstraints = false;
                ds.Tables[i].Load(data);
                i++;
            }
            return ds;
        }
        public static void WriteLog(string strLog)
        {
            string logFilePath = @"C:\Logs\Log-Inventory-Tracker-" + System.DateTime.Today.ToString("MM-dd-yyyy") + "." + "txt";
            FileInfo logFileInfo = new FileInfo(logFilePath);
            DirectoryInfo logDirInfo = new DirectoryInfo(logFileInfo.DirectoryName);
            if (!logDirInfo.Exists) logDirInfo.Create();
            using (FileStream fileStream = new FileStream(logFilePath, FileMode.Append))
            {
                using (StreamWriter log = new StreamWriter(fileStream))
                {
                    log.WriteLine(strLog);
                }
            }
        }

        public static void Log(string tableName, string notes, bool isError = true)
        {
            try
            {
                WriteLog(notes);
                notes = isError ? notes.Replace("'", "''") : "Error: " + notes.Replace("'", "''");
                var currentInstance = HttpContext.Current.Session["instance_name"].ToString();
                SqlConnection con = new SqlConnection(sqldb_connection == null ? GlobalClass.GlobalConnectionString_Master : sqldb_connection + currentInstance);
                string query = "insert into [TransactionLog] (TableName,LogDateTime,Note) values('" + tableName + "',getdate(),'" + notes + "')";
                SqlCommand cmd = new SqlCommand(query, con);
                con.Open();
                cmd.ExecuteNonQuery();
                con.Close();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Common Database Functions Master Connection
        public static DataTable Get_Master(string query, object Params = null)
        {
            try
            {
                DataTable dt = new DataTable();
                if (string.IsNullOrEmpty(query))
                    return dt;

                var con = CreateMasterConnection();
                con.Open();
                dt.Load(con.ExecuteReader(query, Params, commandTimeout: 250));
                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper Get_Master Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }
        public static int InsertUpdateDelete_Master(string query, object Params = null)
        {
            try
            {
                int noOfRecords = 0;
                if (string.IsNullOrEmpty(query))
                    return noOfRecords;

                var con = CreateMasterConnection();
                con.Open();

                noOfRecords = con.Execute(query, Params, commandTimeout: 250);
                con.Close();
                return noOfRecords;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper InsertUpdateDelete Master Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }

        public static DataTable ExecuteStoreProcedure_Master(string procedureName, object Params = null)
        {
            try
            {
                DataTable dt = new DataTable();
                if (string.IsNullOrEmpty(procedureName))
                    return dt;

                var con = CreateMasterConnection();
                con.Open();
                dt.Load(con.ExecuteReader(procedureName, Params, commandTimeout: 250, commandType: CommandType.StoredProcedure));
                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper ExecuteStoreProcedure_Master Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }
        public static int InsertUpdateStoreProcedure_Master(string procedureName, object Params = null)
        {
            try
            {
                int dt = 0;
                if (string.IsNullOrEmpty(procedureName))
                    return dt;

                var con = CreateMasterConnection();
                con.Open();
                var dbVal = con.ExecuteScalar(procedureName, Params, commandTimeout: 250, commandType: CommandType.StoredProcedure);
                dt = dbVal == DBNull.Value ? 0 : Convert.ToInt32(dbVal);

                con.Close();
                return dt;
            }
            catch (Exception ex)
            {
                Log("CommonDatabaseOperationHelper InsertUpdateStoreProcedure_Master Dapper", ex.Message + "==>" + ex.StackTrace, true);
                throw;
            }
        }


        #endregion

        #region Dapper Connection


        public static IDbConnection CreateConnection()
        {
            var currentInstance = HttpContext.Current.Session["instance_name"].ToString();
            var connection = new SqlConnection(sqldb_connection + currentInstance);
            return connection;
        }
        public static IDbConnection CreateMasterConnection()
        {
            var connection = new SqlConnection(GlobalClass.GlobalConnectionString_Master);
            return connection;
        }

        #endregion
    }
}