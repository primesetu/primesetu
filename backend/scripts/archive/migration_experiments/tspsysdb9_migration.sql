-- SMRITI-OS - tspsysdb9 Legacy Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public."s9sys_alertdefinition" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "companycode" TEXT NOT NULL,
    "application" TEXT NULL,
    "event" TEXT NULL,
    "ishodefined" SMALLINT NULL,
    "isdeleted" SMALLINT NULL,
    "isactive" SMALLINT NULL,
    "readonly" SMALLINT NULL,
    "alertid" INTEGER NOT NULL,
    "alertmode" TEXT NULL,
    "settings" TEXT NULL,
    "datemodified" TIMESTAMP WITHOUT TIME ZONE NULL,
    "description" TEXT NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_alertdefinition" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_alertdefinition";
CREATE POLICY store_isolation ON public."s9sys_alertdefinition" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_alerteventdefinition" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "application" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "isactive" SMALLINT NULL,
    "readonly" SMALLINT NULL,
    "eventtype" TEXT NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_alerteventdefinition" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_alerteventdefinition";
CREATE POLICY store_isolation ON public."s9sys_alerteventdefinition" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_alerthistory" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "serialno" TEXT NOT NULL,
    "entryserialno" INTEGER NULL,
    "companycode" TEXT NULL,
    "alertid" INTEGER NULL,
    "application" TEXT NULL,
    "event" TEXT NULL,
    "alertmode" TEXT NULL,
    "executedtime" TIMESTAMP WITHOUT TIME ZONE NULL,
    "status" TEXT NULL,
    "description" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_alerthistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_alerthistory";
CREATE POLICY store_isolation ON public."s9sys_alerthistory" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_authorisedpospatches" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "srlno" INTEGER NOT NULL,
    "patchid" TEXT NULL,
    "patchname" TEXT NULL,
    "releaseno" TEXT NULL,
    "approvedstatus" TEXT NULL,
    "finaldateforpatch" TIMESTAMP WITHOUT TIME ZONE NULL,
    "dateinsert" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_authorisedpospatches" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_authorisedpospatches";
CREATE POLICY store_isolation ON public."s9sys_authorisedpospatches" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_baksissysparam" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "code" TEXT NOT NULL,
    "value" TEXT NULL,
    "default" TEXT NULL,
    "datatype" TEXT NULL,
    "displayname" TEXT NULL,
    "status" TEXT NULL,
    "description" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_baksissysparam" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_baksissysparam";
CREATE POLICY store_isolation ON public."s9sys_baksissysparam" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_browsesettings" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "browseid" TEXT NULL,
    "browsetype" TEXT NULL,
    "browsename" TEXT NULL,
    "userid" TEXT NULL,
    "appname" TEXT NULL,
    "trntype" INTEGER NULL,
    "fldname" TEXT NULL,
    "fldcaption" TEXT NULL,
    "fldtype" TEXT NULL,
    "fldenabled" BOOLEAN NULL,
    "dispinbrowse" BOOLEAN NULL,
    "dispinfilter" BOOLEAN NULL,
    "dispinresult" BOOLEAN NULL,
    "alowfilter" BOOLEAN NULL,
    "condition" TEXT NULL,
    "searchval1" TEXT NULL,
    "searchval2" TEXT NULL,
    "othvalue" TEXT NULL,
    "sortorder" INTEGER NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_browsesettings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_browsesettings";
CREATE POLICY store_isolation ON public."s9sys_browsesettings" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_communicationconfig" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "configname" TEXT NOT NULL,
    "srlno" INTEGER NOT NULL,
    "profilecode" TEXT NULL,
    "configtype" TEXT NOT NULL,
    "name" TEXT NULL,
    "value" TEXT NULL,
    "isactive" SMALLINT NULL,
    "datemodified" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_communicationconfig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_communicationconfig";
CREATE POLICY store_isolation ON public."s9sys_communicationconfig" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_custompatchlocationdtls" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "srlno" INTEGER NOT NULL,
    "custmpatchname" TEXT NULL,
    "downloadtype" TEXT NULL,
    "locationaddress" TEXT NULL,
    "portno" TEXT NULL,
    "username" TEXT NULL,
    "password" TEXT NULL,
    "activeftp" BOOLEAN NULL,
    "dateinsert" TIMESTAMP WITHOUT TIME ZONE NULL,
    "activeflag" BOOLEAN NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_custompatchlocationdtls" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_custompatchlocationdtls";
CREATE POLICY store_isolation ON public."s9sys_custompatchlocationdtls" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_liveupdatepatdtls" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "slno" INTEGER NOT NULL,
    "patchversion" TEXT NOT NULL,
    "componentname" TEXT NULL,
    "componenttype" TEXT NULL,
    "componentlocation" TEXT NULL,
    "componentpath" TEXT NULL,
    "regreqd" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_liveupdatepatdtls" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_liveupdatepatdtls";
CREATE POLICY store_isolation ON public."s9sys_liveupdatepatdtls" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_patchdownloaddetails" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "patchnumber" TEXT NULL,
    "patchname" TEXT NULL,
    "releasenumber" TEXT NULL,
    "patchdate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "iscustompatch" TEXT NULL,
    "downloadtype" TEXT NULL,
    "downloaddate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "location" TEXT NULL,
    "status" TEXT NULL,
    "sisjobid" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_patchdownloaddetails" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_patchdownloaddetails";
CREATE POLICY store_isolation ON public."s9sys_patchdownloaddetails" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_printdesignercategory" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "catid" TEXT NOT NULL,
    "categorycap" TEXT NOT NULL,
    "categoryparent" TEXT NOT NULL,
    "displayorder" INTEGER NOT NULL,
    "catactive" INTEGER NOT NULL,
    "catcreationtype" TEXT NOT NULL,
    "cattype" TEXT NOT NULL,
    "catremarks" TEXT NULL,
    "additionalcatdetail1" TEXT NULL,
    "additionalcatdetail2" TEXT NULL,
    "additionalcatdetail3" TEXT NULL,
    "additionalcatdetail4" TEXT NULL,
    "additionalcatdetail5" TEXT NULL,
    "additionalcatdetail6" TEXT NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_printdesignercategory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_printdesignercategory";
CREATE POLICY store_isolation ON public."s9sys_printdesignercategory" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_printdesignerfields" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "catrefid" TEXT NOT NULL,
    "fieldname" TEXT NOT NULL,
    "fielddisplaycaption" TEXT NULL,
    "fielddescription" TEXT NOT NULL,
    "fielddatatype" TEXT NOT NULL,
    "fielddisplayorder" INTEGER NOT NULL,
    "fieldpreviewdata" TEXT NULL,
    "fieldactive" INTEGER NOT NULL,
    "fieldtype" TEXT NULL,
    "fieldremarks" TEXT NULL,
    "fieldenv" TEXT NULL,
    "sistemplatename" TEXT NULL,
    "setuptype" TEXT NULL,
    "compcode" TEXT NOT NULL,
    "trntype" TEXT NOT NULL,
    "fieldkeyid" TEXT NOT NULL,
    "isgeneralfield" INTEGER NULL,
    "additionalfielddetail1" TEXT NULL,
    "additionalfielddetail2" TEXT NULL,
    "additionalfielddetail3" TEXT NULL,
    "additionalfielddetail4" TEXT NULL,
    "additionalfielddetail5" TEXT NULL,
    "additionalfielddetail6" TEXT NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_printdesignerfields" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_printdesignerfields";
CREATE POLICY store_isolation ON public."s9sys_printdesignerfields" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_printdesignertrngrpinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "trntype" INTEGER NOT NULL,
    "trncaption" TEXT NULL,
    "trngroupname" TEXT NULL,
    "grouporder" INTEGER NULL,
    "trnorderingroup" INTEGER NULL,
    "isactive" INTEGER NULL,
    "remarks" TEXT NULL,
    "additionaltrngrpdetail1" TEXT NULL,
    "additionaltrngrpdetail2" TEXT NULL,
    "additionaltrngrpdetail3" TEXT NULL,
    "additionaltrngrpdetail4" TEXT NULL,
    "additionaltrngrpdetail5" TEXT NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL,
    "shoperdbver" INTEGER NULL);
ALTER TABLE public."s9sys_printdesignertrngrpinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_printdesignertrngrpinfo";
CREATE POLICY store_isolation ON public."s9sys_printdesignertrngrpinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportactioninfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "taskid" INTEGER NOT NULL,
    "actionname" TEXT NULL,
    "actiontype" TEXT NULL,
    "actionobject" TEXT NULL,
    "arguments" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportactioninfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportactioninfo";
CREATE POLICY store_isolation ON public."s9sys_reportactioninfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportconfigfields" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "taskid" INTEGER NOT NULL,
    "fieldname" TEXT NOT NULL,
    "fieldtype" TEXT NOT NULL,
    "caption" TEXT NULL,
    "orderno" INTEGER NULL,
    "isrepeatable" SMALLINT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportconfigfields" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportconfigfields";
CREATE POLICY store_isolation ON public."s9sys_reportconfigfields" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportconfigs" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "taskid" INTEGER NOT NULL,
    "defaulttitle" TEXT NULL,
    "maxallowed" SMALLINT NULL,
    "minallowed" SMALLINT NULL,
    "sistransaction" TEXT NULL,
    "loaddefault" SMALLINT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportconfigs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportconfigs";
CREATE POLICY store_isolation ON public."s9sys_reportconfigs" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "pgmoption" INTEGER NOT NULL,
    "taskid" INTEGER NOT NULL,
    "taskname" TEXT NULL,
    "tasktype" SMALLINT NULL,
    "periodtype" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportinfo";
CREATE POLICY store_isolation ON public."s9sys_reportinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportscheduledetails" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "companycode" TEXT NOT NULL,
    "scheduleid" TEXT NOT NULL,
    "entryserial" INTEGER NOT NULL,
    "reportconfigname" TEXT NULL,
    "communicationmode" TEXT NOT NULL,
    "communicationinfo" TEXT NULL,
    "status" INTEGER NULL,
    "datemodified" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompanycode" TEXT NULL,
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportscheduledetails" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportscheduledetails";
CREATE POLICY store_isolation ON public."s9sys_reportscheduledetails" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportscheduleheader" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "companycode" TEXT NOT NULL,
    "scheduleid" TEXT NOT NULL,
    "schedulename" TEXT NULL,
    "timetype" INTEGER NULL,
    "starttime" TEXT NULL,
    "timerange" TEXT NULL,
    "patterntype" INTEGER NULL,
    "patternvalue" TEXT NULL,
    "startdate" TEXT NULL,
    "rangetype" INTEGER NULL,
    "rangerecurrances" TEXT NULL,
    "lastexecutedtime" TEXT NULL,
    "status" SMALLINT NULL,
    "datemodified" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompanycode" TEXT NULL,
    "restrictuserid" TEXT NULL,
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportscheduleheader" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportscheduleheader";
CREATE POLICY store_isolation ON public."s9sys_reportscheduleheader" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportschedulehistory" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "scheduleid" TEXT NULL,
    "reportconfigname" TEXT NULL,
    "communicationmode" TEXT NULL,
    "executedtime" TEXT NULL,
    "description" TEXT NULL,
    "status" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportschedulehistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportschedulehistory";
CREATE POLICY store_isolation ON public."s9sys_reportschedulehistory" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_reportvariableinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "taskid" INTEGER NOT NULL,
    "variablename" TEXT NOT NULL,
    "variablevalue" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_reportvariableinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_reportvariableinfo";
CREATE POLICY store_isolation ON public."s9sys_reportvariableinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_shoperscriptupdateinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "scriptid" TEXT NOT NULL,
    "runsrl" INTEGER NOT NULL,
    "progid" TEXT NULL,
    "dbexecuted" TEXT NULL,
    "forversion" TEXT NULL,
    "shprogenv" TEXT NULL,
    "argumenttype" INTEGER NULL,
    "argumentdata" TEXT NULL,
    "scriptfilename" TEXT NULL,
    "status" TEXT NULL,
    "dateexecuted" TIMESTAMP WITHOUT TIME ZONE NULL,
    "shoperdate" TEXT NULL,
    "currentvactr" INTEGER NULL,
    "remarks" TEXT NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_shoperscriptupdateinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_shoperscriptupdateinfo";
CREATE POLICY store_isolation ON public."s9sys_shoperscriptupdateinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_shprmanifest" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "dllname" TEXT NULL,
    "typelibtlbid" TEXT NULL,
    "dllversion" TEXT NULL,
    "flags" TEXT NULL,
    "helpdir" TEXT NULL,
    "comclassid" TEXT NULL,
    "threadingmodel" TEXT NULL,
    "progid" TEXT NULL,
    "classdesc" TEXT NULL,
    "applicationname" TEXT NULL,
    "isitactive" BOOLEAN NULL,
    "hoposopt" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_shprmanifest" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_shprmanifest";
CREATE POLICY store_isolation ON public."s9sys_shprmanifest" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_shprmanifestlink" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "appname" TEXT NULL,
    "linkdllname" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_shprmanifestlink" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_shprmanifestlink";
CREATE POLICY store_isolation ON public."s9sys_shprmanifestlink" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sisfieldtemplates" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "subtype" TEXT NULL,
    "templatename" TEXT NOT NULL,
    "shorttablename" TEXT NULL,
    "fieldname" TEXT NOT NULL,
    "templatetype" TEXT NULL,
    "datatype" TEXT NULL,
    "codefield" TEXT NULL,
    "querycode" TEXT NULL,
    "description" TEXT NULL,
    "optional" TEXT NULL,
    "groupable" TEXT NULL,
    "groupcondition" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sisfieldtemplates" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sisfieldtemplates";
CREATE POLICY store_isolation ON public."s9sys_sisfieldtemplates" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sisformulatemplates" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "templatename" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "otherstn" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sisformulatemplates" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sisformulatemplates";
CREATE POLICY store_isolation ON public."s9sys_sisformulatemplates" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sisjoblist" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "jobid" TEXT NOT NULL,
    "jobtype" TEXT NOT NULL,
    "name" TEXT NULL,
    "owner" TEXT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NULL,
    "parentid" TEXT NULL,
    "isschedulejob" TEXT NULL,
    "status" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "progress" TEXT NULL,
    "retrycount" INTEGER NULL,
    "creationtime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "lastupdatetime" TIMESTAMP WITHOUT TIME ZONE NULL,
    "taskcounter" INTEGER NULL,
    "successcount" INTEGER NULL,
    "failcount" INTEGER NULL,
    "remarks" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sisjoblist" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sisjoblist";
CREATE POLICY store_isolation ON public."s9sys_sisjoblist" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sisjoblisthistory" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "jobid" TEXT NOT NULL,
    "jobtype" TEXT NOT NULL,
    "name" TEXT NULL,
    "owner" TEXT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NULL,
    "parentid" TEXT NULL,
    "isschedulejob" TEXT NULL,
    "status" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "progress" TEXT NULL,
    "retrycount" INTEGER NULL,
    "creationtime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "lastupdatetime" TIMESTAMP WITHOUT TIME ZONE NULL,
    "taskcounter" INTEGER NULL,
    "successcount" INTEGER NULL,
    "failcount" INTEGER NULL,
    "remarks" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sisjoblisthistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sisjoblisthistory";
CREATE POLICY store_isolation ON public."s9sys_sisjoblisthistory" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sisobjectinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "subtype" TEXT NOT NULL,
    "overridingsubtype" TEXT NULL,
    "shorttablename" TEXT NOT NULL,
    "othershorttablename" TEXT NULL,
    "objecthierarchy" INTEGER NULL,
    "parentobject" TEXT NULL,
    "optional" TEXT NULL,
    "objectname" TEXT NULL,
    "mandatorytemplates" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sisobjectinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sisobjectinfo";
CREATE POLICY store_isolation ON public."s9sys_sisobjectinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sisquerylookup" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "querycode" TEXT NOT NULL,
    "querystring" TEXT NULL,
    "querytype" INTEGER NOT NULL,
    "precedence" INTEGER NULL,
    "dllpath" TEXT NULL,
    "ispreexecute" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sisquerylookup" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sisquerylookup";
CREATE POLICY store_isolation ON public."s9sys_sisquerylookup" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sisqueryparam" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "querycode" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "paramname" TEXT NULL,
    "paramtype" TEXT NULL,
    "paramvalue" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sisqueryparam" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sisqueryparam";
CREATE POLICY store_isolation ON public."s9sys_sisqueryparam" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sissysparam" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "srlno" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "value" TEXT NULL,
    "default" TEXT NULL,
    "datatype" TEXT NULL,
    "displayname" TEXT NULL,
    "status" TEXT NULL,
    "description" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sissysparam" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sissysparam";
CREATE POLICY store_isolation ON public."s9sys_sissysparam" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sistableinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "shorttablename" TEXT NOT NULL,
    "tablename" TEXT NOT NULL,
    "sourcedb" TEXT NOT NULL,
    "hoandpos" TEXT NOT NULL,
    "hierarchy" INTEGER NULL,
    "pkeyfields" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sistableinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sistableinfo";
CREATE POLICY store_isolation ON public."s9sys_sistableinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sistablerelation" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "table1" TEXT NOT NULL,
    "table2" TEXT NOT NULL,
    "joincondition" TEXT NULL,
    "jointype" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sistablerelation" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sistablerelation";
CREATE POLICY store_isolation ON public."s9sys_sistablerelation" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sistablerelationdetails" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "table1" TEXT NOT NULL,
    "table2" TEXT NOT NULL,
    "field1" TEXT NOT NULL,
    "field2" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sistablerelationdetails" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sistablerelationdetails";
CREATE POLICY store_isolation ON public."s9sys_sistablerelationdetails" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sistasklist" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "jobid" TEXT NOT NULL,
    "taskid" INTEGER NOT NULL,
    "lastupdatetime" TIMESTAMP WITHOUT TIME ZONE NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "progress" TEXT NULL,
    "filename" TEXT NULL,
    "retrycount" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sistasklist" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sistasklist";
CREATE POLICY store_isolation ON public."s9sys_sistasklist" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sistasklisthistory" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "jobid" TEXT NOT NULL,
    "taskid" INTEGER NOT NULL,
    "lastupdatetime" TIMESTAMP WITHOUT TIME ZONE NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "progress" TEXT NULL,
    "filename" TEXT NULL,
    "retrycount" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sistasklisthistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sistasklisthistory";
CREATE POLICY store_isolation ON public."s9sys_sistasklisthistory" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sistransactioninfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "trnnumber" INTEGER NOT NULL,
    "trnfield" TEXT NULL,
    "description" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sistransactioninfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sistransactioninfo";
CREATE POLICY store_isolation ON public."s9sys_sistransactioninfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_sistransactiontemplatesinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "templatename" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "shorttablename" TEXT NOT NULL,
    "optional" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_sistransactiontemplatesinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_sistransactiontemplatesinfo";
CREATE POLICY store_isolation ON public."s9sys_sistransactiontemplatesinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_siswrapper" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "subtype" TEXT NULL,
    "templatename" TEXT NOT NULL,
    "shorttablename" TEXT NULL,
    "fieldname" TEXT NOT NULL,
    "templatetype" TEXT NULL,
    "datatype" TEXT NULL,
    "codefield" TEXT NULL,
    "querycode" TEXT NULL,
    "description" TEXT NULL,
    "optional" TEXT NULL,
    "groupable" TEXT NULL,
    "groupcondition" TEXT NULL,
    "templatekey" TEXT NULL,
    "trnnumber" INTEGER NULL,
    "sourcedb" TEXT NULL,
    "tablename" TEXT NULL,
    "hierarchy" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_siswrapper" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_siswrapper";
CREATE POLICY store_isolation ON public."s9sys_siswrapper" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_tmpchkfordbconsistencytab" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "error" INTEGER NULL,
    "level" INTEGER NULL,
    "state" INTEGER NULL,
    "messagetext" TEXT NULL,
    "repairlevel" TEXT NULL,
    "status" INTEGER NULL,
    "dbid" INTEGER NULL,
    "objectid" BIGINT NULL,
    "indexid" INTEGER NULL,
    "partitionid" BIGINT NULL,
    "allocunitid" BIGINT NULL,
    "file" INTEGER NULL,
    "page" INTEGER NULL,
    "slot" INTEGER NULL,
    "reffile" INTEGER NULL,
    "refpage" INTEGER NULL,
    "refslot" INTEGER NULL,
    "allocation" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_tmpchkfordbconsistencytab" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_tmpchkfordbconsistencytab";
CREATE POLICY store_isolation ON public."s9sys_tmpchkfordbconsistencytab" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_tmpshortcuttablesuper" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "mnuno" INTEGER NULL,
    "menuopt" INTEGER NULL,
    "compcode" TEXT NULL,
    "id" TEXT NULL,
    "idtype" TEXT NOT NULL,
    "paneltype" TEXT NULL,
    "buttonsrlno" INTEGER NULL,
    "buttonname" TEXT NULL,
    "appname" TEXT NULL,
    "apptype" TEXT NULL,
    "appopt" TEXT NULL,
    "pgmopt" INTEGER NULL,
    "displayicon" INTEGER NULL,
    "iconname" TEXT NULL,
    "positiontop" INTEGER NULL,
    "positionleft" INTEGER NULL,
    "allowed" INTEGER NULL,
    "exeright" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_tmpshortcuttablesuper" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_tmpshortcuttablesuper";
CREATE POLICY store_isolation ON public."s9sys_tmpshortcuttablesuper" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vacompany" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "compcode" TEXT NOT NULL,
    "nm" TEXT NULL,
    "address" TEXT NULL,
    "compwght" INTEGER NULL,
    "dbname" TEXT NULL,
    "dbpasswd" TEXT NULL,
    "dbpath" TEXT NULL,
    "dbprovider" TEXT NULL,
    "dbtype" TEXT NULL,
    "dbserver" TEXT NULL,
    "dbusername" TEXT NULL,
    "dbsharedir" TEXT NULL,
    "dbindir" TEXT NULL,
    "dboutdir" TEXT NULL,
    "dbpath1" TEXT NULL,
    "dbname1" TEXT NULL,
    "dbpasswd1" TEXT NULL,
    "dbprovider1" TEXT NULL,
    "dbtype1" TEXT NULL,
    "dbserver1" TEXT NULL,
    "dbusername1" TEXT NULL,
    "dbpath2" TEXT NULL,
    "dbname2" TEXT NULL,
    "dbpasswd2" TEXT NULL,
    "dbprovider2" TEXT NULL,
    "dbtype2" TEXT NULL,
    "dbserver2" TEXT NULL,
    "dbusername2" TEXT NULL,
    "dbpath3" TEXT NULL,
    "dbname3" TEXT NULL,
    "dbpasswd3" TEXT NULL,
    "dbprovider3" TEXT NULL,
    "dbtype3" TEXT NULL,
    "dbserver3" TEXT NULL,
    "dbusername3" TEXT NULL,
    "dbpath4" TEXT NULL,
    "dbname4" TEXT NULL,
    "dbpasswd4" TEXT NULL,
    "dbprovider4" TEXT NULL,
    "dbtype4" TEXT NULL,
    "dbserver4" TEXT NULL,
    "dbusername4" TEXT NULL,
    "ndcreateallowed" TEXT NULL,
    "ndwisenumbpresent" TEXT NULL,
    "maintndwisedevice" TEXT NULL,
    "templatename" TEXT NULL,
    "templatepath" TEXT NULL,
    "templatever" TEXT NULL,
    "environmenttype" TEXT NULL,
    "databaseversion" TEXT NULL,
    "companyactive" TEXT NULL,
    "checkupdate" TEXT NULL,
    "windowsauthappdb" BOOLEAN NULL,
    "windowsauthdb1" BOOLEAN NULL,
    "windowsauthdb2" BOOLEAN NULL,
    "windowsauthdb3" BOOLEAN NULL,
    "windowsauthdb4" BOOLEAN NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vacompany" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vacompany";
CREATE POLICY store_isolation ON public."s9sys_vacompany" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vacompwisemnuopt" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "compcode" TEXT NOT NULL,
    "mnuno" INTEGER NOT NULL,
    "mnuoptno" INTEGER NOT NULL,
    "optwght" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vacompwisemnuopt" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vacompwisemnuopt";
CREATE POLICY store_isolation ON public."s9sys_vacompwisemnuopt" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vacompwiseuserpriority" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "compcode" TEXT NOT NULL,
    "loginid" TEXT NOT NULL,
    "priority" INTEGER NULL,
    "multisession" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vacompwiseuserpriority" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vacompwiseuserpriority";
CREATE POLICY store_isolation ON public."s9sys_vacompwiseuserpriority" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vacontexthelpdtls" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "appname" TEXT NOT NULL,
    "pgmoption" INTEGER NOT NULL,
    "controlname" TEXT NOT NULL,
    "srlno" INTEGER NOT NULL,
    "transid" TEXT NULL,
    "helpcontextid" INTEGER NULL,
    "helppath" TEXT NULL,
    "helpfilename" TEXT NULL,
    "appnotedtls" TEXT NULL,
    "remindflag" TEXT NULL,
    "remindnos" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vacontexthelpdtls" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vacontexthelpdtls";
CREATE POLICY store_isolation ON public."s9sys_vacontexthelpdtls" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vadeviceids" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "deviceid" TEXT NULL,
    "devicename" TEXT NULL,
    "deviceremarks" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vadeviceids" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vadeviceids";
CREATE POLICY store_isolation ON public."s9sys_vadeviceids" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vagenlookup" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "recid" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "descr" TEXT NULL,
    "flag" TEXT NULL,
    "number" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vagenlookup" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vagenlookup";
CREATE POLICY store_isolation ON public."s9sys_vagenlookup" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vagroup" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "groupid" TEXT NOT NULL,
    "groupdescr" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vagroup" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vagroup";
CREATE POLICY store_isolation ON public."s9sys_vagroup" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vagrouprestrict" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "mnuno" INTEGER NOT NULL,
    "menuopt" INTEGER NOT NULL,
    "groupid" TEXT NOT NULL,
    "mnucap" TEXT NULL,
    "allowed" BOOLEAN NOT NULL,
    "onetimeallowed" BOOLEAN NOT NULL,
    "exeright" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vagrouprestrict" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vagrouprestrict";
CREATE POLICY store_isolation ON public."s9sys_vagrouprestrict" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vagroupwiseuserlist" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "loginid" TEXT NOT NULL,
    "groupid" TEXT NOT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vagroupwiseuserlist" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vagroupwiseuserlist";
CREATE POLICY store_isolation ON public."s9sys_vagroupwiseuserlist" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_valoghistory" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "logctrlno" TEXT NOT NULL,
    "logsrlno" INTEGER NOT NULL,
    "loginid" TEXT NULL,
    "nodeid" TEXT NULL,
    "compcode" TEXT NULL,
    "logdate" TIMESTAMP WITHOUT TIME ZONE NULL,
    "activitytype" TEXT NULL,
    "activitystatus" TEXT NULL,
    "exename" TEXT NULL,
    "logremarks" TEXT NULL,
    "dateinsert" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_valoghistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_valoghistory";
CREATE POLICY store_isolation ON public."s9sys_valoghistory" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vamenu" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "mnuno" INTEGER NOT NULL,
    "menuopt" INTEGER NOT NULL,
    "mnuname" TEXT NULL,
    "mnucap" TEXT NULL,
    "mnupgm" TEXT NULL,
    "exename" TEXT NULL,
    "mnuwght" INTEGER NULL,
    "allowwhentrnclosed" BOOLEAN NOT NULL,
    "pgmopt" INTEGER NULL,
    "dbinfo" TEXT NULL,
    "menuicon" TEXT NULL,
    "menusep" BOOLEAN NOT NULL,
    "menubold" BOOLEAN NOT NULL,
    "multiinstance" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vamenu" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vamenu";
CREATE POLICY store_isolation ON public."s9sys_vamenu" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vamenushortcut" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "compcode" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "idtype" TEXT NOT NULL,
    "paneltype" TEXT NOT NULL,
    "buttonsrlno" INTEGER NOT NULL,
    "buttonname" TEXT NULL,
    "appname" TEXT NULL,
    "apptype" TEXT NULL,
    "appopt" TEXT NULL,
    "pgmopt" INTEGER NULL,
    "displayicon" INTEGER NULL,
    "iconname" TEXT NULL,
    "positiontop" INTEGER NULL,
    "positionleft" INTEGER NULL,
    "vactr" INTEGER NULL,
    "dateinsert" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vamenushortcut" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vamenushortcut";
CREATE POLICY store_isolation ON public."s9sys_vamenushortcut" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vanode" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "nodeid" TEXT NOT NULL,
    "nm" TEXT NULL,
    "nodewt" INTEGER NULL,
    "clienttype" TEXT NULL,
    "deviceid" TEXT NULL,
    "verupdated" TEXT NULL,
    "active" TEXT NULL,
    "ipaddress" TEXT NULL,
    "computernm" TEXT NULL,
    "nodeskip" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vanode" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vanode";
CREATE POLICY store_isolation ON public."s9sys_vanode" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vanodedtls" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "nodeid" TEXT NULL,
    "compcode" TEXT NULL,
    "pgmname" TEXT NULL,
    "prefixdecider" TEXT NULL,
    "returnvalue" TEXT NULL,
    "ruledetails" TEXT NULL,
    "pgmopt" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vanodedtls" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vanodedtls";
CREATE POLICY store_isolation ON public."s9sys_vanodedtls" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vanodeextd" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "nodeid" TEXT NOT NULL,
    "nodeac1" TEXT NULL,
    "nodeac2" TEXT NULL,
    "nodeac3" TEXT NULL,
    "nodeac4" TEXT NULL,
    "nodeac5" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vanodeextd" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vanodeextd";
CREATE POLICY store_isolation ON public."s9sys_vanodeextd" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vanoderestrict" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "mnuno" INTEGER NOT NULL,
    "menuopt" INTEGER NOT NULL,
    "nodeid" TEXT NOT NULL,
    "mnucap" TEXT NULL,
    "allowed" BOOLEAN NOT NULL,
    "onetimeallowed" BOOLEAN NOT NULL,
    "exeright" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vanoderestrict" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vanoderestrict";
CREATE POLICY store_isolation ON public."s9sys_vanoderestrict" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vapasswordhistory" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "loginid" TEXT NOT NULL,
    "srlno" INTEGER NOT NULL,
    "loginpwd" TEXT NULL,
    "updtdate" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vapasswordhistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vapasswordhistory";
CREATE POLICY store_isolation ON public."s9sys_vapasswordhistory" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vapatchdtls" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "compcd" TEXT NOT NULL,
    "companynm" TEXT NULL,
    "nodeid" TEXT NOT NULL,
    "patchversion" TEXT NOT NULL,
    "patchdt" TIMESTAMP WITHOUT TIME ZONE NULL,
    "systemdate" TIMESTAMP WITHOUT TIME ZONE NULL,
    "patshopersysdt" TIMESTAMP WITHOUT TIME ZONE NULL,
    "patchenginever" TEXT NULL,
    "trntypectrlnodtls" TEXT NULL,
    "dbscriptupdt" TEXT NULL,
    "otherrmks" TEXT NULL,
    "otherrmks1" TEXT NULL,
    "otherrmks2" TEXT NULL,
    "secdbbackuptaken" BOOLEAN NULL,
    "appdbbackuptaken" BOOLEAN NULL,
    "appsecdbbackuptaken" BOOLEAN NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vapatchdtls" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vapatchdtls";
CREATE POLICY store_isolation ON public."s9sys_vapatchdtls" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_varestrictinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "restrictid" TEXT NOT NULL,
    "restrictlevel" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "value" INTEGER NULL,
    "dateinsert" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" TEXT NULL,
    "vactr" INTEGER NULL,
    "vatermid" TEXT NULL,
    "vacompcode" TEXT NULL);
ALTER TABLE public."s9sys_varestrictinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_varestrictinfo";
CREATE POLICY store_isolation ON public."s9sys_varestrictinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_varestrictmnu" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "mnuno" INTEGER NOT NULL,
    "menuopt" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "mnucap" TEXT NULL,
    "allowed" BOOLEAN NOT NULL,
    "onetimeallowed" BOOLEAN NOT NULL,
    "exeright" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_varestrictmnu" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_varestrictmnu";
CREATE POLICY store_isolation ON public."s9sys_varestrictmnu" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_varestrictmnuconfig" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "mnuno" INTEGER NOT NULL,
    "menuopt" INTEGER NOT NULL,
    "exename" TEXT NOT NULL,
    "exeoption" TEXT NULL,
    "optcaption" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_varestrictmnuconfig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_varestrictmnuconfig";
CREATE POLICY store_isolation ON public."s9sys_varestrictmnuconfig" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vasecurityconfig" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "id" TEXT NOT NULL,
    "descr" TEXT NULL,
    "paramcode" TEXT NULL,
    "boolean" BOOLEAN NULL,
    "intg" INTEGER NULL,
    "txt" TEXT NULL,
    "dt" TIMESTAMP WITHOUT TIME ZONE NULL,
    "sng" REAL NULL,
    "cur" NUMERIC NULL,
    "opt" TEXT NULL,
    "fixed" TEXT NULL,
    "changed" INTEGER NULL,
    "category" TEXT NULL,
    "catsrlno" INTEGER NULL,
    "paramsrlno" INTEGER NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vasecurityconfig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vasecurityconfig";
CREATE POLICY store_isolation ON public."s9sys_vasecurityconfig" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vauser" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "loginid" TEXT NOT NULL,
    "nm" TEXT NULL,
    "userwt" INTEGER NULL,
    "loginpwd" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vauser" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vauser";
CREATE POLICY store_isolation ON public."s9sys_vauser" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vauserextdinfo" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "loginid" TEXT NOT NULL,
    "statusflag" INTEGER NULL,
    "invalidlogcount" INTEGER NULL,
    "acctexpirydt" TIMESTAMP WITHOUT TIME ZONE NULL,
    "pwdupdateddt" TIMESTAMP WITHOUT TIME ZONE NULL,
    "mobilecode" TEXT NULL,
    "mobileno" TEXT NULL,
    "emailid" TEXT NULL,
    "dateinsert" TIMESTAMP WITHOUT TIME ZONE NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vauserextdinfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vauserextdinfo";
CREATE POLICY store_isolation ON public."s9sys_vauserextdinfo" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vausg" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "loginname" TEXT NOT NULL,
    "compcode" TEXT NOT NULL,
    "dtinout" TIMESTAMP WITHOUT TIME ZONE NULL,
    "timeinout" TIMESTAMP WITHOUT TIME ZONE NULL,
    "inuse" BOOLEAN NOT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vausg" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vausg";
CREATE POLICY store_isolation ON public."s9sys_vausg" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_vavertable" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "nodeid" TEXT NOT NULL,
    "exesrl" INTEGER NOT NULL,
    "exeid" TEXT NOT NULL,
    "exename" TEXT NULL,
    "exesize" INTEGER NULL,
    "exever" TEXT NULL,
    "exeminor" TEXT NULL,
    "exesubrel" TEXT NULL,
    "exeminver" TEXT NULL,
    "exeminminor" TEXT NULL,
    "exeminsubrel" TEXT NULL,
    "execompatible" TEXT NULL,
    "exedepends" TEXT NULL,
    "exedepends2" TEXT NULL,
    "exedepends3" TEXT NULL,
    "exedepends4" TEXT NULL,
    "exedate" TIMESTAMP WITHOUT TIME ZONE NULL,
    "exelastupdated" TIMESTAMP WITHOUT TIME ZONE NULL,
    "exeskip" TEXT NULL,
    "execheck" TEXT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_vavertable" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_vavertable";
CREATE POLICY store_isolation ON public."s9sys_vavertable" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_trace_xe_action_map" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_trace_xe_action_map" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_trace_xe_action_map";
CREATE POLICY store_isolation ON public."s9sys_trace_xe_action_map" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public."s9sys_trace_xe_event_map" (
    "smriti_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "store_id" VARCHAR NOT NULL,
    "vauid" VARCHAR(50) DEFAULT 'super',
    "vactr" INTEGER DEFAULT 1,
    "vatermid" VARCHAR(50),
    "vacompcode" VARCHAR(50));
ALTER TABLE public."s9sys_trace_xe_event_map" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_isolation ON public."s9sys_trace_xe_event_map";
CREATE POLICY store_isolation ON public."s9sys_trace_xe_event_map" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
