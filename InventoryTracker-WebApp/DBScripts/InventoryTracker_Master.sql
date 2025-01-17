USE [master]
GO
/****** Object:  Database [InventoryTracker_Master]    Script Date: 27-12-2022 05:37:22 PM ******/
CREATE DATABASE [InventoryTracker_Master]
GO
--ALTER DATABASE [InventoryTracker_Master] SET COMPATIBILITY_LEVEL = 140
--GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [InventoryTracker_Master].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [InventoryTracker_Master] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET ARITHABORT OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [InventoryTracker_Master] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [InventoryTracker_Master] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET  DISABLE_BROKER 
GO
ALTER DATABASE [InventoryTracker_Master] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [InventoryTracker_Master] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [InventoryTracker_Master] SET  MULTI_USER 
GO
ALTER DATABASE [InventoryTracker_Master] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [InventoryTracker_Master] SET DB_CHAINING OFF 
GO
ALTER DATABASE [InventoryTracker_Master] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [InventoryTracker_Master] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [InventoryTracker_Master] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [InventoryTracker_Master] SET QUERY_STORE = OFF
GO
USE [InventoryTracker_Master]
GO
/****** Object:  Table [dbo].[INSTANCE]    Script Date: 27-12-2022 05:37:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[INSTANCE](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Instance_name] [nvarchar](100) NULL,
	[Instance_note] [nvarchar](200) NULL,
	[Inserted_on] [datetime] NULL,
	[Deleted_by] [nvarchar](200) NULL,
	[Deleted_on] [datetime] NULL,
	[Isactive] [nvarchar](1) NULL,
	[IsdefaultDB] [nvarchar](1) NULL,
 CONSTRAINT [PK_INSTANCE] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MASTER_USER]    Script Date: 27-12-2022 05:37:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MASTER_USER](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[User_email] [nvarchar](100) NULL,
	[Instance_name] [nvarchar](100) NULL,
	[Inserted_on] [datetime] NULL,
 CONSTRAINT [PK_MASTER_USER] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserDetail]    Script Date: 27-12-2022 05:37:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[User_email] [varchar](255) NOT NULL,
	[Password] [nvarchar](500) NOT NULL,
	[Reset_password] [bit] NOT NULL,
 CONSTRAINT [PK_UserDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[INSTANCE] ADD  CONSTRAINT [df_Isactive]  DEFAULT ('Y') FOR [Isactive]
GO
ALTER TABLE [dbo].[INSTANCE] ADD  CONSTRAINT [INSTANCE_IsdefaultDB_defaultvalue]  DEFAULT ('N') FOR [IsdefaultDB]
GO
ALTER TABLE [dbo].[UserDetail] ADD  CONSTRAINT [DF_UserDetail_Reset_password]  DEFAULT ((1)) FOR [Reset_password]
GO
/****** Object:  StoredProcedure [dbo].[SP_CopyDatabase_UsingBackup]    Script Date: 27-12-2022 05:37:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[SP_CopyDatabase_UsingBackup]
@TargetDatabaseName varchar(200),
	@InstanceNote varchar(MAX) = NULL,
	@BackupPath varchar(MAX) 
as  
begin 
	--SET @TargetDatabaseName='COPY_1'
	--SET @InstanceNote='COPY_1 test'
	--SET @BackupPath='D:\Asmita\backup_flash_db\'
	-- the original database (use 'SET @DB = NULL' to disable backup)
	DECLARE @SourceDatabaseName varchar(200)
	DECLARE @SourceDatabaseLogicalName varchar(200)
	DECLARE @SourceDatabaseLogicalNameForLog varchar(200)
	DECLARE @query varchar(2000)
	DECLARE @DataFile varchar(2000)
	DECLARE @LogFile varchar(2000)
	DECLARE @BackupFile varchar(2000)
	--DECLARE @TargetDatabaseName varchar(200)
	DECLARE @TargetDatbaseFolder varchar(2000)

	-- ****************************************************************

	SET @SourceDatabaseName = 'IT_Main'                   -- Name of the source database
	SET @SourceDatabaseLogicalName = 'IT_Main'            -- Logical name of the DB ( check DB properties / Files tab )
	SET @SourceDatabaseLogicalNameForLog = 'IT_Main_log'  -- Logical name of the DB ( check DB properties / Files tab )
	SET @BackupFile = @BackupPath + '\backup.dat'             -- FileName of the backup file
	--SET @TargetDatabaseName = 'Flash_30_06_2022_2'          -- Name of the target database
	--SET @TargetDatbaseFolder = 'D:\Asmita\'
	SET @TargetDatbaseFolder = @BackupPath
	-- ****************************************************************

	SET @DataFile = @TargetDatbaseFolder + @TargetDatabaseName + '.mdf';
	SET @LogFile = @TargetDatbaseFolder + @TargetDatabaseName + '.ldf';

	-- Backup the @SourceDatabase to @BackupFile location
	IF @SourceDatabaseName IS NOT NULL
	BEGIN
	SET @query = 'BACKUP DATABASE ' + @SourceDatabaseName + ' TO DISK = ' + QUOTENAME(@BackupFile,'''')
	PRINT 'Executing query : ' + @query;
	EXEC (@query)
	END
	PRINT 'OK!1';

	-- Drop @TargetDatabaseName if exists
	IF EXISTS(SELECT * FROM sysdatabases WHERE name = @TargetDatabaseName)
	BEGIN
	SET @query = 'DROP DATABASE ' + @TargetDatabaseName
	PRINT 'Executing query : ' + @query;
	EXEC (@query)
	END
	PRINT 'OK!2'

	-- Restore database from @BackupFile into @DataFile and @LogFile
	SET @query = 'RESTORE DATABASE ' + @TargetDatabaseName + ' FROM DISK = ' + QUOTENAME(@BackupFile,'''') 
	SET @query = @query + ' WITH MOVE ' + QUOTENAME(@SourceDatabaseLogicalName,'''') + ' TO ' + QUOTENAME(@DataFile ,'''')
	SET @query = @query + ' , MOVE ' + QUOTENAME(@SourceDatabaseLogicalNameForLog,'''') + ' TO ' + QUOTENAME(@LogFile,'''')
	PRINT 'Executing query : ' + @query
	EXEC (@query)
	PRINT 'OK!3'

	--declare database_tables cursor for select name from sys.tables
	declare @sqlQuery nvarchar(MAX)
	declare @sql nvarchar(MAX)
	declare @tablename varchar(100)  
	set @sqlQuery='declare database_tables cursor for select name from '+@TargetDatabaseName+'.sys.tables order by name desc'
	exec sp_executesql @sqlQuery  
	open database_tables  
	while @@FETCH_STATUS=0
	begin
	print @tablename
		fetch next from database_tables into @tablename 	
			set @sql = 'use '+@TargetDatabaseName+' TRUNCATE TABLE '+@TargetDatabaseName+'.dbo.'+@tablename
			--exec sp_executesql @sql  			 		
	end  
	close database_tables  
	deallocate database_tables 
	PRINT 'OK!4'

	--DECLARE @cnt int
	--SELECT @cnt=COUNT(*) FROM Flash_Master.dbo.INSTANCE WHERE instance_name=@TargetDatabaseName
	
	--IF (@cnt=0)
	--BEGIN
	IF EXISTS(SELECT * FROM sysdatabases WHERE name = @TargetDatabaseName)
	BEGIN
		set @sqlQuery='INSERT INTO InventoryTracker_Master.dbo.INSTANCE(instance_name, instance_note, inserted_on) VALUES ('''+@TargetDatabaseName+''','''+@InstanceNote+''',GETDATE())'
		exec sp_executesql @sqlQuery
	End
	--END
	set @sqlQuery=N'DEL '+@BackupFile
	--print @sqlQuery
	----select 1;
	--exec xp_cmdshell @sqlQuery;

	--set @sqlQuery='DEL '+@DataFile
	--exec xp_cmdshell @sqlQuery;

	--set @sqlQuery='DEL '+@LogFile
	--exec xp_cmdshell @sqlQuery;
END
GO
/****** Object:  StoredProcedure [dbo].[SP_DeleteInstance]    Script Date: 27-12-2022 05:37:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[SP_DeleteInstance]
	@InstanceName varchar(200),
	@email varchar(200)
AS
BEGIN
	
	DECLARE @SQL varchar(max)

	SELECT @SQL = COALESCE(@SQL,'') + 'Kill ' + Convert(varchar, SPId) + ';'
	FROM MASTER..SysProcesses
	WHERE DBId = DB_ID(@InstanceName) AND SPId <> @@SPId

	--SELECT @SQL 
	EXEC(@SQL)

	SET @SQL = 'DROP DATABASE '+ @InstanceName;
	EXEC(@SQL)

	UPDATE INSTANCE SET deleted_by=@email,deleted_on=GETDATE(),isactive='N' WHERE instance_name=@InstanceName and isactive='Y'

	DELETE FROM MASTER_USER WHERE instance_name=@InstanceName
END
GO
USE [master]
GO
ALTER DATABASE [InventoryTracker_Master] SET  READ_WRITE 
GO
