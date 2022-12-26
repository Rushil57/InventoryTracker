using InventoryTracker_WebApp.Domain.Login;
using InventoryTracker_WebApp.Helpers;
using System;
using System.Collections.Generic;
using System.Data;

namespace InventoryTracker_WebApp.Repositories.Login
{
    public class LoginRepository : ILoginRepository
    {
        public List<dynamic> IsValidRequestAccess(string email, string password)
        {
            List<dynamic> result = new List<dynamic>();
            try
            {
                password = Helper.EncryptString(password);
                string query = $"SELECT u.Id, u.User_email,u.Reset_password,u.Password FROM UserDetail u WHERE u.User_email=@Email AND U.Password = @Password";
                DataTable dt = CommonDatabaseOperationHelper.Get_Master(query, new { @Email = email, @Password = password });
                if (dt.Rows.Count > 0)
                {
                    var firstRow = dt.Rows[0];
                    var obj = new
                    {
                        id = firstRow["id"],
                        USER_EMAIL = firstRow["user_email"],
                        ResetPassword = firstRow["reset_password"],
                        Password = firstRow["password"]
                    };
                    result.Add(obj);
                }
            }
            catch (Exception ex)
            {
                CommonDatabaseOperationHelper.Log("Login IsValidRequestAccess", ex.Message + "==>" + ex.StackTrace, true);
            }
            return result;
        }
    }
}

