using InventoryTracker_WebApp.Domain.MultiInstance;
using Newtonsoft.Json;
using System;
using System.Web.Mvc;

namespace InventoryTracker_WebApp.Controllers
{
    public class MultiInstanceController : Controller
    {
        private readonly IMultiInstanceRepository _multiInstanceRepository;

        public MultiInstanceController(IMultiInstanceRepository multiInstanceRepository)
        {
            this._multiInstanceRepository = multiInstanceRepository;
        }
        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public string GetAllInstance(string email)
        {
            try
            {
                var allInstance = _multiInstanceRepository.GetAllInstance(email);

                return JsonConvert.SerializeObject(new
                {
                    IsValid = true,
                    allInstance = allInstance
                });

            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }

        [HttpPost]
        public string AddNewInstanceName(string instanceName, string instanceNotes)
        {
            try
            {
                var result = _multiInstanceRepository.AddNewInstanceName(instanceName, instanceNotes);
                return JsonConvert.SerializeObject(new { IsValid = true, data = result });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }
        [HttpPost]
        public string DeleteInstance(string email, string instanceName)
        {
            try
            {
                var result = _multiInstanceRepository.DeleteInstance(email, instanceName);
                return JsonConvert.SerializeObject(new { IsValid = true, data = result });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = ex.Message });
            }
        }
    }
}