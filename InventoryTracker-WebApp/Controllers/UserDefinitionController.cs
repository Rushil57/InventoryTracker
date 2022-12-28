using InventoryTracker_WebApp.Domain.UserDefination;
using InventoryTracker_WebApp.Domain.UserMaster;
using InventoryTracker_WebApp.Helpers;
using Newtonsoft.Json;
using System;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    [SessionTimeout]
    public class UserDefinitionController : Controller
    {
        private IUserDefinationRepository _userDefinationRepository;
        private readonly IUserMasterRepository _userMasterRepository;

        public UserDefinitionController(IUserDefinationRepository adminRepository,IUserMasterRepository userMasterRepository)
        {
            _userDefinationRepository = adminRepository;
            this._userMasterRepository = userMasterRepository;
        }
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public string UpdateUsersRole(int roleId, int userId, bool isDelete, int parentId)
        {
            try
            {
                var result = _userDefinationRepository.UpdateUsersRole(roleId, userId, isDelete, parentId);
                return JsonConvert.SerializeObject(new { IsValid = result, Data = "" });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }

        [HttpGet]
        public string GetAllUsers()
        {
            try
            {
                var allUsers = _userMasterRepository.GetAllUsers();
                var adminUsers = _userDefinationRepository.GetAdminUsers();
                var managerUsers = _userDefinationRepository.GetManagerUsers();
                var otherUsers = _userDefinationRepository.GetOtherUsers();
                return JsonConvert.SerializeObject(new
                {
                    IsValid = true,
                    allUsers = allUsers,
                    adminUsers = adminUsers,
                    managerUsers = managerUsers,
                    otherUsers = otherUsers
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }
    }
}