using InventoryTracker_WebApp.Helpers;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    [SessionTimeout]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}