using System;
using System.Web;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Helpers
{
    public class SessionTimeoutAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            try
            {
                var session = HttpContext.Current.Session;
                if (session == null || string.IsNullOrEmpty(Convert.ToString(session["UserId"])) || string.IsNullOrEmpty(Convert.ToString(session["RoleId"])))
                {
                    session.Abandon();
                    filterContext.Result = new RedirectResult("~/Login");
                    return;
                }
                else
                {
                    var absolutePath = filterContext.HttpContext.Request.Url.AbsolutePath;
                    if (Convert.ToBoolean(session["ResetPassword"]) && !absolutePath.StartsWith("/ResetPassword"))
                    {
                        filterContext.Result = new RedirectResult("~/ResetPassword");
                        return;
                    }
                    else
                    {
                        return;
                    }
                }
            }
            catch (Exception)
            {
                filterContext.Result = new RedirectResult("~/Login");
                return;
            }

            base.OnActionExecuting(filterContext);
        }
    }
}