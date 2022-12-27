using InventoryTracker_WebApp.Domain.Admin;
using InventoryTracker_WebApp.Domain.Login;
using InventoryTracker_WebApp.Domain.UserMaster;
using Newtonsoft.Json;
using System;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    public class LoginController : Controller
    {
        private readonly ILoginRepository _loginRepository;
        private readonly IUserMasterRepository _userMasterRepository;
        private readonly IAdminRepository _adminRepository;

        public LoginController(ILoginRepository loginRepository,IUserMasterRepository userMasterRepository,IAdminRepository adminRepository)
        {
            this._loginRepository = loginRepository;
            this._userMasterRepository = userMasterRepository;
            this._adminRepository = adminRepository;
        }
        public ActionResult Index()
        {
            return View();
        }
        public string IsValidRequestAccess(string email, string password)
        {
            try
            {
                var result = _loginRepository.IsValidRequestAccess(email, password);
                var session = System.Web.HttpContext.Current.Session;
                if (result.Count > 0)
                {
                    var res = result[0];
                    session["Email"] = email;
                    session["UserId"] = res.id;
                    session["RoleId"] = 1;
                    session["ResetPassword"] = result[0].ResetPassword;
                    session["Password"] = result[0].Password;
                    return JsonConvert.SerializeObject(new { IsValid = true, Data = result[0] });
                }
                else
                {
                    return JsonConvert.SerializeObject(new { IsValid = false, Data = "" });
                }

            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }

        [HttpPost]
        public string CreateNewUser(string userName)
        {
            var result2 = "";
            try
            {
                var response = _userMasterRepository.CheckifUserExist(userName);
                if (!response.Status)
                {
                    var result = _userMasterRepository.CreateNewUser(userName);

                    if (result.Status)
                    {

                        result2 = "User Created Successfully. Login Credentails are sent to registered email address.";
                        try
                        {
                            if (result.Status)
                            {
                                SendEmail(userName, result.Data, true);
                            }

                        }
                        catch (Exception ex)
                        {
                            return JsonConvert.SerializeObject(new { IsValid = result.Status, Data = "", Message = result2 }); ;
                        }
                    }
                    else
                    {
                        result2 = "User has not been created.";
                    }

                    return JsonConvert.SerializeObject(new { IsValid = result.Status, Data = "", Message = result2 });
                }
                else
                {
                    return JsonConvert.SerializeObject(new { IsValid = response.Status, Data = "", Message = response.Message });
                }
            }
            catch (Exception ex)
            {
                result2 = "Something went wrong.PLease try again after some time.";
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message, Message = result2 });
            }
        }
        public string SendEmail(string userName, string Password, bool flag)
        {
            try
            {
                string subject = "Login Credentials for Inventory Tracker System";
                string bodyString = $@"<p>Hello {userName},<p>
                    <br>
                    {(flag == true ? "<p>Welcome to Inventory Tracker System.<p>" : "<p>Your Password has been Reset.</p>")}
                    
                    <p>Your Login Credentials are mentioned below.<p>
                   
                    <p>UserName: {userName}<p>
                    <p>Password: {Password}<p>
                    <br>
                    <p>Thanks & Regards,</p>
                    <p>Inventory Tracker</p>";
                return _adminRepository.SendEmail(bodyString, userName, subject);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public string ResetPassword(string userEmail)
        {
            try
            {
                var response = _userMasterRepository.CheckifUserExist(userEmail);
                if (response.Status)
                {
                    var result = _userMasterRepository.ResetPassword(userEmail);
                    if (result.Status)
                    {
                        SendEmail(userEmail, result.Message, false);
                    }
                    return JsonConvert.SerializeObject(new { IsValid = result.Status, Data = "", Message = "Password Reset Successful. Login credentials are sent to registered email address." });
                }
                else
                {
                    return JsonConvert.SerializeObject(new { IsValid = response.Status, Data = "", Message = "No User Found." });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message, Message = "Something went wrong. Please try again after some time." });
            }
        }

        public string HomeRequestAccess(string email, string instance_name)
        {
            try
            {
                var session = HttpContext.Session;
                session["instance_name"] = instance_name;
                var result = _loginRepository.IsValidRequestAccessByInstance(email, instance_name);
                if (result.Count > 0)
                {
                    session["UserId"] = result[0].ID;
                    session["Email"] = email;
                    session["instance_name"] = instance_name;
                    return JsonConvert.SerializeObject(new { IsValid = true, Data = result[0] });
                }
                else
                {
                    return JsonConvert.SerializeObject(new { IsValid = false, Data = "" });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult Signout()
        {
            Session["instance_name"] = null;
            HttpContext.Session.Abandon();
            return RedirectToAction("Index", "Login");
        }
    }
}