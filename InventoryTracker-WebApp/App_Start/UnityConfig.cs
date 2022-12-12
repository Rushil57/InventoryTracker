using InventoryTracker_WebApp.Domain.Entity;
using InventoryTracker_WebApp.Domain.Equipment;
using InventoryTracker_WebApp.Repositories.Entity;
using InventoryTracker_WebApp.Repositories.Equipment;
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
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}