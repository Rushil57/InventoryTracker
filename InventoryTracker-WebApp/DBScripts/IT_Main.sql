USE [master]
GO
/****** Object:  Database [IT_Main]    Script Date: 27-12-2022 05:38:09 PM ******/
CREATE DATABASE [IT_Main]
GO
--ALTER DATABASE [IT_Main] SET COMPATIBILITY_LEVEL = 140
--GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [IT_Main].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [IT_Main] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [IT_Main] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [IT_Main] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [IT_Main] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [IT_Main] SET ARITHABORT OFF 
GO
ALTER DATABASE [IT_Main] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [IT_Main] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [IT_Main] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [IT_Main] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [IT_Main] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [IT_Main] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [IT_Main] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [IT_Main] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [IT_Main] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [IT_Main] SET  DISABLE_BROKER 
GO
ALTER DATABASE [IT_Main] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [IT_Main] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [IT_Main] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [IT_Main] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [IT_Main] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [IT_Main] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [IT_Main] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [IT_Main] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [IT_Main] SET  MULTI_USER 
GO
ALTER DATABASE [IT_Main] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [IT_Main] SET DB_CHAINING OFF 
GO
ALTER DATABASE [IT_Main] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [IT_Main] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [IT_Main] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [IT_Main] SET QUERY_STORE = OFF
GO
USE [IT_Main]
GO
/****** Object:  Table [dbo].[Entity_Dtl]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Entity_Dtl](
	[Ent_Dtl_ID] [int] IDENTITY(1,1) NOT NULL,
	[Ent_ID] [int] NULL,
	[Ent_Temp_ID] [int] NULL,
	[Ent_Value] [nvarchar](150) NULL,
	[Start_Date] [datetime] NULL,
	[End_Date] [datetime] NULL,
 CONSTRAINT [PK_Entity_Dtl] PRIMARY KEY CLUSTERED 
(
	[Ent_Dtl_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ENTITY_HDR]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ENTITY_HDR](
	[ENT_ID] [int] IDENTITY(1,1) NOT NULL,
	[ENT_TYPE] [nvarchar](100) NULL,
	[ENT_NAME] [nvarchar](200) NULL,
	[ASSIGNED] [int] NULL,
 CONSTRAINT [PK_ENTITY_HDR] PRIMARY KEY CLUSTERED 
(
	[ENT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Entity_Notes]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Entity_Notes](
	[Note_ID] [int] NOT NULL,
	[Ent_ID] [int] NULL,
	[Note] [text] NULL,
	[Note_Date] [datetime] NULL,
 CONSTRAINT [PK_Entity_Notes] PRIMARY KEY CLUSTERED 
(
	[Note_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Entity_Template]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Entity_Template](
	[Ent_temp_id] [int] IDENTITY(1,1) NOT NULL,
	[Ent_type] [nvarchar](100) NULL,
	[Prop_name] [nvarchar](100) NULL,
	[Datatype] [nvarchar](50) NULL,
	[Sequence] [int] NULL,
 CONSTRAINT [PK_Entity_Template] PRIMARY KEY CLUSTERED 
(
	[Ent_temp_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Equipment_Dtl]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Equipment_Dtl](
	[Equip_Dtl_ID] [int] IDENTITY(1,1) NOT NULL,
	[Equip_ID] [int] NULL,
	[Equip_Temp_ID] [int] NULL,
	[Eq_Value] [nvarchar](500) NULL,
	[Start_Date] [datetime] NULL,
	[End_Date] [datetime] NULL,
 CONSTRAINT [PK_Equipment_Dtl] PRIMARY KEY CLUSTERED 
(
	[Equip_Dtl_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT](
	[EQUIP_ENT_ID] [int] IDENTITY(1,1) NOT NULL,
	[EQUIP_ID] [int] NULL,
	[ENT_ID] [int] NULL,
	[START_DATE] [datetime] NULL,
	[END_DATE] [datetime] NULL,
 CONSTRAINT [PK_EQUIPMENT_ENTITY_ASSIGNMENT] PRIMARY KEY CLUSTERED 
(
	[EQUIP_ENT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EQUIPMENT_HDR]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EQUIPMENT_HDR](
	[EQUIP_ID] [int] IDENTITY(1,1) NOT NULL,
	[EQUIP_TYPE] [nvarchar](100) NULL,
	[VENDOR] [nvarchar](200) NULL,
	[UNIT_ID] [nvarchar](50) NULL,
	[ASSIGNED] [int] NULL,
 CONSTRAINT [PK_EQUIPMENT_HDR] PRIMARY KEY CLUSTERED 
(
	[EQUIP_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Equipment_Notes]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Equipment_Notes](
	[Note_ID] [int] IDENTITY(1,1) NOT NULL,
	[Equip_ID] [int] NULL,
	[Note] [text] NULL,
	[Note_Date] [datetime] NULL,
 CONSTRAINT [PK_Equipment_Notes] PRIMARY KEY CLUSTERED 
(
	[Note_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Equipment_Template]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Equipment_Template](
	[Equip_Temp_ID] [int] IDENTITY(1,1) NOT NULL,
	[Equipment_Type] [nvarchar](100) NULL,
	[Prop_Name] [nvarchar](100) NULL,
	[Datatype] [nvarchar](50) NULL,
	[Sequence] [int] NULL,
 CONSTRAINT [PK_Equipment_Template] PRIMARY KEY CLUSTERED 
(
	[Equip_Temp_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ROLES]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ROLES](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[ROLE_NAME] [varchar](255) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[USER_RELATION]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[USER_RELATION](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[PARENT_USER_ID] [int] NULL,
	[CHILD_USER_ID] [int] NULL,
 CONSTRAINT [PK_USER_RELATION] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[USERROLES]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[USERROLES](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[USER_ID] [int] NULL,
	[ROLE_ID] [int] NULL,
 CONSTRAINT [PK_Table_1] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[USERS]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[USERS](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[USER_EMAIL] [varchar](255) NULL,
 CONSTRAINT [PK_USERS] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[ROLES] ON 

INSERT [dbo].[ROLES] ([ID], [ROLE_NAME]) VALUES (1, N'ADMIN')
INSERT [dbo].[ROLES] ([ID], [ROLE_NAME]) VALUES (2, N'MANAGER')
INSERT [dbo].[ROLES] ([ID], [ROLE_NAME]) VALUES (3, N'OTHER USER')
SET IDENTITY_INSERT [dbo].[ROLES] OFF
GO
ALTER TABLE [dbo].[Entity_Dtl]  WITH CHECK ADD  CONSTRAINT [FK_Entity_Dtl_ENTITY_HDR] FOREIGN KEY([Ent_ID])
REFERENCES [dbo].[ENTITY_HDR] ([ENT_ID])
GO
ALTER TABLE [dbo].[Entity_Dtl] CHECK CONSTRAINT [FK_Entity_Dtl_ENTITY_HDR]
GO
ALTER TABLE [dbo].[Entity_Dtl]  WITH CHECK ADD  CONSTRAINT [FK_Entity_Dtl_Entity_Template] FOREIGN KEY([Ent_Temp_ID])
REFERENCES [dbo].[Entity_Template] ([Ent_temp_id])
GO
ALTER TABLE [dbo].[Entity_Dtl] CHECK CONSTRAINT [FK_Entity_Dtl_Entity_Template]
GO
ALTER TABLE [dbo].[Entity_Notes]  WITH CHECK ADD  CONSTRAINT [FK_Entity_Notes_ENTITY_HDR] FOREIGN KEY([Ent_ID])
REFERENCES [dbo].[ENTITY_HDR] ([ENT_ID])
GO
ALTER TABLE [dbo].[Entity_Notes] CHECK CONSTRAINT [FK_Entity_Notes_ENTITY_HDR]
GO
ALTER TABLE [dbo].[Equipment_Dtl]  WITH CHECK ADD  CONSTRAINT [FK_Equipment_Dtl_EQUIPMENT_HDR] FOREIGN KEY([Equip_ID])
REFERENCES [dbo].[EQUIPMENT_HDR] ([EQUIP_ID])
GO
ALTER TABLE [dbo].[Equipment_Dtl] CHECK CONSTRAINT [FK_Equipment_Dtl_EQUIPMENT_HDR]
GO
ALTER TABLE [dbo].[Equipment_Dtl]  WITH CHECK ADD  CONSTRAINT [FK_Equipment_Dtl_Equipment_Template] FOREIGN KEY([Equip_Temp_ID])
REFERENCES [dbo].[Equipment_Template] ([Equip_Temp_ID])
GO
ALTER TABLE [dbo].[Equipment_Dtl] CHECK CONSTRAINT [FK_Equipment_Dtl_Equipment_Template]
GO
ALTER TABLE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT]  WITH CHECK ADD  CONSTRAINT [Fk_Equipment_Entity_Assignment_Ent_Id] FOREIGN KEY([ENT_ID])
REFERENCES [dbo].[ENTITY_HDR] ([ENT_ID])
GO
ALTER TABLE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] CHECK CONSTRAINT [Fk_Equipment_Entity_Assignment_Ent_Id]
GO
ALTER TABLE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT]  WITH CHECK ADD  CONSTRAINT [Fk_Equipment_Entity_Assignment_Equip_Id] FOREIGN KEY([EQUIP_ID])
REFERENCES [dbo].[EQUIPMENT_HDR] ([EQUIP_ID])
GO
ALTER TABLE [dbo].[EQUIPMENT_ENTITY_ASSIGNMENT] CHECK CONSTRAINT [Fk_Equipment_Entity_Assignment_Equip_Id]
GO
ALTER TABLE [dbo].[Equipment_Notes]  WITH CHECK ADD  CONSTRAINT [FK_Equipment_Notes_EQUIPMENT_HDR] FOREIGN KEY([Equip_ID])
REFERENCES [dbo].[EQUIPMENT_HDR] ([EQUIP_ID])
GO
ALTER TABLE [dbo].[Equipment_Notes] CHECK CONSTRAINT [FK_Equipment_Notes_EQUIPMENT_HDR]
GO
/****** Object:  StoredProcedure [dbo].[sp_InsertUser]    Script Date: 27-12-2022 05:38:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_InsertUser]  
 @InstanceName varchar(MAX) = NULL,  
 @Useremail varchar(200) = NULL  
AS  
BEGIN  
 declare @insertedUserid int  
 INSERT INTO USERS(USER_EMAIL) VALUES (@Useremail)  
 select @insertedUserid= SCOPE_IDENTITY()  
 INSERT INTO InventoryTracker_Master.dbo.MASTER_USER(user_email,instance_name,inserted_on) VALUES (@Useremail,@InstanceName,GETDATE())  
END  
GO
USE [master]
GO
ALTER DATABASE [IT_Main] SET  READ_WRITE 
GO
