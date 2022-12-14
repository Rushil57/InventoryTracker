using InventoryTracker_WebApp.Helpers;
using InventoryTracker_WebApp.Models;
using System.Collections.Generic;
using System;
using Dapper;
using System.Linq;
using InventoryTracker_WebApp.Domain.Equipment;

namespace InventoryTracker_WebApp.Repositories.Equipment
{
    public class EquipmentRepository : IEquipmentRepository
    {
        public List<EquipmentHeader> GetEquipmentHeaders(string searchString,int startRow,int endRow)
        {
            List<EquipmentHeader> equipmentHeaders = new List<EquipmentHeader>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (!string.IsNullOrEmpty(searchString))
                {
                    query = $"Select * from (select distinct eqh.* from EQUIPMENT_HDR as eqh " +
                        $" left join Equipment_Dtl  as ed on eqh.EQUIP_ID = ed.Equip_ID " +
                        $" left join EQUIPMENT_ENTITY_ASSIGNMENT as eqea on eqea.EQUIP_ID = eqh.EQUIP_ID " +
                        $" left join ENTITY_HDR as eh on eh.ENT_ID = eqea.ENT_ID " +
                        $" where ed.Eq_Value like '%" + searchString + "%'" +
                        $" or eqh.EQUIP_TYPE like '%" + searchString + "%'" +
                        $" or eqh.VENDOR  like '%" + searchString + "%'" +
                        $" or eqh.UNIT_ID  like '%" + searchString + "%'" +
                        $" or eh.ENT_NAME like '%" + searchString + "%') t1 order by  CURRENT_TIMESTAMP offset " + startRow + " rows FETCH NEXT 30 rows only";
                }
                else
                {
                    query = "Select * From  (Select [EQUIP_ID] ,[EQUIP_TYPE] ,[VENDOR] ,[UNIT_ID] ,[ASSIGNED] From [dbo].[EQUIPMENT_HDR]) t2 order by  CURRENT_TIMESTAMP offset " + startRow + " rows FETCH NEXT 30 rows only";
                }
                equipmentHeaders = connection.Query<EquipmentHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentHeaders;
        }
        public List<EquipmentHeader> GetEquipmentHeadersfromEquipmentEntity(string searchString,int startRow,int endRow)
        {
            List<EquipmentHeader> equipmentHeaders = new List<EquipmentHeader>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (!string.IsNullOrEmpty(searchString))
                {
                    query = $"Select * from (select distinct eqh.* from EQUIPMENT_HDR as eqh " +
                        $" left join Equipment_Dtl  as ed on eqh.EQUIP_ID = ed.Equip_ID " +
                        $" where ed.Eq_Value like '%"+searchString+"%'" +
                        $" or eqh.EQUIP_TYPE like '%"+searchString+"%'" +
                        $" or eqh.VENDOR  like '%"+searchString+ "%'" +
                        $" or eqh.UNIT_ID  like '%"+searchString+"%') t1 order by  CURRENT_TIMESTAMP offset "+startRow+" rows FETCH NEXT 30 rows only";
                }
                else
                {
                    query = "Select * From  (Select [EQUIP_ID] ,[EQUIP_TYPE] ,[VENDOR] ,[UNIT_ID] ,[ASSIGNED] From [dbo].[EQUIPMENT_HDR]) t2 order by  CURRENT_TIMESTAMP offset " + startRow + " rows FETCH NEXT 30 rows only";
                }
                equipmentHeaders = connection.Query<EquipmentHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentHeaders;
        }

        public List<EquipmentTemplate> GetEquipmentTemplates(string equipmentType)
        {
            List<EquipmentTemplate> equipmentTemplates = new List<EquipmentTemplate>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (equipmentType == null)
                {
                    query = "SELECT Distinct [Equipment_Type] ,[Prop_Name] FROM [dbo].[Equipment_Template]";
                }
                else
                {
                    query = "SELECT [Equip_Temp_ID] ,[Equipment_Type] ,[Prop_Name] ,[Datatype] ,[Sequence] FROM [dbo].[Equipment_Template] Where Equipment_Type = '" + equipmentType + "' order by Sequence";
                }
                equipmentTemplates = connection.Query<EquipmentTemplate>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentTemplates;
        }

        public bool SaveEquipmentTemplate(List<EquipmentTemplate> equipmentTemplate)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                //EquipmentHeader getEquipmentHeader = GetEquipmentHeaders().Where(x => x.EQUIP_TYPE.Trim().ToLower() == equipmentHeader[0].EQUIP_TYPE.Trim().ToLower()).FirstOrDefault();
                //if (getEquipmentHeader == null)
                //{
                //    query += "INSERT INTO [dbo].[EQUIPMENT_HDR] ([EQUIP_TYPE],[VENDOR] ,[UNIT_ID]) VALUES ('" + equipmentHeader[0].EQUIP_TYPE + "','" + equipmentHeader[0].VENDOR + "','" + equipmentHeader[0].UNIT_ID + "')";
                //}
                var equipmentTempID = equipmentTemplate.Select(x => x.Equip_Temp_ID).ToList().Aggregate("", (current, next) => current + "," + next);
                equipmentTempID = equipmentTempID.Substring(equipmentTempID.IndexOf(",") + 1);

                query += "Delete ed FROM [dbo].[Equipment_Dtl] as ed join[dbo].[Equipment_Template] as et on ed.Equip_Temp_ID = et.Equip_Temp_ID and et.Equipment_Type = '" + equipmentTemplate[0].Equipment_Type + "' and ed.Equip_Temp_ID not in(" + equipmentTempID + ")";

                query += "DELETE FROM [dbo].[Equipment_Template] WHERE [Equip_Temp_ID] not in(" + equipmentTempID + ") and Equipment_Type ='" + equipmentTemplate[0].Equipment_Type + "';";

                foreach (var template in equipmentTemplate)
                {
                    if (template.Equip_Temp_ID == 0)
                    {
                        query += "INSERT INTO [dbo].[Equipment_Template] ([Equipment_Type],[Prop_Name],[Datatype] ,[Sequence]) VALUES ('" + template.Equipment_Type.Trim() + " ','" + template.Prop_Name.Trim() + " ','" + template.Datatype + "' , " + template.Sequence + ");";
                    }
                    else
                    {
                        query += "Update [dbo].[Equipment_Template] SET [Prop_name] = '" + template.Prop_Name.Trim() + "',[Sequence] = " + template.Sequence + " WHERE [Equip_Temp_ID] = " + template.Equip_Temp_ID;
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

        public bool DeleteEquipment(string equipmentType)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                query += "DELETE ed  FROM [dbo].[Equipment_Dtl] as ed  join  [dbo].[Equipment_Template] as et on ed.Equip_Temp_ID = et.Equip_Temp_ID and et.Equipment_Type= '" + equipmentType + "';";
                query += "DELETE FROM [dbo].[Equipment_Template] WHERE [Equipment_Type] = '" + equipmentType + "' ;";
                //DELETE FROM[dbo].[EQUIPMENT_HDR] WHERE[EQUIP_TYPE] = '" + equipmentType + "';
                connection.Query<bool>(query).ToList();
                return true;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public bool SaveEquipmentHDR(EquipmentHeader equipmentHDR, List<EquipmentDetail> equipmentDtl)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                var selectQuery = string.Empty;

                selectQuery += "SELECT [EQUIP_ID] FROM [dbo].[EQUIPMENT_HDR] where EQUIP_TYPE='" + equipmentHDR.EQUIP_TYPE + "' and VENDOR = '" + equipmentHDR.VENDOR + "' and UNIT_ID ='" + equipmentHDR.UNIT_ID + "'";
                var isInsert = connection.Query<int>(selectQuery).FirstOrDefault();
                if (isInsert == 0)
                {
                    query += "INSERT INTO [dbo].[EQUIPMENT_HDR] ([EQUIP_TYPE] ,[VENDOR] ,[UNIT_ID]) OUTPUT Inserted.EQUIP_ID VALUES('" + equipmentHDR.EQUIP_TYPE + "','" + equipmentHDR.VENDOR + "','" + equipmentHDR.UNIT_ID + "')";
                    var lastHDRID = connection.Query<int>(query).FirstOrDefault();
                    var detailInsertQuery = string.Empty;
                    if (equipmentDtl.Count > 0)
                    {
                        foreach (var ed in equipmentDtl)
                        {
                            var startDate = ed.Start_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.Start_Date.Year + "-" + ed.Start_Date.Month + "-" + ed.Start_Date.Day) + "'";
                            var endDate = ed.End_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.End_Date.Year + "-" + ed.End_Date.Month + "-" + ed.End_Date.Day) + "'";
                            detailInsertQuery += "INSERT INTO [dbo].[Equipment_Dtl] ([Equip_ID] ,[Equip_Temp_ID] ,[Eq_Value] ,[Start_Date] ,[End_Date]) VALUES (" + lastHDRID + "," + ed.Equip_Temp_ID + ",'" + ed.Eq_Value + "'," + startDate + "," + endDate + ")";
                        }
                        connection.Query<int>(detailInsertQuery).FirstOrDefault();

                    }
                }
                else
                {
                    var detailInsertQuery = string.Empty;
                    if (equipmentDtl.Count > 0)
                    {
                        foreach (var ed in equipmentDtl)
                        {
                            var startDate = ed.Start_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.Start_Date.Year + "-" + ed.Start_Date.Month + "-" + ed.Start_Date.Day) + "'";
                            var endDate = ed.End_Date.ToString("dd/mm/yyyy") == "01-00-0001" ? "NULL" : "'" + (ed.End_Date.Year + "-" + ed.End_Date.Month + "-" + ed.End_Date.Day) + "'";

                            detailInsertQuery = "SELECT count([Equip_Dtl_ID]) FROM [dbo].[Equipment_Dtl] where[Equip_Dtl_ID] = " + ed.Equip_Dtl_ID + " and Start_Date = (select CONVERT(DAtetime, " + startDate + ")) and End_Date = (select CONVERT(DAtetime," + endDate + "))";

                            var recordCount = connection.Query<int>(detailInsertQuery).FirstOrDefault();
                            if (recordCount > 0)
                            {
                                var update = "UPDATE [dbo].[Equipment_Dtl]  SET [Eq_Value] = '" + ed.Eq_Value + "' WHERE [Equip_Dtl_ID] = " + ed.Equip_Dtl_ID;
                                connection.Query<int>(update).FirstOrDefault();
                            }
                            else
                            {
                                var insertUpdate = "UPDATE [dbo].[Equipment_Dtl]  SET [End_Date] = " + startDate + " WHERE [Equip_Dtl_ID] = " + ed.Equip_Dtl_ID + "; ";
                                endDate = Convert.ToDateTime(startDate.Replace("'", "")) > Convert.ToDateTime(endDate.Replace("'", "")) ? startDate : endDate;
                                insertUpdate += "INSERT INTO [dbo].[Equipment_Dtl] ([Equip_ID] ,[Equip_Temp_ID] ,[Eq_Value] ,[Start_Date] ,[End_Date]) VALUES (" + equipmentHDR.EQUIP_ID + "," + ed.Equip_Temp_ID + ",'" + ed.Eq_Value + "'," + startDate + "," + endDate + ")";
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
            finally
            {
                connection.Close();
            }
        }

        public List<EquipmentDetail> EquipmentValueByPropName(string propName)
        {
            List<EquipmentDetail> equipmentDetails = new List<EquipmentDetail>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {

                connection.Open();
                string query = string.Empty;
                //if (propName == null)
                //{
                //    query = "SELECT Distinct [Equipment_Type] ,[Prop_Name] FROM [dbo].[Equipment_Template]";
                //}
                //else
                //{
                query = "select ed.Equip_ID,ed.Eq_Value  from Equipment_Dtl  as ed join Equipment_Template as et on ed.Equip_Temp_ID = et.Equip_Temp_ID and Prop_Name = '" + propName + "'";
                //}
                equipmentDetails = connection.Query<EquipmentDetail>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentDetails;
        }

        public List<EquipmentDetail> GetEquipmentTemplateDetails(int equipID, string startDate)
        {
            List<EquipmentDetail> equipmentDetails = new List<EquipmentDetail>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {

                connection.Open();
                string query = string.Empty;
                query += "SELECT [Equip_Dtl_ID] ,[Equip_ID] ,ed.[Equip_Temp_ID] ,et.Prop_Name ,[Eq_Value] ,[Start_Date] ,[End_Date],et.Datatype FROM [dbo].[Equipment_Dtl] as ed join [dbo].[Equipment_Template] as et on ed.Equip_Temp_ID = et.Equip_Temp_ID";
                if (equipID > 0 && !string.IsNullOrEmpty(startDate))
                {
                    query += " where Equip_ID =" + equipID + " and Start_Date = '" + startDate + "'";
                }
                else if (equipID > 0)
                {
                    query += " where Equip_ID =" + equipID;
                }
                else if (!string.IsNullOrEmpty(startDate))
                {
                    query += " where Start_Date = '" + startDate + "'";
                }
                equipmentDetails = connection.Query<EquipmentDetail>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentDetails;
        }

        public List<EntityHeader> GetEquipmentEntityAssignment(int equipID)
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {

                connection.Open();
                string query = string.Empty;
                query += "SELECT eh.[ENT_ID] ,[ENT_TYPE] ,[ENT_NAME],eea.START_DATE, eea.END_DATE FROM [dbo].[ENTITY_HDR] as eh join  [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea on eh.ENT_ID = eea.ENT_ID and eea.EQUIP_ID = " + equipID;
                entityHeaders = connection.Query<EntityHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityHeaders;
        }

        public bool DeleteEquipmentHeader(int equipID)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "DELETE FROM [dbo].[Equipment_Dtl] WHERE Equip_ID = " + equipID;
                query += "DELETE FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] WHERE EQUIP_ID = " + equipID;
                query += "DELETE FROM [dbo].[EQUIPMENT_HDR] where EQUIP_ID = " + equipID;
                connection.Query<bool>(query).ToList();
                return true;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public bool EquipmentEntityAssignment(int entityID, int equipID, string startDate, int isDelete, string endDate)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (isDelete == 2)
                {
                    query = "UPDATE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] SET [END_DATE] = '" + endDate + "' WHERE  EQUIP_ID = " + equipID + "and ENT_ID = " + entityID;
                }
                else
                {
                    if (isDelete == 0)
                    {
                        query = "INSERT INTO [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] ([EQUIP_ID],[ENT_ID],[START_DATE],[END_DATE]) VALUES(" + equipID + "," + entityID + ",'" + startDate + "','" + endDate + "');";
                    }
                    else
                    {
                        query = "DELETE FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] WHERE EQUIP_ID = " + equipID + " and ENT_ID = " + entityID;
                    }

                    query += "UPDATE [dbo].[EQUIPMENT_HDR] SET [ASSIGNED] =(select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where EQUIP_ID =" + equipID + "),0)) WHERE  EQUIP_ID = " + equipID;

                    query += "UPDATE [dbo].[ENTITY_HDR] SET [ASSIGNED] = (select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID =" + entityID + "),0)) WHERE  ENT_ID = " + entityID;

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

        public List<EquipmentEntityAssignment> GetEquipmentEntityAssignment(string startDate)
        {
            List<EquipmentEntityAssignment> equipmentEntityAssignments = new List<EquipmentEntityAssignment>();
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                string query = string.Empty;

                query = "SELECT [EQUIP_ENT_ID] ,eea.[EQUIP_ID] ,eea.[ENT_ID],eh.UNIT_ID,enh.ENT_NAME  FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea join EQUIPMENT_HDR  as eh on eea.EQUIP_ID = eh.EQUIP_ID join ENTITY_HDR as enh on eea.ENT_ID = enh.ENT_ID";

                if (!string.IsNullOrEmpty(startDate))
                {
                    query += " and eea.Start_Date = '" + startDate + "'";
                }
                equipmentEntityAssignments = connection.Query<EquipmentEntityAssignment>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentEntityAssignments;
        }

        public bool CheckDuplicateEquipmentHDR(EquipmentHeader equipmentHeader)
        {
            var connection = CommonDatabaseOperationHelper.CreateMasterConnection();
            try
            {
                connection.Open();
                var query = string.Empty;

                query = "SELECT count(*) FROM [dbo].[EQUIPMENT_HDR] where [EQUIP_TYPE] = '" + equipmentHeader.EQUIP_TYPE + "' and [VENDOR] = '" + equipmentHeader.VENDOR + "' and [UNIT_ID] = '" + equipmentHeader.UNIT_ID + "'";
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
    }
}