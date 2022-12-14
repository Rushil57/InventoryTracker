using Dapper;
using InventoryTracker_WebApp.Domain.Entity;
using InventoryTracker_WebApp.Helpers;
using InventoryTracker_WebApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace InventoryTracker_WebApp.Repositories.Entity
{
    public class EntityRepository : IEntityRepository
    {
        public List<EntityHeader> GetEntityHeaders(string searchString,int startIndex,int endIndex)
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (!string.IsNullOrEmpty(searchString))
                {
                    query = $"Select * from (select Distinct eh.* from ENTITY_HDR as eh " +
                        $" left join Entity_Dtl  as ed on eh.ENT_ID = ed.ENT_ID" +
                        $" left join EQUIPMENT_ENTITY_ASSIGNMENT as eqea on eqea.ENT_ID = eh.ENT_ID" +
                        $" left join EQUIPMENT_HDR as eq on eq.EQUIP_ID = eqea.EQUIP_ID" +
                        $" where ed.Ent_Value like '%"+searchString+"%'" +
                        $" or eh.ENT_TYPE like '%" +searchString+"%' " +
                        $" or eh.ENT_NAME like '%"+searchString+"%' " +
                        $" or eq.UNIT_ID  like '%"+searchString+ "%') t2 order by  CURRENT_TIMESTAMP offset "+ startIndex +" rows FETCH NEXT 30 rows only";
                }
                else
                {
                    query = "Select * From  (Select [ENT_ID] ,[ENT_TYPE] ,[ENT_NAME] ,[ASSIGNED] FROM [dbo].[ENTITY_HDR]) t2 order by  CURRENT_TIMESTAMP offset "+ startIndex +" rows FETCH NEXT 30 rows only";
                }
                entityHeaders = connection.Query<EntityHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally
            {
                connection.Close();
            }
            return entityHeaders;
        }    
        public List<EntityHeader> GetEntityHeaderfromEntityEquipment(string searchString,int startIndex,int endIndex)
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (!string.IsNullOrEmpty(searchString))
                {
                    query = $"Select * from (select Distinct eh.* from ENTITY_HDR as eh " +
                        $" left join Entity_Dtl  as ed on eh.ENT_ID = ed.ENT_ID" +
                        $" where ed.Ent_Value like '%"+searchString+"%'" +
                        $" or eh.ENT_TYPE like '%" +searchString+"%' " +
                        $" or eh.ENT_NAME like '%"+searchString+"%') t2 order by  CURRENT_TIMESTAMP offset "+ startIndex +" rows FETCH NEXT 30 rows only";
                }
                else
                {
                    query = "Select * From  (Select [ENT_ID] ,[ENT_TYPE] ,[ENT_NAME] ,[ASSIGNED] FROM [dbo].[ENTITY_HDR]) t2 order by  CURRENT_TIMESTAMP offset "+ startIndex +" rows FETCH NEXT 30 rows only";
                }
                entityHeaders = connection.Query<EntityHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally
            {
                connection.Close();
            }
            return entityHeaders;
        }

        public List<EntityTemplate> GetEntityTemplates(string entityType)
        {
            List<EntityTemplate> entityTemplates = new List<EntityTemplate>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (entityType != null)
                {
                    query = "SELECT [Ent_temp_id],[Ent_type] ,[Prop_name],[Datatype],[Sequence] FROM [dbo].[Entity_Template] Where Ent_type = '" + entityType + "' order by Sequence";
                }
                else
                {
                    query = "SELECT Distinct [Ent_type],[Prop_Name] FROM [dbo].[Entity_Template]";
                }
                entityTemplates = connection.Query<EntityTemplate>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally
            {
                connection.Close();
            }
            return entityTemplates;
        }

        public bool SaveEntityTemplate(List<EntityTemplate> entityTemplate)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                //EntityHeader entityHeader = GetEntityHeaders().Where(x => x.ENT_TYPE.Trim().ToLower() == entityTemplate[0].Ent_type.Trim().ToLower()).FirstOrDefault();
                //if (entityHeader == null)
                //{
                //    query += "INSERT INTO [dbo].[ENTITY_HDR] ([ENT_TYPE] ,[ENT_NAME]) VALUES ('" + entityTemplate[0].Ent_type + "','" + entityTemplate[0].Ent_type + "')";
                //}
                var entityTempID = entityTemplate.Select(x => x.Ent_temp_id).ToList().Aggregate("", (current, next) => current + "," + next);
                entityTempID = entityTempID.Substring(entityTempID.IndexOf(",") + 1);

                query += "Delete ed FROM[dbo].[Entity_Dtl] as ed join[dbo].[Entity_Template] as et on ed.Ent_Temp_ID = et.Ent_temp_id and et.Ent_type ='" + entityTemplate[0].Ent_type + "' and ed.Ent_Temp_ID not in(" + entityTempID + ")";
                query += "DELETE FROM [dbo].[Entity_Template] WHERE [Ent_temp_id] not in(" + entityTempID + ") and Ent_type = '" + entityTemplate[0].Ent_type + "'";

                foreach (var template in entityTemplate)
                {
                    if (template.Ent_temp_id == 0)
                    {
                        query += "INSERT INTO [dbo].[Entity_Template]([Ent_type],[Prop_name],[Datatype],[Sequence]) VALUES ('" + template.Ent_type.Trim() + " ','" + template.Prop_name.Trim() + " ','" + template.Datatype + "' , " + template.Sequence + ");";
                    }
                    else
                    {
                        query += "Update [dbo].[Entity_Template] SET [Prop_name] = '" + template.Prop_name.Trim() + "',[Sequence] = " + template.Sequence + " WHERE [Ent_temp_id] = " + template.Ent_temp_id;
                    }

                }
                connection.Query<bool>(query).ToList();
                return true;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public bool DeleteEntityTemplates(string entityType)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                query += "DELETE ed FROM [dbo].[Entity_Dtl] as ed join  [dbo].[Entity_Template] as et on ed.Ent_Temp_ID = et.Ent_temp_id and et.Ent_type ='" + entityType + "' ;";
                query += "DELETE FROM [dbo].[Entity_Template] WHERE [Ent_type] = '" + entityType + "' ;";
                //"DELETE FROM [dbo].[ENTITY_HDR] WHERE [Ent_type] = '" + entityType + "' ;
                connection.Query<bool>(query).ToList();
                return true;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public List<EntityDetail> GetEntityTemplateDetails(int entityID, string startDate)
        {
            List<EntityDetail> entityDetailList = new List<EntityDetail>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "SELECT [Ent_Dtl_ID],[Ent_ID],ed.[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date],et.Prop_name,et.Datatype FROM [dbo].[Entity_Dtl] as ed join[dbo].[Entity_Template] as et on ed.Ent_Temp_ID = et.Ent_temp_id";

                if (entityID > 0 && !string.IsNullOrEmpty(startDate))
                {
                    query += " where Ent_ID =" + entityID + " and Start_Date = '" + startDate + "'";
                }
                else if (entityID > 0)
                {
                    query += " where Ent_ID =" + entityID;
                }
                else if (!string.IsNullOrEmpty(startDate))
                {
                    query += " where Start_Date = '" + startDate + "'";
                }

                query += "order by et.Sequence";
                entityDetailList = connection.Query<EntityDetail>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityDetailList;
        }

        public List<EntityDetail> EntityValueByPropName(string propName)
        {
            List<EntityDetail> entityDetailList = new List<EntityDetail>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;

                query = "select ed.Ent_ID,ed.Ent_Value from Entity_Dtl  as ed  join Entity_Template as et on ed.Ent_Temp_ID = et.Ent_temp_id and Prop_Name = '" + propName + "'";

                entityDetailList = connection.Query<EntityDetail>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityDetailList;
        }

        public List<EquipmentHeader> GetEntityEquipmentAssignment(int entityID)
        {
            List<EquipmentHeader> equipmentHeaderList = new List<EquipmentHeader>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "SELECT distinct eh.[EQUIP_ID],eh.[VENDOR],eh.[UNIT_ID],eh.[EQUIP_TYPE],eea.START_DATE, eea.END_DATE  FROM [dbo].[EQUIPMENT_HDR] as eh  join  [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea  on eh.EQUIP_ID = eea.EQUIP_ID and eea.ENT_ID = " + entityID;
                equipmentHeaderList = connection.Query<EquipmentHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentHeaderList;
        }

        public bool DeleteEntityHeader(int entityID)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "DELETE FROM [dbo].[Entity_Dtl] WHERE Ent_ID = " + entityID;
                query += "DELETE FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] WHERE [ENT_ID] = " + entityID;
                query += "DELETE FROM [dbo].[ENTITY_HDR] where ENT_ID = " + entityID;
                connection.Query<bool>(query).ToList();
                return true;
            }
            catch (Exception e)
            {
                throw;
            }
            finally
            {
                connection.Close();
            }
        }

        public bool SaveEntityHDR(EntityHeader entityHDR, List<EntityDetail> entityDtl)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                var selectQuery = string.Empty;

                //selectQuery += "SELECT [ENT_ID] FROM [dbo].[ENTITY_HDR] where ENT_TYPE='" + entityHDR.ENT_TYPE + "' and ENT_NAME = '" + entityHDR.VENDOR + "' and UNIT_ID ='" + equipmentHDR.UNIT_ID + "'";
                //var isInsert = connection.Query<int>(selectQuery).FirstOrDefault();
                if (entityHDR.ENT_ID == 0)
                {
                    query += "INSERT INTO [dbo].[ENTITY_HDR] ([ENT_TYPE] ,[ENT_NAME]) OUTPUT Inserted.ENT_ID VALUES ('" + entityHDR.ENT_TYPE + "','" + entityHDR.ENT_NAME + "')";
                    var lastHDRID = connection.Query<int>(query).FirstOrDefault();
                    var detailInsertQuery = string.Empty;
                    if (entityDtl.Count > 0)
                    {
                        foreach (var ed in entityDtl)
                        {
                            var startDate = ed.Start_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.Start_Date.Year + "-" + ed.Start_Date.Month + "-" + ed.Start_Date.Day) + "'";
                            var endDate = ed.End_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.End_Date.Year + "-" + ed.End_Date.Month + "-" + ed.End_Date.Day) + "'";
                            detailInsertQuery += "INSERT INTO [dbo].[Entity_Dtl] ([Ent_ID],[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date]) VALUES (" + lastHDRID + "," + ed.Ent_Temp_ID + ",'" + ed.Ent_Value + "'," + startDate + "," + endDate + ")";
                        }
                        connection.Query<int>(detailInsertQuery).FirstOrDefault();
                    }
                }
                else
                {
                    var detailInsertQuery = string.Empty;
                    if (entityDtl.Count > 0)
                    {
                        foreach (var ed in entityDtl)
                        {
                            var startDate = ed.Start_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.Start_Date.Year + "-" + ed.Start_Date.Month + "-" + ed.Start_Date.Day) + "'";
                            var endDate = ed.End_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.End_Date.Year + "-" + ed.End_Date.Month + "-" + ed.End_Date.Day) + "'";

                            detailInsertQuery = "SELECT count([Ent_Dtl_ID]) FROM [dbo].[Entity_Dtl] where Ent_Dtl_ID = " + ed.Ent_Dtl_ID + " and Start_Date = (select CONVERT(Datetime, " + startDate + ")) and End_Date = (select CONVERT(Datetime," + endDate + "))";

                            var recordCount = connection.Query<int>(detailInsertQuery).FirstOrDefault();
                            if (recordCount > 0)
                            {
                                var update = "UPDATE [dbo].[Entity_Dtl]  SET [Ent_Value] = '" + ed.Ent_Value + "' WHERE [Ent_Dtl_ID] = " + ed.Ent_Dtl_ID;
                                connection.Query<int>(update).FirstOrDefault();
                            }
                            else
                            {
                                var insertUpdate = "UPDATE [dbo].[Entity_Dtl]  SET [End_Date] = " + startDate + " WHERE [Ent_Dtl_ID] = " + ed.Ent_Dtl_ID + "; ";
                                endDate = Convert.ToDateTime(startDate.Replace("'", "")) > Convert.ToDateTime(endDate.Replace("'", "")) ? startDate : endDate;
                                insertUpdate += "INSERT INTO [dbo].[Entity_Dtl] ([Ent_ID],[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date]) VALUES (" + entityHDR.ENT_ID + "," + ed.Ent_Temp_ID + ",'" + ed.Ent_Value + "'," + startDate + "," + endDate + ")";
                                connection.Query<int>(insertUpdate).FirstOrDefault();
                            }

                        }
                    }
                }
                return true;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }
    }
}