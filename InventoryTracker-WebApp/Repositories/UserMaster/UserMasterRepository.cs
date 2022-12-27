using InventoryTracker_WebApp.Domain.UserMaster;
using InventoryTracker_WebApp.Helpers;
using InventoryTracker_WebApp.Models;
using Newtonsoft.Json;
using System;
using System.Data;
using System.Web;

namespace InventoryTracker_WebApp.Repositories.UserMaster
{
    public class UserMasterRepository : IUserMasterRepository
    {
        public CommonResponseModel<bool> AddNewUser(string userName)
        {
            CommonResponseModel<bool> responseModel = new CommonResponseModel<bool>();
            try
            {
                string password = Helper.RandomString(10);
                password = Helper.EncryptString(password);
                var id = CommonDatabaseOperationHelper.InsertUpdateDeleteWithScalar($"INSERT INTO USERS(USER_EMAIL) OUTPUT INSERTED.ID VALUES(@UserName)", new { @UserName = userName });

                var currentInstance = HttpContext.Current.Session["instance_name"].ToString();
                var query = $"INSERT INTO MASTER_USER (user_email, instance_name, inserted_on) VALUES (@UserName,@CurrentInstance,GETDATE())";
                CommonDatabaseOperationHelper.InsertUpdateDelete_Master(query, new { @UserName = userName, @CurrentInstance = currentInstance });
                responseModel.Data = false;

                string query1 = $"SELECT u.id,u.Password FROM UserDetail u WHERE u.user_email=@UserName ORDER BY u.id";
                DataTable dt = CommonDatabaseOperationHelper.Get_Master(query1, new { @UserName = userName });
                if (dt.Rows.Count == 0)
                {
                    var query2 = $"INSERT INTO UserDetail (user_email, password,reset_password) VALUES (@UserName,@Password,1)";
                    CommonDatabaseOperationHelper.InsertUpdateDelete_Master(query2, new { @UserName = userName, @Password = password });
                    responseModel.Data = true;
                }
                responseModel.Status = true;
                responseModel.Message = Helper.DecryptString(password);
                return responseModel;
            }
            catch (Exception ex)
            {
                responseModel.Status = false;
                responseModel.Message = ex.Message;
                return responseModel;
            }
        }

        public CommonResponseModel<bool> CheckifUserExist(string userEmail)
        {
            CommonResponseModel<bool> responseModel = new CommonResponseModel<bool>();
            try
            {

                string query1 = $"SELECT u.id,u.Password FROM UserDetail u WHERE u.user_email=@UserName ORDER BY u.id";
                DataTable dt = CommonDatabaseOperationHelper.Get_Master(query1, new { @UserName = userEmail });
                if (dt.Rows.Count == 0)
                {
                    responseModel.Status = false;
                    responseModel.Data = false;
                    responseModel.Message = "No User Found.";
                }
                else
                {
                    responseModel.Status = true;
                    responseModel.Data = true;
                    responseModel.Message = "User Email already exists.";
                }
            }
            catch (Exception ex)
            {
                responseModel.Status = true;
                responseModel.Data = true;
                responseModel.Message = ex.Message;
            }
            return responseModel;
        }
        public CommonResponseModel<string> CreateNewUser(string userEmail)
        {
            CommonResponseModel<string> responseModel = new CommonResponseModel<string>();
            try
            {
                string password = Helper.RandomString(10);
                password = Helper.EncryptString(password);
                var query2 = $"INSERT INTO UserDetail (user_email, password,reset_password) VALUES (@UserName,@Password,1)";
                CommonDatabaseOperationHelper.InsertUpdateDelete_Master(query2, new { @UserName = userEmail, @Password = password });
                responseModel.Status = true;
                responseModel.Data = Helper.DecryptString(password);
                responseModel.Message = "User Created Successfully.";
            }
            catch (Exception ex)
            {
                responseModel.Status = false;
                responseModel.Message = ex.Message;
            }
            return responseModel;
        }
        public ResponseModel ResetPassword(string UserEmail)
        {
            ResponseModel responseModel = new ResponseModel();

            try
            {
                string query1 = $"SELECT u.id,u.password FROM UserDetail u WHERE u.user_email=@UserEmail ORDER BY u.id";
                DataTable dt = CommonDatabaseOperationHelper.Get_Master(query1, new { @UserEmail = UserEmail });
                if (dt.Rows.Count > 0)
                {
                    string newPassword = Helper.RandomString(10);
                    newPassword = Helper.EncryptString(newPassword);
                    var query = $"UPDATE UserDetail SET password =@Password, reset_password = 1 Where user_email= @UserEmail";
                    CommonDatabaseOperationHelper.InsertUpdateDelete_Master(query, new { @Password = newPassword, @UserEmail = UserEmail });
                    responseModel.Status = true;
                    responseModel.Message = Helper.DecryptString(newPassword);
                }

                return responseModel;
            }
            catch (Exception ex)
            {
                responseModel.Status = false;
                responseModel.Message = ex.Message;
                return responseModel;
            }
        }
        
        public ResponseModel ChangePassword(string newPassword, string oldPassword)
        {
            ResponseModel responseModel = new ResponseModel();

            try
            {
                var userId = Convert.ToString(HttpContext.Current.Session["Email"]);
                string query1 = $"SELECT u.id,u.password FROM UserDetail u WHERE u.user_email=@UserId ORDER BY u.id";
                DataTable dt = CommonDatabaseOperationHelper.Get_Master(query1, new { @UserId = userId });
                if (dt.Rows.Count > 0)
                {
                    var cmpPassword = dt.Rows[0]["Password"];
                    cmpPassword = Helper.DecryptString(Convert.ToString(cmpPassword));
                    if (cmpPassword.Equals(oldPassword))
                    {
                        newPassword = Helper.EncryptString(newPassword);
                        var query = $"UPDATE UserDetail SET password =@Password, reset_password = 0 Where user_email= @UserId";
                        CommonDatabaseOperationHelper.InsertUpdateDelete_Master(query, new { @Password = newPassword, @UserId = userId });
                        responseModel.Status = true;
                        responseModel.Message = "Password Changed Successfully.";
                    }
                    else
                    {
                        responseModel.Status = false;
                        responseModel.Message = "Old Password is Invalid.";
                    }
                }
                return responseModel;
            }
            catch (Exception ex)
            {
                responseModel.Status = false;
                responseModel.Message = ex.Message;
                return responseModel;
            }
        }
        public string GetAllUsers()
        {
            try
            {
                string query = $"SELECT * FROM USERS";
                DataTable dt = CommonDatabaseOperationHelper.Get(query);
                return JsonConvert.SerializeObject(dt);
            }
            catch (Exception e)
            {
                throw;
            }
        }

        public bool DeleteUser(int id)
        {
            try
            {
                var query = $"select USER_EMAIL from USERS where ID=@Id";
                var deleteEmail = CommonDatabaseOperationHelper.Scalar(query, new { @Id = id });
                var currentInstance = HttpContext.Current.Session["instance_name"].ToString();
                query = $"DELETE FROM MASTER_USER where user_email= @DeleteEmail and instance_name= @CurrentInstance";
                CommonDatabaseOperationHelper.InsertUpdateDelete_Master(query, new { @DeleteEmail = deleteEmail, @CurrentInstance = currentInstance });
                
                query = $"DELETE FROM [USER_RELATION] WHERE [PARENT_USER_ID] = @Id OR [CHILD_USER_ID] = @Id; ";
                query += $"DELETE FROM USERROLES WHERE USER_ID = @Id; ";
                query += $"DELETE FROM USERS WHERE ID = @Id; ";
                CommonDatabaseOperationHelper.InsertUpdateDelete(query, new { @Id = id});

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}