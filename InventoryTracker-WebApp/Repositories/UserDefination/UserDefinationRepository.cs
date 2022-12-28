using InventoryTracker_WebApp.Domain.UserDefination;
using InventoryTracker_WebApp.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace InventoryTracker_WebApp.Repositories.UserDefination
{
    public class UserDefinationRepository : IUserDefinationRepository
    {
        public bool UpdateUsersRole(int roleId, int userId, bool isDelete, int parentId)
        {
            try
            {
                var query = string.Empty;
                if (isDelete)
                {
                    query = $"DELETE FROM USERROLES WHERE USER_ID = @UserId AND ROLE_ID = @RoleId;";
                    if (roleId == 3)
                        query += $"DELETE FROM USER_RELATION WHERE PARENT_USER_ID = @ParentId AND CHILD_USER_ID = @UserId;";
                    else if (roleId == 2)
                        query += $"DELETE FROM USER_RELATION WHERE PARENT_USER_ID = @UserId;";
                }
                else
                {
                    query = $"If Not Exists(select * from USERROLES where [USER_ID]=@UserId and [ROLE_ID] = @RoleId) Begin INSERT INTO USERROLES VALUES(@UserId, @RoleId) end; ";
                    if (roleId == 3)
                        query += $"INSERT INTO USER_RELATION VALUES(@ParentId, @UserId)";
                }

                CommonDatabaseOperationHelper.InsertUpdateDelete(query, new { @UserId = userId, @RoleId = roleId, @ParentId = parentId });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public string GetAdminUsers()
        {
            try
            {
                string query = $"select U.ID, U.USER_EMAIL from USERS U inner join USERROLES UR on u.ID = UR.USER_ID where UR.ROLE_ID = 1";
                DataTable dt = CommonDatabaseOperationHelper.Get(query);
                return JsonConvert.SerializeObject(dt);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public string GetManagerUsers()
        {
            try
            {
                string query = $"select U.ID, U.USER_EMAIL from USERS U inner join USERROLES UR on u.ID = UR.USER_ID where UR.ROLE_ID = 2";
                DataTable managerDt = CommonDatabaseOperationHelper.Get(query);

                var parentList = managerDt.AsEnumerable().Select(x => Convert.ToInt32(x["ID"])).Distinct().ToList().ToArray();
                List<dynamic> parents = new List<dynamic>();
                if (parentList.Length > 0)
                {
                    query = $"select  U.ID, U.USER_EMAIL, UR.PARENT_USER_ID  from USERS U inner join USER_RELATION UR on u.ID = UR.CHILD_USER_ID WHERE UR.PARENT_USER_ID IN ({string.Join(",", parentList)})";
                    DataTable otherUserDt = CommonDatabaseOperationHelper.Get(query);
                    List<dynamic> chilldren = new List<dynamic>();
                    foreach (var item in managerDt.AsEnumerable().ToList<dynamic>())
                    {
                        chilldren = otherUserDt.AsEnumerable().Where(x => Convert.ToInt32(x["PARENT_USER_ID"]) == Convert.ToInt32(item["ID"])).Select(x => new {
                            ID = Convert.ToInt32(x["ID"]),
                            PARENT_USER_ID = Convert.ToInt32(x["PARENT_USER_ID"]),
                            USER_EMAIL = x["USER_EMAIL"],
                        }).ToList<dynamic>();
                        var obj = new
                        {
                            ID = Convert.ToInt32(item["ID"]),
                            USER_EMAIL = item["USER_EMAIL"],
                            OTHER_USERS = chilldren
                        };
                        parents.Add(obj);
                    }
                }


                return JsonConvert.SerializeObject(parents);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public string GetOtherUsers()
        {
            try
            {
                string query = $"select U.ID, U.USER_EMAIL from USERS U inner join USERROLES UR on u.ID = UR.USER_ID where UR.ROLE_ID = 3";
                DataTable dt = CommonDatabaseOperationHelper.Get(query);
                return JsonConvert.SerializeObject(dt);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}