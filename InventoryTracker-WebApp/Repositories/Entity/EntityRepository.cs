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
        public List<EntityHeader> GetEntityHeaders(string searchString, int startIndex, int endIndex)
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
                        $" where ed.Ent_Value like '%" + searchString + "%'" +
                        $" or eh.ENT_TYPE like '%" + searchString + "%' " +
                        $" or eh.ENT_NAME like '%" + searchString + "%' " +
                        $" or eq.UNIT_ID  like '%" + searchString + "%') t2 order by  CURRENT_TIMESTAMP offset " + startIndex + " rows FETCH NEXT 30 rows only";
                }
                else
                {
                    query = "Select * From  (Select [ENT_ID] ,[ENT_TYPE] ,[ENT_NAME] ,[ASSIGNED] FROM [dbo].[ENTITY_HDR]) t2 order by  CURRENT_TIMESTAMP offset " + startIndex + " rows FETCH NEXT 30 rows only";
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
        public List<EntityHeader> GetEntityHeaderfromEntityEquipment(string searchString, int startIndex, int endIndex, string startDate)
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (!string.IsNullOrEmpty(searchString))
                {
                    query = $"Select * from (select Distinct eh.* ";

                    if (!string.IsNullOrEmpty(startDate))
                    {
                        query += ", (SELECT count(*) FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea where eea.ENT_ID = eh.[ENT_ID] and ('" + startDate + "' between eea.Start_Date and eea.End_Date)) as [Active] ";
                    }

                    query += "from ENTITY_HDR as eh " +
                        $" left join Entity_Dtl  as ed on eh.ENT_ID = ed.ENT_ID" +
                        $" where ed.Ent_Value like '%" + searchString + "%'" +
                        $" or eh.ENT_TYPE like '%" + searchString + "%' " +
                        $" or eh.ENT_NAME like '%" + searchString + "%') t2 order by  CURRENT_TIMESTAMP offset " + startIndex + " rows FETCH NEXT 30 rows only";
                }
                else
                {
                    query = "Select * From  (Select [ENT_ID] ,[ENT_TYPE] ,[ENT_NAME] ,[ASSIGNED]";
                    if (!string.IsNullOrEmpty(startDate))
                    {
                        query += ", (SELECT count(*) FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea where eea.ENT_ID = eh.[ENT_ID] and ('" + startDate + "' between eea.Start_Date and eea.End_Date)) as [Active] ";
                    }
                    query += " FROM [dbo].[ENTITY_HDR] as eh) t2 order by  CURRENT_TIMESTAMP offset " + startIndex + " rows FETCH NEXT 30 rows only";
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
        public int GetEntityHeaderRowCount()
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try {
                connection.Open();
                string query = "Select Count(*) from [ENTITY_HDR]";
                int a = connection.Query<int>(query).FirstOrDefault();
                return a;
            }
            catch(Exception ex) {
                throw;
            }
            finally
            {
                connection.Close();
            }
        }

        public List<EntityTemplate> GetEntityTemplates(string entityType)
        {
            List<EntityTemplate> entityTemplates = new List<EntityTemplate>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
                        query += "INSERT INTO [dbo].[Entity_Template]([Ent_type],[Prop_name],[Datatype],[Sequence]) VALUES ('" + template.Ent_type.Trim() + "','" + template.Prop_name.Trim() + "','" + template.Datatype + "' , " + template.Sequence + ");";
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
        public bool RemoveEntityEquipmentTemplateDetail(int deatailID, int isEntity)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                if (isEntity == 1)
                {
                    query += "DELETE FROM [Entity_Dtl] WHERE [Ent_Dtl_ID] =" + deatailID;
                }
                else
                {
                    query += "DELETE FROM [Equipment_Dtl] WHERE [Equip_Dtl_ID] = " + deatailID;
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
        public List<EntityDetail> GetEntityTemplateDetails(int entityID, string startDate)
        {
            List<EntityDetail> entityDetailList = new List<EntityDetail>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "SELECT [Ent_Dtl_ID],[Ent_ID],ed.[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date],et.Prop_name,et.Datatype FROM [dbo].[Entity_Dtl] as ed join[dbo].[Entity_Template] as et on ed.Ent_Temp_ID = et.Ent_temp_id";

                if (entityID > 0 && !string.IsNullOrEmpty(startDate))
                {
                    query += " where Ent_ID =" + entityID + " and ('" + startDate + "' between Start_Date and End_Date)";
                }
                else if (entityID > 0)
                {
                    query += " where Ent_ID =" + entityID;
                }
                else if (!string.IsNullOrEmpty(startDate))
                {
                    query += " where ('" + startDate + "' between Start_Date and End_Date)";
                }

                query += "order by et.Sequence";
                entityDetailList = connection.Query<EntityDetail>(query).ToList();
                EntityDetailListByDtl(ref entityDetailList);
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityDetailList;
        }
        public List<EntityDetail> GetAllEntityTemplateProp(int entityID)
        {
            List<EntityDetail> entityDetailList = new List<EntityDetail>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "Select DISTINCT(et.Prop_name),et.Ent_type,et.Datatype,et.Sequence,'01-01-9999' as End_Date,'' as Ent_Value,GETDATE() as Start_Date,(Select Ent_Temp_ID from Entity_Template et1 Where et1.Ent_type = et.Ent_type AND et1.Prop_name = et.Prop_name) as Ent_Temp_ID from [Entity_Dtl] as ed inner join [dbo].ENTITY_HDR as eh on eh.ENT_ID = ed.Ent_ID \r\njoin [dbo].[Entity_Template] et on et.Ent_type = eh.ENT_TYPE";


                if (entityID > 0)
                {
                    query += " where eh.Ent_ID =" + entityID;
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
        public void EntityDetailListByDtl(ref List<EntityDetail> entityDetails)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                int previousTempID = 0;
                foreach (var ed in entityDetails.OrderBy(x => x.Ent_Temp_ID))
                {
                    if (previousTempID == ed.Ent_Temp_ID)
                    {
                        continue;
                    }
                    previousTempID = ed.Ent_Temp_ID;
                    query = "SELECT [Ent_Dtl_ID],[Ent_ID],ed.[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date],et.Prop_name,et.Datatype FROM [dbo].[Entity_Dtl] as ed join[dbo].[Entity_Template] as et on ed.Ent_Temp_ID = et.Ent_temp_id where Ent_ID =" + ed.Ent_ID + " and et.Ent_Temp_ID = " + ed.Ent_Temp_ID;
                    var result = connection.Query<EntityDetail>(query).ToList();
                    ed.EntityDetailsByTemplate = result;
                }
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }
        public List<EntityDetail> EntityValueByPropName(string propName, string date)
        {
            List<EntityDetail> entityDetailList = new List<EntityDetail>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;

                query = "select ed.Ent_ID,ed.Ent_Value from Entity_Dtl  as ed  join Entity_Template as et on ed.Ent_Temp_ID = et.Ent_temp_id and Prop_Name = '" + propName + "'  and ('" + date + "' between ed.Start_Date and ed.End_Date)";

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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                var selectQuery = string.Empty;
                var isSuccess = true;
                //selectQuery += "SELECT [ENT_ID] FROM [dbo].[ENTITY_HDR] where ENT_TYPE='" + entityHDR.ENT_TYPE + "' and ENT_NAME = '" + entityHDR.VENDOR + "' and UNIT_ID ='" + equipmentHDR.UNIT_ID + "'";
                //var isInsert = connection.Query<int>(selectQuery).FirstOrDefault();
                if (entityHDR.ENT_ID == 0)
                {
                    query += "INSERT INTO [dbo].[ENTITY_HDR] ([ENT_TYPE] ,[ENT_NAME]) OUTPUT Inserted.ENT_ID VALUES ('" + entityHDR.ENT_TYPE.Trim() + "','" + entityHDR.ENT_NAME.Trim() + "')";
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
                                var isRecordOfRangeQuery = "SELECT count(*) FROM [dbo].[Entity_Dtl] where Ent_ID = " + entityHDR.ENT_ID + " and Ent_Temp_ID = " + ed.Ent_Temp_ID + " and  (" + startDate + " between Start_Date and End_Date)";
                                var isRecordOfRange = connection.Query<int>(isRecordOfRangeQuery).FirstOrDefault();
                                if (isRecordOfRange == 0)
                                {
                                    //var insertUpdate = "UPDATE [dbo].[Entity_Dtl]  SET [End_Date] = " + startDate + " WHERE [Ent_Dtl_ID] = " + ed.Ent_Dtl_ID + "; ";
                                    endDate = Convert.ToDateTime(startDate.Replace("'", "")) > Convert.ToDateTime(endDate.Replace("'", "")) ? startDate : endDate;
                                    var insertUpdate = "INSERT INTO [dbo].[Entity_Dtl] ([Ent_ID],[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date]) VALUES (" + entityHDR.ENT_ID + "," + ed.Ent_Temp_ID + ",'" + ed.Ent_Value + "'," + startDate + "," + endDate + ")";
                                    connection.Query<int>(insertUpdate).FirstOrDefault();
                                }
                                else
                                {
                                    var isRecordOfEndRange = "SELECT Ent_Dtl_ID FROM [dbo].[Entity_Dtl] where Ent_ID = " + entityHDR.ENT_ID + " and Ent_Temp_ID = " + ed.Ent_Temp_ID + " and  (" + endDate + " between Start_Date and End_Date) and End_Date = '01/01/9999'";
                                    var entDtlID = connection.Query<int>(isRecordOfEndRange).FirstOrDefault();
                                    if (entDtlID > 0)
                                    {
                                        var insertUpdate = "UPDATE [dbo].[Entity_Dtl]  SET [End_Date] = " + endDate + " WHERE [Ent_Dtl_ID] = " + entDtlID + "; ";
                                         insertUpdate += "INSERT INTO [dbo].[Entity_Dtl] ([Ent_ID],[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date]) VALUES (" + entityHDR.ENT_ID + "," + ed.Ent_Temp_ID + ",'" + ed.Ent_Value + "'," + endDate + ",'01/01/9999')";
                                        connection.Query<int>(insertUpdate).FirstOrDefault();
                                    }
                                    else
                                    {
                                        isSuccess = false;
                                    }
                                }
                            }

                        }
                    }
                }
                return isSuccess;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public bool CheckDuplicateEntityHDR(EntityHeader entityHeader)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;

                query = "SELECT count(*) FROM [dbo].[ENTITY_HDR] where [ENT_TYPE] = '" + entityHeader.ENT_TYPE + "' and [ENT_NAME] = '" + entityHeader.ENT_NAME + "'";
                var totalCount = connection.Query<int>(query).FirstOrDefault();
                if (totalCount > 0)
                {
                    return true;
                }
                return false;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public List<dynamic> ExportEntity(string startDate, string searchString)
        {
            List<dynamic> entities = new List<dynamic>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;

                query = "DECLARE  @columns NVARCHAR(MAX) = ''; SELECT @columns += QUOTENAME(prop_name) + ',' FROM (select distinct prop_name from Entity_Template) s	 ORDER BY  prop_name;PRINT @columns; SET @columns = LEFT(@columns, LEN(@columns) - 1); PRINT @columns; DECLARE @query varchar(max); set @query = 'SELECT * FROM   ( select eh.ENT_ID ,eh.ENT_NAME ,et.Prop_name,ed.Ent_Value from ENTITY_HDR eh inner join Entity_Dtl ed on ed.Ent_ID = eh.ENT_ID inner join Entity_Template et ON ed.Ent_temp_id = et.Ent_temp_id ";
                if (!string.IsNullOrEmpty(searchString))
                {
                    query += "and  eh.ENT_NAME like ''%" + searchString + "%'' or Prop_name like ''%" + searchString + "%''";
                }
                query += ") t  PIVOT( max(Ent_Value)  FOR prop_name IN ('+@columns+') ) AS pivot_table;' exec (@query)";
                entities = connection.Query<dynamic>(query).ToList();
                return entities;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public bool UpdateTemplateDetails(string startDate, List<string> columnHeader, List<string> values)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                for (int i = 2; i < columnHeader.Count; i++)
                {
                    query += "UPDATE [dbo].[Entity_Dtl] SET  [Ent_Value] = '" + values[i] + "' WHERE Ent_ID = " + values[0] + " and Ent_Temp_ID = (select top 1 [Ent_temp_id] FROM  [dbo].[Entity_Template] where [Ent_type] = (SELECT top 1 [ENT_TYPE] FROM [dbo].[ENTITY_HDR] where ENT_NAME = '" + values[1] + "') and [Prop_name] = '" + columnHeader[i] + "');"; //and Start_Date = " + startDate + "
                }
                var isUpdated = connection.Query<bool>(query).FirstOrDefault();
                return isUpdated;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }
        public bool InsertTemplateDetails(List<string> columnHeader, List<string> values)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                query = "declare @ENTID int = 0; declare @ENTTempID int = 0; IF ((select count(ENT_ID) from ENTITY_HDR where ENT_TYPE = '" + values[0] + "' and ENT_NAME ='" + values[1] + "'))  = 0  BEGIN INSERT INTO [ENTITY_HDR] ([ENT_TYPE],[ENT_NAME],[ASSIGNED]) Values ('" + values[0].Trim() + "','" + values[1].Trim() + "',0) End SET @ENTID = (select top 1 ENT_ID from ENTITY_HDR where ENT_TYPE = '" + values[0] + "' and ENT_NAME ='" + values[1] + "')";
                for (int i = 2; i < columnHeader.Count; i = i + 3)
                {
                    var sDate = values[i + 1];
                    var startDate = Convert.ToDateTime(sDate).Year + "-" + Convert.ToDateTime(sDate).Month + "-" + Convert.ToDateTime(sDate).Day;
                    var eDate = values[i + 2];
                    var endDate = Convert.ToDateTime(eDate).Year + "-" + Convert.ToDateTime(eDate).Month + "-" + Convert.ToDateTime(eDate).Day;
                    query += "SET @ENTTempID = (select top 1 Ent_temp_id from Entity_Template where ENT_TYPE = '" + values[0] + "' and Prop_name= '" + columnHeader[i] + "')IF ((select count(Ent_Dtl_ID) from Entity_Dtl where Ent_ID = @ENTID and Ent_Temp_ID = @ENTTempID and Ent_Value = '" + values[i] + "'))  = 0  BEGIN  INSERT INTO [dbo].[Entity_Dtl] ([Ent_ID],[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date]) VALUES (@ENTID,@ENTTempID,'" + values[i].Trim() + "','" + startDate + "','" + endDate + "')End SET @ENTTempID = 0;";
                }
                var isInserted = connection.Query<bool>(query).FirstOrDefault();
                return isInserted;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public List<dynamic> ExportEntityEquipmentAssign(string startDate, string searchString, string columns)
        {
            List<dynamic> equipments = new List<dynamic>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                if (string.IsNullOrEmpty(columns))
                {
                    query = " select distinct eh.EQUIP_ID ,eh.EQUIP_TYPE,eh.VENDOR,eh.UNIT_ID  from EQUIPMENT_HDR eh left join Equipment_Dtl ed on ed.Equip_ID = eh.EQUIP_ID left join Equipment_Template et ON ed.Equip_Temp_ID = et.Equip_Temp_ID";
                    if (!string.IsNullOrEmpty(searchString))
                    {
                        query += " where  eh.EQUIP_TYPE like '%" + searchString + "%' or eh.VENDOR like '%" + searchString + "%' or eh.UNIT_ID like '%" + searchString + "%' or  ed.Eq_Value like '%" + searchString + "%'";
                    }
                }
                else
                {
                    query = "DECLARE  @columns NVARCHAR(MAX) = ''; SELECT @columns += '" + columns + "' ; PRINT @columns; DECLARE @query varchar(max); set @query = 'SELECT * FROM   ( select eh.[EQUIP_ID] ,eh.[EQUIP_TYPE],eh.[VENDOR],eh.[UNIT_ID],et.Prop_name,ed.[Eq_Value] from [EQUIPMENT_HDR] eh inner join Equipment_Dtl ed on ed.[Equip_ID] = eh.[EQUIP_ID] inner join Equipment_Template et ON ed.[Equip_Temp_ID] = et.[Equip_Temp_ID]";
                    if (!string.IsNullOrEmpty(searchString))
                    {
                        query += " where  eh.EQUIP_TYPE like ''%" + searchString + "%'' or eh.VENDOR like ''%" + searchString + "%'' or eh.UNIT_ID like ''%" + searchString + "%'' or  ed.Eq_Value like ''%" + searchString + "%''";
                    }
                    query += ") t  PIVOT( max(Eq_Value)  FOR prop_name IN ('+@columns+') ) AS pivot_table;' exec (@query)";
                }
                equipments = connection.Query<dynamic>(query).ToList();
                return equipments;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public List<EntityHeader> GetAllEntityHeaders(string entityName = null)
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = "select ENT_ID,ENT_TYPE,ENT_NAME from ENTITY_HDR";
                if (!string.IsNullOrEmpty(entityName))
                {
                    query += " where ENT_NAME='" + entityName + "'";
                }
                entityHeaders = connection.Query<EntityHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityHeaders;
        }

        public bool UpdateInsertEQUENTASS(string startDate, List<string> columnHeader, List<string> values, out string totalNewAssigned, out int totalRemoved, out string invalidEntityName)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            var date = Convert.ToDateTime(startDate).ToString("MM/d/yyyy").Replace("-", "/");
            try
            {
                var distValues = values.Distinct().ToList();
                int removed = 0;
                connection.Open();
                string newInvalidEntity = string.Empty;
                var query = string.Empty;
                query = "Declare @entIDList varchar(max)=''";
                var firstIndexOfUnitID = columnHeader.IndexOf("Entity Name");
                for (int i = firstIndexOfUnitID; i < distValues.Count; i++)
                {
                    if (!string.IsNullOrEmpty(distValues[i]))
                    {
                        if (GetAllEntityHeaders(distValues[i]).Count == 0)
                        {
                            newInvalidEntity += distValues[i] + ",";
                        }
                        else
                        {
                            query += " IF (select count(*) from EQUIPMENT_ENTITY_ASSIGNMENT where EQUIP_ID = " + distValues[0] + " and ENT_ID = (select top 1 ENT_ID from ENTITY_HDR where ENT_NAME = '" + distValues[i] + "'))  = 0 BEGIN SET @entIDList += CONVERT(varchar(100), (select top 1 ENT_ID from ENTITY_HDR where ENT_NAME='" + distValues[i] + "')) + ','; INSERT INTO [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT]([ENT_ID],[EQUIP_ID],[START_DATE],[END_DATE])VALUES((select top 1 ENT_ID from ENTITY_HDR where ENT_NAME = '" + distValues[i] + "')," + distValues[0] + ",'" + date + "','01/01/9999'); UPDATE [dbo].[EQUIPMENT_HDR] SET [ASSIGNED] =(select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where EQUIP_ID =" + distValues[0] + "),0)) WHERE  EQUIP_ID = " + distValues[0] + "; UPDATE [dbo].[ENTITY_HDR] SET [ASSIGNED] = (select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID =(select top 1 ENT_ID from ENTITY_HDR where ENT_NAME='" + distValues[i] + "')),0)) WHERE  ENT_ID = (select top 1 ENT_ID from ENTITY_HDR where ENT_NAME='" + distValues[i] + "') END ";
                        }
                    }
                }
                var queryForUpdate = "select ENT_NAME  from (SELECT * from [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] where EQUIP_ID = " + distValues[0] + "  and ('" + date + "' between Start_Date and End_Date)) as eea left join ENTITY_HDR as eh on eh.ENT_ID = eea.ENT_ID";
                var entityNames = connection.Query<string>(queryForUpdate).ToList();
                foreach (var entityName in entityNames)
                {
                    if (!distValues.Contains(entityName))
                    {
                        query += "  UPDATE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] SET [END_DATE] = '" + date + "' WHERE EQUIP_ID = " + distValues[0] + " and ENT_ID = (select top 1 ENT_ID from ENTITY_HDR where ENT_NAME = '" + entityName + "')  and ('" + date + "' between Start_Date and End_Date) ";
                        removed++;
                    }
                }
                totalRemoved = removed;
                totalNewAssigned = "";
                invalidEntityName = newInvalidEntity;
                if (!string.IsNullOrEmpty(query))
                {
                    query += "select @entIDList;";
                    var isUpdated = connection.Query<string>(query).ToList();
                    totalNewAssigned = isUpdated[0];
                    return true;
                }

                return false;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }


        public bool InsertTemplate(List<string> columnHeader, List<string> values, bool isEntity)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                if (isEntity)
                {
                    query += "IF ((SELECT COUNT(*) FROM [Entity_Template] WHERE [Ent_type] = '" + values[0] + "' AND [Prop_name] ='" + values[1] + "'))  = 0 BEGIN INSERT INTO [Entity_Template] ([Ent_type],[Prop_name],[Datatype],[Sequence]) VALUES('" + values[0].Trim() + "','" + values[1].Trim() + "','" + values[2].Trim() + "'," + values[3] + ") END";
                }
                else
                {
                    query += "IF ((SELECT COUNT(*) FROM Equipment_Template WHERE Equipment_Type = '" + values[0] + "' AND [Prop_name] ='" + values[1] + "'))  = 0 BEGIN INSERT INTO [Equipment_Template] ([Equipment_Type],[Prop_Name],[Datatype],[Sequence]) VALUES('" + values[0].Trim() + "','" + values[1].Trim() + "','" + values[2].Trim() + "'," + values[3] + ") END";
                }
                var isInserted = connection.Query<bool>(query).FirstOrDefault();
                return true;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public string IsValidEntityTemplate(List<string> columnHeader, string entityType)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string columnHeaderVal = string.Empty;
                for (int i = 2; i < columnHeader.Count; i = i + 3)
                {
                    var query = string.Empty;
                    query += "Declare @isValidColum bit = 1; IF ((SELECT COUNT(*) FROM Entity_Template WHERE Ent_type = '" + entityType + "' AND [Prop_name] ='" + columnHeader[i] + "'))  = 0 BEGIN SET @isValidColum = 0; End select @isValidColum;";
                    bool isValidEntity = connection.Query<bool>(query).FirstOrDefault();
                    if (!isValidEntity)
                    {
                        columnHeaderVal = columnHeader[i];
                        break;
                    }
                }
                return columnHeaderVal;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public List<EntityDetail> GetAllEntityTemplateDetails()
        {
            List<EntityDetail> entityDetails = new List<EntityDetail>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "SELECT [Ent_Dtl_ID],[Ent_ID],ed.[Ent_Temp_ID],[Ent_Value],[Start_Date],[End_Date],et.Prop_name,et.Datatype FROM [dbo].[Entity_Dtl] as ed join[dbo].[Entity_Template] as et on ed.Ent_Temp_ID = et.Ent_temp_id";

                entityDetails = connection.Query<EntityDetail>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityDetails;
        }
    }
}