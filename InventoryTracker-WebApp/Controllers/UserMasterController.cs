using InventoryTracker_WebApp.Domain.Admin;
using InventoryTracker_WebApp.Domain.UserMaster;
using InventoryTracker_WebApp.Helpers;
using Newtonsoft.Json;
using System;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    [SessionTimeout]
    public class UserMasterController : Controller
    {
        private IUserMasterRepository _userMasterRepository;
        private IAdminRepository _adminRepository;
        public UserMasterController(IUserMasterRepository userMasterRepository, IAdminRepository adminRepository)
        {
            _userMasterRepository = userMasterRepository;
            _adminRepository = adminRepository;
        }
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public string DeleteUser(int id)
        {
            try
            {
                var result = _userMasterRepository.DeleteUser(id);
                return JsonConvert.SerializeObject(new { IsValid = result, Data = "" });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }

        [HttpPost]
        public string AddNewUser(string userName)
        {
            var result2 = "";
            try
            {
                var result = _userMasterRepository.AddNewUser(userName);

                if (result.Status)
                {
                    result2 = "User has been Created Successfully. ";
                    try
                    {
                        if (result.Data)
                        {
                            Helper.SendEmail(userName, result.Message, true,_adminRepository);
                        }

                    }
                    catch (Exception ex)
                    {
                        return JsonConvert.SerializeObject(new { IsValid = result.Status, Data = "", Message = result2 + "Email Not Sent." }); ;
                    }
                }
                else
                {
                    result2 = "User has not been created.";
                }
                return JsonConvert.SerializeObject(new { IsValid = result.Status, Data = "", Message = result2 });
            }
            catch (Exception ex)
            {
                result2 = "Something went wrong.PLease try again after some time.";
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message, Message = result2 });
            }
        }

        [HttpGet]
        public string GetAllUsers()
        {
            try
            {
                var allUsers = _userMasterRepository.GetAllUsers();
                return JsonConvert.SerializeObject(new
                {
                    IsValid = true,
                    allUsers = allUsers
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }

        public string ResetPassword(string UserEmail)
        {
            try
            {
                var result = _userMasterRepository.ResetPassword(UserEmail);
                if (result.Status)
                {
                    Helper.SendEmail(UserEmail, result.Message, false,_adminRepository);
                }
                return JsonConvert.SerializeObject(new { IsValid = result.Status, Data = "", Message = "Password Reset Successful." });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message, Message = "Something went wrong. Please try again after some time." });
            }
        }
    }
}