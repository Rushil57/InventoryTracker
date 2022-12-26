using InventoryTracker_WebApp.Domain.Admin;
using InventoryTracker_WebApp.Domain.Entity;
using InventoryTracker_WebApp.Domain.Equipment;
using InventoryTracker_WebApp.Domain.Login;
using InventoryTracker_WebApp.Domain.MultiInstance;
using InventoryTracker_WebApp.Domain.UserMaster;
using InventoryTracker_WebApp.Repositories.Admin;
using InventoryTracker_WebApp.Repositories.Entity;
using InventoryTracker_WebApp.Repositories.Equipment;
using InventoryTracker_WebApp.Repositories.Login;
using InventoryTracker_WebApp.Repositories.MultiInstance;
using InventoryTracker_WebApp.Repositories.UserMaster;
using System.Web.Mvc;
using Unity;
using Unity.Mvc5;

namespace InventoryTracker_WebApp
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = new UnityContainer();

            container.RegisterType<IEntityRepository, EntityRepository>();
            container.RegisterType<IEquipmentRepository, EquipmentRepository>();
            container.RegisterType<ILoginRepository,LoginRepository>();
            container.RegisterType<IAdminRepository,AdminRepository>();
            container.RegisterType<IUserMasterRepository,UserMasterRepository>();
            container.RegisterType<IMultiInstanceRepository,MultiInstanceRepository>();
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}