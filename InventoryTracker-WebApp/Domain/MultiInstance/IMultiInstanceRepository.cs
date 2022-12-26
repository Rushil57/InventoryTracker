namespace InventoryTracker_WebApp.Domain.MultiInstance
{
    public interface IMultiInstanceRepository
    {
        string GetAllInstance(string email);
        string AddNewInstanceName(string instanceName, string instanceNotes);
        string DeleteInstance(string email, string instanceName);
    }
}
