using InventoryTracker_WebApp.Helpers;
using InventoryTracker_WebApp.Models;
using System.Collections.Generic;
using System;
using Dapper;
using System.Linq;
using InventoryTracker_WebApp.Domain.Equipment;
using System.Web.UI.WebControls;

namespace InventoryTracker_WebApp.Repositories.Equipment
{
    public class EquipmentRepository : IEquipmentRepository
    {
        public List<EquipmentHeader> GetEquipmentHeaders(string searchString, int startRow, int endRow)
        {
            List<EquipmentHeader> equipmentHeaders = new List<EquipmentHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
        public int GetTotalCountEquipmentHeaders()
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = "Select Count(*) from EQUIPMENT_HDR";
                int a = connection.Query<int>(query).FirstOrDefault();
                return a;
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                connection.Close();
            }

        }
        public List<EquipmentHeader> GetEquipmentHeadersfromEquipmentEntity(string searchString, int startRow, int endRow, string startDate)
        {
            List<EquipmentHeader> equipmentHeaders = new List<EquipmentHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (!string.IsNullOrEmpty(searchString))
                {
                    query = $"Select * from (select distinct eqh.* ";

                    if (!string.IsNullOrEmpty(startDate))
                    {
                        query += ", (SELECT count(*) FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea where eea.EQUIP_ID = eqh.[EQUIP_ID] and ('" + startDate + "' between eea.Start_Date and eea.End_Date)) as [Active] ";
                    }

                    query += "from EQUIPMENT_HDR as eqh " +
                    $" left join Equipment_Dtl  as ed on eqh.EQUIP_ID = ed.Equip_ID " +
                    $" where ed.Eq_Value like '%" + searchString + "%'" +
                    $" or eqh.EQUIP_TYPE like '%" + searchString + "%'" +
                    $" or eqh.VENDOR  like '%" + searchString + "%'" +
                    $" or eqh.UNIT_ID  like '%" + searchString + "%') t1 order by  CURRENT_TIMESTAMP offset " + startRow + " rows FETCH NEXT 30 rows only";
                }
                else
                {
                    query = "Select * From  (Select [EQUIP_ID] ,[EQUIP_TYPE] ,[VENDOR] ,[UNIT_ID] ,[ASSIGNED] ";

                    if (!string.IsNullOrEmpty(startDate))
                    {
                        query += ", (SELECT count(*) FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea where eea.EQUIP_ID = eh.[EQUIP_ID] and ('" + startDate + "' between eea.Start_Date and eea.End_Date)) as [Active] ";
                    }
                    query += "From [dbo].[EQUIPMENT_HDR] as eh) t2 order by  CURRENT_TIMESTAMP offset " + startRow + " rows FETCH NEXT 30 rows only";

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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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

                        query += "INSERT INTO [dbo].[Equipment_Template] ([Equipment_Type],[Prop_Name],[Datatype] ,[Sequence]) VALUES ('" + template.Equipment_Type.Trim() + "','" + template.Prop_Name.Trim() + "','" + template.Datatype + "' , " + template.Sequence + ");";

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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                var selectQuery = string.Empty;
                bool isSuccess = true;
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
                                var isRecordOfRangeQuery = "SELECT count(*) FROM Equipment_Dtl where EQUIP_ID = " + equipmentHDR.EQUIP_ID + " and Equip_Temp_ID = " + ed.Equip_Temp_ID + " and  (" + startDate + " between Start_Date and End_Date)";
                                var isRecordOfRange = connection.Query<int>(isRecordOfRangeQuery).FirstOrDefault();
                                if (isRecordOfRange == 0)
                                {
                                    //var insertUpdate = "UPDATE [dbo].[Equipment_Dtl]  SET [End_Date] = " + startDate + " WHERE [Equip_Dtl_ID] = " + ed.Equip_Dtl_ID + "; ";
                                    endDate = Convert.ToDateTime(startDate.Replace("'", "")) > Convert.ToDateTime(endDate.Replace("'", "")) ? startDate : endDate;
                                    var insertUpdate = "INSERT INTO [dbo].[Equipment_Dtl] ([Equip_ID] ,[Equip_Temp_ID] ,[Eq_Value] ,[Start_Date] ,[End_Date]) VALUES (" + equipmentHDR.EQUIP_ID + "," + ed.Equip_Temp_ID + ",'" + ed.Eq_Value + "'," + startDate + "," + endDate + ")";
                                    connection.Query<int>(insertUpdate).FirstOrDefault();
                                }
                                else
                                {
                                    var isRecordOfEndRange = "SELECT Equip_Dtl_ID FROM Equipment_Dtl where EQUIP_ID = " + equipmentHDR.EQUIP_ID + " and Equip_Temp_ID = " + ed.Equip_Temp_ID + " and  (" + startDate + " between Start_Date and End_Date) and End_Date = '01/01/9999'";
                                    var equDtlID = connection.Query<int>(isRecordOfEndRange).FirstOrDefault();
                                    if (equDtlID > 0)
                                    {
                                        var insertUpdate = "UPDATE [dbo].[Equipment_Dtl]  SET [End_Date] = " + endDate + " WHERE [Equip_Dtl_ID] = " + equDtlID + "; ";
                                        endDate = Convert.ToDateTime(startDate.Replace("'", "")) > Convert.ToDateTime(endDate.Replace("'", "")) ? startDate : endDate;
                                        insertUpdate += "INSERT INTO [dbo].[Equipment_Dtl] ([Equip_ID] ,[Equip_Temp_ID] ,[Eq_Value] ,[Start_Date] ,[End_Date]) VALUES (" + equipmentHDR.EQUIP_ID + "," + ed.Equip_Temp_ID + ",'" + ed.Eq_Value + "'," + endDate + ",'01/01/9999')";
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
            finally
            {
                connection.Close();
            }
        }

        public List<EquipmentDetail> GetAllEquipmentTemplateProp(int equipID)
        {
            List<EquipmentDetail> entityDetailList = new List<EquipmentDetail>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                query += "Select DISTINCT(et.Prop_name),et.Equipment_Type,et.Datatype,et.[Sequence],eh.EQUIP_ID,'01-01-9999' as End_Date,'' as Eq_Value,GETDATE() as Start_Date,(Select Equip_Temp_ID from Equipment_Template et1 Where et1.Equipment_Type = et.Equipment_Type AND et1.Prop_name = et.Prop_name) as Equip_Temp_ID  from [Equipment_Dtl] as ed inner join [dbo].EQUIPMENT_HDR as eh on eh.EQUIP_ID = ed.EQUIP_ID \r\njoin [dbo].[Equipment_Template] et on et.Equipment_Type = eh.EQUIP_TYPE ";


                if (equipID > 0)
                {
                    query += " where eh.EQUIP_ID =" + equipID;
                }


                query += "order by et.Sequence";
                entityDetailList = connection.Query<EquipmentDetail>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityDetailList;
        }
        public List<EquipmentDetail> EquipmentValueByPropName(string propName, string date)
        {
            List<EquipmentDetail> equipmentDetails = new List<EquipmentDetail>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
                query = "select ed.Equip_ID,ed.Eq_Value  from Equipment_Dtl  as ed join Equipment_Template as et on ed.Equip_Temp_ID = et.Equip_Temp_ID and Prop_Name = '" + propName + "'  and ('" + date + "' between ed.Start_Date and ed.End_Date)";
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {

                connection.Open();
                string query = string.Empty;
                query += "SELECT [Equip_Dtl_ID] ,[Equip_ID] ,ed.[Equip_Temp_ID] ,et.Prop_Name ,[Eq_Value] ,[Start_Date] ,[End_Date],et.Datatype FROM [dbo].[Equipment_Dtl] as ed join [dbo].[Equipment_Template] as et on ed.Equip_Temp_ID = et.Equip_Temp_ID";
                if (equipID > 0 && !string.IsNullOrEmpty(startDate))
                {
                    query += " where Equip_ID =" + equipID + " and ('" + startDate + "' between Start_Date and End_Date)";
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
                EquipmentDetailListByDtl(ref equipmentDetails);
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentDetails;
        }
        public void EquipmentDetailListByDtl(ref List<EquipmentDetail> equipmentDetails)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                int previousTempID = 0;
                foreach (var ed in equipmentDetails.OrderBy(x => x.Equip_Temp_ID))
                {
                    if (previousTempID == ed.Equip_Temp_ID)
                    {
                        continue;
                    }
                    previousTempID = ed.Equip_Temp_ID;
                    query = "SELECT [Equip_Dtl_ID] ,[Equip_ID] ,ed.[Equip_Temp_ID] ,et.Prop_Name ,[Eq_Value] ,[Start_Date] ,[End_Date],et.Datatype FROM [dbo].[Equipment_Dtl] as ed join [dbo].[Equipment_Template] as et on ed.Equip_Temp_ID = et.Equip_Temp_ID  where Equip_ID =" + ed.Equip_ID + " and et.Equip_Temp_ID = " + ed.Equip_Temp_ID;
                    var result = connection.Query<EquipmentDetail>(query).ToList();
                    ed.EquipmentDetailsByTemplate = result;
                }
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }
        public List<EntityHeader> GetEquipmentEntityAssignmentBYEquipID(int equipID)
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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

        public bool EquipmentEntityAssignment(int entityID, int equipID, string startDate, int isDelete, string endDate, int equipEntID)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;
                if (isDelete == 2)
                {
                    query = "UPDATE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] SET [Start_DATE] = '" + startDate + "',[END_DATE] = '" + endDate + "' WHERE  EQUIP_ID = " + equipID + "and ENT_ID = " + entityID + "and EQUIP_ENT_ID = " + equipEntID;
                }
                else
                {
                    if (isDelete == 0)
                    {
                        query = "INSERT INTO [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] ([EQUIP_ID],[ENT_ID],[START_DATE],[END_DATE]) VALUES(" + equipID + "," + entityID + ",'" + startDate + "','" + endDate + "');";
                    }
                    else
                    {
                        query = "DELETE FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] WHERE EQUIP_ID = " + equipID + " and ENT_ID = " + entityID + " and EQUIP_ENT_ID = " + equipEntID;
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;

                query = "SELECT distinct [EQUIP_ENT_ID] ,eea.[EQUIP_ID] ,eea.[ENT_ID],eh.UNIT_ID,enh.ENT_NAME,eea.START_DATE,eea.END_DATE  FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea join EQUIPMENT_HDR  as eh on eea.EQUIP_ID = eh.EQUIP_ID join ENTITY_HDR as enh on eea.ENT_ID = enh.ENT_ID";

                if (!string.IsNullOrEmpty(startDate))
                {
                    query += " and ('" + startDate + "' between eea.Start_Date and eea.End_Date)";
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
            var connection = CommonDatabaseOperationHelper.CreateConnection();
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

        public List<dynamic> ExportEquipment(string startDate, string searchString)
        {
            List<dynamic> equipments = new List<dynamic>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;

                query = "DECLARE  @columns NVARCHAR(MAX) = ''; SELECT @columns += QUOTENAME(prop_name) + ',' FROM (select distinct prop_name from Equipment_Template) s	 ORDER BY  prop_name;PRINT @columns; SET @columns = LEFT(@columns, LEN(@columns) - 1); PRINT @columns; DECLARE @query varchar(max); set @query = 'SELECT * FROM   ( select eh.[EQUIP_ID] ,eh.[EQUIP_TYPE],eh.[VENDOR],eh.[UNIT_ID],et.Prop_name,ed.[Eq_Value] from [EQUIPMENT_HDR] eh inner join Equipment_Dtl ed on ed.[Equip_ID] = eh.[EQUIP_ID] inner join Equipment_Template et ON ed.[Equip_Temp_ID] = et.[Equip_Temp_ID]";
                if (!string.IsNullOrEmpty(searchString))
                {
                    query += "and  eh.EQUIP_TYPE like ''%" + searchString + "%'' or Prop_name like ''%" + searchString + "%'' or VENDOR like ''%" + searchString + "%'' or UNIT_ID like ''%" + searchString + "%''";
                }
                query += ") t  PIVOT( max(Eq_Value)  FOR prop_name IN ('+@columns+') ) AS pivot_table;' exec (@query)";
                equipments = connection.Query<dynamic>(query).ToList();
                return equipments;
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
                    query += "UPDATE [dbo].[Equipment_Dtl] SET  [Eq_Value] = '" + values[i].Replace("'", "''") + "' WHERE [Equip_ID] = " + values[0] + " and [Equip_Temp_ID] = (select top 1 Equip_Temp_ID FROM  [dbo].[Equipment_Template] where [Equipment_Type] ='" + values[1].Replace("'", "''") + "' and [Prop_name] = '" + columnHeader[i].Replace("'", "''") + "');"; //and Start_Date = " + startDate + "
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

        public List<dynamic> ExportEquipmentEntityAssign(string startDate, string searchString, string columns)
        {
            List<dynamic> entities = new List<dynamic>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                if (string.IsNullOrEmpty(columns))
                {
                    query = " select distinct eh.ENT_ID ,eh.ENT_NAME  from ENTITY_HDR eh left join Entity_Dtl ed on ed.Ent_ID = eh.ENT_ID left join Entity_Template et ON ed.Ent_temp_id = et.Ent_temp_id";
                    if (!string.IsNullOrEmpty(searchString))
                    {
                        query += " where  eh.ENT_NAME like '%" + searchString + "%' or ed.Ent_Value like '%" + searchString + "%'";
                    }
                }
                else
                {
                    query = "DECLARE  @columns NVARCHAR(MAX) = ''; SELECT @columns += '" + columns + "';PRINT @columns; DECLARE @query varchar(max); set @query = 'SELECT * FROM   ( select eh.ENT_ID ,eh.ENT_NAME ,et.Prop_name,ed.Ent_Value from ENTITY_HDR eh left join Entity_Dtl ed on ed.Ent_ID = eh.ENT_ID left join Entity_Template et ON ed.Ent_temp_id = et.Ent_temp_id";
                    if (!string.IsNullOrEmpty(searchString))
                    {
                        query += " where  eh.ENT_NAME like ''%" + searchString + "%'' or ed.Ent_Value like ''%" + searchString + "%''";
                    }
                    query += ") t  PIVOT( max(Ent_Value)  FOR prop_name IN ('+@columns+') ) AS pivot_table;' exec (@query)";
                }
                entities = connection.Query<dynamic>(query).ToList();
                return entities;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }

        public List<EquipmentHeader> GetAllEquipmentHeaders(string unitID = null)
        {
            List<EquipmentHeader> equipmentHeaders = new List<EquipmentHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = "select EQUIP_ID, UNIT_ID from EQUIPMENT_HDR";
                if (!string.IsNullOrEmpty(unitID))
                {
                    query += " where UNIT_ID = '" + unitID + "'";
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

        public List<EquipmentEntityAssignment> GetAllEquipment_Entity_AssignmentByDate(string startDate)
        {
            List<EquipmentEntityAssignment> equipmentEntityAssignment = new List<EquipmentEntityAssignment>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = "select * from EQUIPMENT_ENTITY_ASSIGNMENT where ('" + startDate + "' between Start_Date and End_Date)";
                equipmentEntityAssignment = connection.Query<EquipmentEntityAssignment>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentEntityAssignment;
        }

        public bool UpdateInsertEQUENTASS(string startDate, List<string> columnHeader, List<string> values, out string totalNewAssigned, out int totalRemoved, out string invalidUnitID)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            var date = Convert.ToDateTime(startDate).ToString("MM/d/yyyy").Replace("-", "/");
            try
            {
                var distValues = values.Distinct().ToList();
                int removed = 0;
                connection.Open();
                var query = string.Empty;
                string newInvalidUID = string.Empty;
                var firstIndexOfUnitID = columnHeader.IndexOf("Unit ID");
                query = "Declare @equipIDList varchar(max)=''";
                for (int i = firstIndexOfUnitID; i < distValues.Count; i++)
                {
                    if (!string.IsNullOrEmpty(distValues[i]))
                    {
                        if (GetAllEquipmentHeaders(distValues[i]).Count == 0)
                        {
                            newInvalidUID += distValues[i] + ",";
                        }
                        else
                        {
                            query += " IF (select count(*) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID = " + distValues[0] + " and Equip_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + distValues[i].Replace("'", "''") + "'))  = 0 BEGIN SET @equipIDList += CONVERT(varchar(100), (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + distValues[i].Replace("'", "''") + "')) + ','; INSERT INTO [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT]([EQUIP_ID],[ENT_ID],[START_DATE],[END_DATE]) VALUES((select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + distValues[i].Replace("'", "''") + "')," + distValues[0] + ",'" + date + "','01/01/9999');UPDATE [dbo].[ENTITY_HDR] SET [ASSIGNED] =(select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID =" + distValues[0] + "),0)) WHERE  ENT_ID = " + distValues[0] + "; UPDATE [dbo].[EQUIPMENT_HDR] SET [ASSIGNED] = (select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where EQUIP_ID =(select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID='" + distValues[i].Replace("'", "''") + "')),0)) WHERE  EQUIP_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID='" + distValues[i].Replace("'", "''") + "') END ";
                        }
                    }
                }
                var queryForUpdate = "select UNIT_ID  from (SELECT * from [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] where ENT_ID = " + distValues[0] + "  and ('" + date + "' between Start_Date and End_Date)) as eea left join EQUIPMENT_HDR as eh on eh.EQUIP_ID = eea.EQUIP_ID";
                var unitIDs = connection.Query<string>(queryForUpdate).ToList();
                foreach (var unitID in unitIDs)
                {
                    if (!distValues.Contains(unitID))
                    {
                        query += "  UPDATE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] SET [END_DATE] = '" + date + "' WHERE ENT_ID = " + distValues[0] + " and EQUIP_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + unitID.Replace("'", "''") + "')  and ('" + date + "' between Start_Date and End_Date) ";
                        removed++;
                    }
                }
                totalRemoved = removed;
                totalNewAssigned = "";
                invalidUnitID = newInvalidUID;
                if (!string.IsNullOrEmpty(query))
                {
                    query += "select @equipIDList;";
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


        public bool InsertTemplateDetails(List<string> columnHeader, List<string> values)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                var query = string.Empty;
                query = "declare @EQUIPID int = 0; declare @EQUIPTempID int = 0; IF ((select count(EQUIP_ID) from EQUIPMENT_HDR where EQUIP_TYPE = '" + values[0].Replace("'", "''") + "' and [VENDOR] ='" + values[1].Replace("'", "''") + "' and [UNIT_ID] = '" + values[2].Replace("'", "''") + "'))  = 0  BEGIN INSERT INTO EQUIPMENT_HDR(EQUIP_TYPE,VENDOR,UNIT_ID,ASSIGNED) Values ('" + values[0].Trim().Replace("'", "''") + "','" + values[1].Trim().Replace("'", "''") + "','" + values[2].Trim().Replace("'", "''") + "',0) End SET @EQUIPID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where EQUIP_TYPE = '" + values[0].Replace("'", "''") + "' and VENDOR ='" + values[1].Replace("'", "''") + "'and UNIT_ID ='" + values[2].Replace("'", "''") + "')";

                for (int i = 3; i < columnHeader.Count; i = i + 3)
                {
                    var sDate = values[i + 1];
                    var startDate = Convert.ToDateTime(sDate).Year + "-" + Convert.ToDateTime(sDate).Month + "-" + Convert.ToDateTime(sDate).Day;
                    var eDate = values[i + 2];
                    var endDate = Convert.ToDateTime(eDate).Year + "-" + Convert.ToDateTime(eDate).Month + "-" + Convert.ToDateTime(eDate).Day;
                    query += "SET @EQUIPTempID = (select top 1 Equip_Temp_ID from Equipment_Template where Equipment_Type = '" + values[0].Replace("'", "''") + "' and Prop_Name= '" + columnHeader[i].Replace("'", "''") + "') IF ((select count(Equip_Dtl_ID) from Equipment_Dtl where Equip_ID = @EQUIPID and Equip_Temp_ID = @EQUIPTempID and Eq_Value = '" + values[i].Replace("'", "''") + "'))  = 0  BEGIN  INSERT INTO [Equipment_Dtl]([Equip_ID],[Equip_Temp_ID],[Eq_Value],[Start_Date],[End_Date]) VALUES (@EQUIPID,@EQUIPTempID,'" + values[i].Trim().Replace("'", "''") + "','" + startDate + "','" + endDate + "') End SET @EQUIPTempID = 0;";
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


        public string IsValidEquipmentTemplate(List<string> columnHeader, string equipmentType)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string columnHeaderVal = string.Empty;
                for (int i = 3; i < columnHeader.Count; i = i + 3)
                {
                    var query = string.Empty;
                    query += "Declare @isValidColum bit = 1; IF ((SELECT COUNT(*) FROM Equipment_Template WHERE [Equipment_Type] = '" + equipmentType + "' AND [Prop_name] ='" + columnHeader[i] + "'))  = 0 BEGIN SET @isValidColum = 0; End select @isValidColum;";
                    bool isValidEquip = connection.Query<bool>(query).FirstOrDefault();
                    if (!isValidEquip)
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

        #region Equipment Calender Control
        public List<EquipmentEntityAssignment> GetEquipmentEntityAssignmentByYear(string year, int entityID, int equipID)
        {
            List<EquipmentEntityAssignment> equipmentEntityAssignments = new List<EquipmentEntityAssignment>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {
                connection.Open();
                string query = string.Empty;

                query = "SELECT distinct [EQUIP_ENT_ID] ,eea.[EQUIP_ID] ,eea.[ENT_ID],eh.UNIT_ID,enh.ENT_NAME,eh.EQUIP_TYPE,enh.ENT_TYPE,eea.START_DATE,eea.END_DATE  FROM [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea join EQUIPMENT_HDR  as eh on eea.EQUIP_ID = eh.EQUIP_ID join ENTITY_HDR as enh on eea.ENT_ID = enh.ENT_ID";

                if (!string.IsNullOrEmpty(year) && entityID > 0)
                {
                    query += " and ('" + year + "' between YEAR(eea.Start_Date) and YEAR(eea.End_Date)) where eea.ENT_ID = " + entityID;
                }
                else if (!string.IsNullOrEmpty(year) && equipID > 0)
                {
                    query += " and ('" + year + "' between YEAR(eea.Start_Date) and YEAR(eea.End_Date)) where eea.EQUIP_ID = " + equipID;
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
        public List<EntityHeader> GetAllEquipmentEntityAssignment()
        {
            List<EntityHeader> entityHeaders = new List<EntityHeader>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {

                connection.Open();
                string query = string.Empty;
                query += "SELECT eh.[ENT_ID] ,[ENT_TYPE] ,[ENT_NAME],eea.START_DATE, eea.END_DATE FROM [dbo].[ENTITY_HDR] as eh join  [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] as eea on eh.ENT_ID = eea.ENT_ID ";
                entityHeaders = connection.Query<EntityHeader>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return entityHeaders;
        }

        public List<EquipmentDetail> GetAllEquipmentTemplateDetails()
        {
            List<EquipmentDetail> equipmentDetails = new List<EquipmentDetail>();
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            try
            {

                connection.Open();
                string query = string.Empty;
                query += "SELECT [Equip_Dtl_ID] ,[Equip_ID] ,ed.[Equip_Temp_ID] ,et.Prop_Name ,[Eq_Value] ,[Start_Date] ,[End_Date],et.Datatype FROM [dbo].[Equipment_Dtl] as ed join [dbo].[Equipment_Template] as et on ed.Equip_Temp_ID = et.Equip_Temp_ID";
                equipmentDetails = connection.Query<EquipmentDetail>(query).ToList();
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
            return equipmentDetails;
        }


        #endregion


        #region Equipment Entity Assign Date Range Export - Import

        public bool UpdateInsertEQUENTDateRangeASS(string startDate, List<string> columnHeader, List<string> values, int operation, out string totalNewAssigned, out int totalRemoved, out string invalidUnitID)
        {
            var connection = CommonDatabaseOperationHelper.CreateConnection();
            var date = Convert.ToDateTime(startDate).ToString("MM/d/yyyy").Replace("-", "/");
            try
            {
                var distValues = values.Distinct().ToList();
                int removed = 0;
                connection.Open();
                var query = string.Empty;
                string newInvalidUID = string.Empty;
                var firstIndexOfUnitID = columnHeader.IndexOf("Unit ID");
                if (operation == 0)
                {
                    query = "Declare @equipIDList varchar(max)=''";
                    for (int i = firstIndexOfUnitID; i < values.Count; i = i + 3)
                    {
                        if (!string.IsNullOrEmpty(values[i]) && !string.IsNullOrEmpty(values[i + 1]) && !string.IsNullOrEmpty(values[i + 2]) && (Convert.ToDateTime(values[i + 1]) < Convert.ToDateTime(values[i + 2])))
                        {
                            if (GetAllEquipmentHeaders(values[i]).Count == 0)
                            {
                                newInvalidUID += values[i] + ",";
                            }
                            else
                            {
                                var sDate = Convert.ToDateTime(values[i + 1]).ToString("MM/d/yyyy").Replace("-", "/");
                                var eDate = Convert.ToDateTime(values[i + 2]).ToString("MM/d/yyyy").Replace("-", "/");
                                query += " IF (select count(*) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID = " + values[0] + " and Equip_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "') and (SELECT CAST(START_DATE AS DATE)) = '" + sDate + "' and (SELECT CAST(END_DATE AS DATE)) = '" + eDate + "')  = 0 BEGIN SET @equipIDList += CONVERT(varchar(100), (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "')) + ','; INSERT INTO [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT]([EQUIP_ID],[ENT_ID],[START_DATE],[END_DATE]) VALUES((select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "')," + values[0] + ",'" + sDate + "','" + eDate + "');UPDATE [dbo].[ENTITY_HDR] SET [ASSIGNED] =(select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID =" + values[0] + "),0)) WHERE  ENT_ID = " + values[0] + "; UPDATE [dbo].[EQUIPMENT_HDR] SET [ASSIGNED] = (select isnull((select count(EQUIP_ENT_ID) from EQUIPMENT_ENTITY_ASSIGNMENT where EQUIP_ID =(select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID='" + values[i].Replace("'", "''") + "')),0)) WHERE  EQUIP_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID='" + values[i].Replace("'", "''") + "') END ";
                            }
                        }
                    }
                    var queryForUpdate = "select UNIT_ID  from (SELECT * from [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] where ENT_ID = " + values[0] + "  and ('" + date + "' between Start_Date and End_Date)) as eea left join EQUIPMENT_HDR as eh on eh.EQUIP_ID = eea.EQUIP_ID";
                    var unitIDs = connection.Query<string>(queryForUpdate).ToList();
                    foreach (var unitID in unitIDs)
                    {
                        if (!distValues.Contains(unitID))
                        {
                            //query += "   UPDATE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] SET [END_DATE] = '" + date + "' WHERE ENT_ID = " + values[0] + " and EQUIP_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + unitID.Replace("'", "''") + "')  and ('" + date + "' between Start_Date and End_Date) ";
                            query += " Delete from EQUIPMENT_ENTITY_ASSIGNMENT WHERE ENT_ID = " + values[0] + " and EQUIP_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + unitID.Replace("'", "''") + "')  and ('" + date + "' between Start_Date and End_Date) ";
                            removed++;
                        }
                    }
                    totalRemoved = removed;
                    totalNewAssigned = "";
                    invalidUnitID = newInvalidUID;
                    if (!string.IsNullOrEmpty(query))
                    {
                        query += "select @equipIDList;";
                        var isUpdated = connection.Query<string>(query).ToList();
                        totalNewAssigned = isUpdated[0];
                        return true;
                    }
                }
                else if (operation == 1)
                {
                    query = string.Empty;
                    for (int i = firstIndexOfUnitID; i < values.Count; i = i + 3)
                    {
                        if (!string.IsNullOrEmpty(values[i]) && !string.IsNullOrEmpty(values[i + 1]) && !string.IsNullOrEmpty(values[i + 2]) && (Convert.ToDateTime(values[i + 1]) <= Convert.ToDateTime(values[i + 2])))
                        {
                            if (GetAllEquipmentHeaders(values[i]).Count == 0)
                            {
                                newInvalidUID += values[i] + ",";
                            }
                            else
                            {
                                var sDate = Convert.ToDateTime(values[i + 1]).ToString("MM/d/yyyy").Replace("-", "/");
                                var eDate = Convert.ToDateTime(values[i + 2]).ToString("MM/d/yyyy").Replace("-", "/");
                                query += " IF (select count(*) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID = " + values[0] + " and Equip_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "'))  >= 1 BEGIN WITH CTE AS ( SELECT TOP 1 * FROM EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID = " + values[0] + " and Equip_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "') ORDER BY EQUIP_ENT_ID DESC) Update CTE SET START_DATE = '" + sDate + "', END_DATE ='" + eDate + "';END ";
                            }
                        }
                    }
                    var queryForUpdate = "select UNIT_ID  from (SELECT * from [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] where ENT_ID = " + values[0] + "  and ('" + date + "' between Start_Date and End_Date)) as eea left join EQUIPMENT_HDR as eh on eh.EQUIP_ID = eea.EQUIP_ID";
                    var unitIDs = connection.Query<string>(queryForUpdate).ToList();
                    foreach (var unitID in unitIDs)
                    {
                        if (!distValues.Contains(unitID))
                        {
                            query += " Delete from EQUIPMENT_ENTITY_ASSIGNMENT WHERE ENT_ID = " + values[0] + " and EQUIP_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + unitID.Replace("'", "''") + "')  and ('" + date + "' between Start_Date and End_Date) ";
                            removed++;
                        }
                    }
                    invalidUnitID = newInvalidUID;
                    totalRemoved = removed;
                    if (!string.IsNullOrEmpty(query))
                    {
                        var isUpdated = connection.Query<string>(query).ToList();
                        totalNewAssigned = null;
                        return true;
                    }
                }
                else
                {
                    query = string.Empty;
                    query = "Declare @equipIDList varchar(max)=''";
                    for (int i = firstIndexOfUnitID; i < values.Count; i = i + 3)
                    {
                        if (!string.IsNullOrEmpty(values[i]) && !string.IsNullOrEmpty(values[i + 1]) && !string.IsNullOrEmpty(values[i + 2]) && (Convert.ToDateTime(values[i + 1]) <= Convert.ToDateTime(values[i + 2])))
                        {
                            if (GetAllEquipmentHeaders(values[i]).Count == 0)
                            {
                                newInvalidUID += values[i] + ",";
                            }
                            else
                            {
                                var sDate = Convert.ToDateTime(values[i + 1]).ToString("MM/d/yyyy").Replace("-", "/");
                                var eDate = Convert.ToDateTime(values[i + 2]).ToString("MM/d/yyyy").Replace("-", "/");
                                query += " IF (select count(*) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID = " + values[0] + " and Equip_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "'))  >= 1 BEGIN IF (select count(*) from EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID = " + values[0] + "  and Equip_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "') and (SELECT CAST(START_DATE AS DATE)) = '" + sDate + "' and (SELECT CAST(END_DATE AS DATE)) = '" + eDate + "') = 0 BEGIN WITH CTE AS ( SELECT TOP 1 * FROM EQUIPMENT_ENTITY_ASSIGNMENT where ENT_ID = " + values[0] + " and Equip_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "') ORDER BY EQUIP_ENT_ID DESC) Update CTE SET END_DATE = '" + sDate + "'; SET @equipIDList += CONVERT(varchar(100), (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "')) + ','; INSERT INTO [EQUIPMENT_ENTITY_ASSIGNMENT]([EQUIP_ID],[ENT_ID],[START_DATE],[END_DATE]) VALUES((select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + values[i].Replace("'", "''") + "')," + values[0] + ",'" + sDate + "','" + eDate + "'); END END ";
                            }
                        }
                    }
                    var queryForUpdate = "select UNIT_ID  from (SELECT * from [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] where ENT_ID = " + values[0] + "  and ('" + date + "' between Start_Date and End_Date)) as eea left join EQUIPMENT_HDR as eh on eh.EQUIP_ID = eea.EQUIP_ID";
                    var unitIDs = connection.Query<string>(queryForUpdate).ToList();
                    foreach (var unitID in unitIDs)
                    {
                        if (!distValues.Contains(unitID))
                        {
                            query += " Delete from EQUIPMENT_ENTITY_ASSIGNMENT WHERE ENT_ID = " + values[0] + " and EQUIP_ID = (select top 1 EQUIP_ID from EQUIPMENT_HDR where UNIT_ID = '" + unitID.Replace("'", "''") + "')  and ('" + date + "' between Start_Date and End_Date) ";
                            removed++;
                        }
                    }
                    invalidUnitID = newInvalidUID;
                    totalRemoved = removed;
                    if (!string.IsNullOrEmpty(query))
                    {
                        query += "select @equipIDList;";
                        var isUpdated = connection.Query<string>(query).ToList();
                        totalNewAssigned = isUpdated[0];
                        return true;
                    }
                }

                totalNewAssigned = null;
                totalRemoved = 0;
                return false;
            }
            catch (Exception e)
            {
                throw;
            }
            finally { connection.Close(); }
        }
        #endregion

    }
}