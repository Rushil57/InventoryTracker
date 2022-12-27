﻿namespace InventoryTracker_WebApp.Domain.UserDefination
{
    public interface IUserDefinationRepository
    {
        string GetAllUsers();
        string GetAdminUsers();
        string GetManagerUsers();
        string GetOtherUsers();
        bool UpdateUsersRole(int roleId, int userId, bool isDelete, int parentId);
    }
}