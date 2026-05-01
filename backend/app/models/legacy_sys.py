from typing import Optional
from sqlalchemy import String, Integer, Boolean, DateTime, Numeric, BigInteger, ForeignKey, text, UUID, LargeBinary, Float, Text
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base
import uuid
from datetime import datetime

# tspsysdb9 Legacy System Models
# Auto-generated for System Logic Integration

class Alertdefinition(Base):
    __tablename__ = "s9sys_alertdefinition"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    companycode: Mapped[str] = mapped_column(String, nullable=False)
    application: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    event: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ishodefined: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    isdeleted: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    isactive: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    readonly: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    alertid: Mapped[int] = mapped_column(Integer, nullable=False)
    alertmode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    settings: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    datemodified: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Alerteventdefinition(Base):
    __tablename__ = "s9sys_alerteventdefinition"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    application: Mapped[str] = mapped_column(String, nullable=False)
    event: Mapped[str] = mapped_column(String, nullable=False)
    isactive: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    readonly: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    eventtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Alerthistory(Base):
    __tablename__ = "s9sys_alerthistory"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    serialno: Mapped[str] = mapped_column(String, nullable=False)
    entryserialno: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    companycode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    alertid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    application: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    event: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    alertmode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    executedtime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Authorisedpospatches(Base):
    __tablename__ = "s9sys_authorisedpospatches"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    srlno: Mapped[int] = mapped_column(Integer, nullable=False)
    patchid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    patchname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    releaseno: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    approvedstatus: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    finaldateforpatch: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    dateinsert: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Baksissysparam(Base):
    __tablename__ = "s9sys_baksissysparam"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    default: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    datatype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    displayname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Browsesettings(Base):
    __tablename__ = "s9sys_browsesettings"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    browseid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    browsetype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    browsename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    userid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    trntype: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    fldname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fldcaption: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fldtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fldenabled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    dispinbrowse: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    dispinfilter: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    dispinresult: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    alowfilter: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    condition: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    searchval1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    searchval2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    othvalue: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sortorder: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Communicationconfig(Base):
    __tablename__ = "s9sys_communicationconfig"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    configname: Mapped[str] = mapped_column(String, nullable=False)
    srlno: Mapped[int] = mapped_column(Integer, nullable=False)
    profilecode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    configtype: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    isactive: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    datemodified: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Custompatchlocationdtls(Base):
    __tablename__ = "s9sys_custompatchlocationdtls"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    srlno: Mapped[int] = mapped_column(Integer, nullable=False)
    custmpatchname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    downloadtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    locationaddress: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    portno: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    activeftp: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    dateinsert: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    activeflag: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Liveupdatepatdtls(Base):
    __tablename__ = "s9sys_liveupdatepatdtls"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    slno: Mapped[int] = mapped_column(Integer, nullable=False)
    patchversion: Mapped[str] = mapped_column(String, nullable=False)
    componentname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    componenttype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    componentlocation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    componentpath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    regreqd: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Patchdownloaddetails(Base):
    __tablename__ = "s9sys_patchdownloaddetails"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    patchnumber: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    patchname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    releasenumber: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    patchdate: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    iscustompatch: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    downloadtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    downloaddate: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sisjobid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Printdesignercategory(Base):
    __tablename__ = "s9sys_printdesignercategory"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    catid: Mapped[str] = mapped_column(String, nullable=False)
    categorycap: Mapped[str] = mapped_column(String, nullable=False)
    categoryparent: Mapped[str] = mapped_column(String, nullable=False)
    displayorder: Mapped[int] = mapped_column(Integer, nullable=False)
    catactive: Mapped[int] = mapped_column(Integer, nullable=False)
    catcreationtype: Mapped[str] = mapped_column(String, nullable=False)
    cattype: Mapped[str] = mapped_column(String, nullable=False)
    catremarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalcatdetail1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalcatdetail2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalcatdetail3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalcatdetail4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalcatdetail5: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalcatdetail6: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Printdesignerfields(Base):
    __tablename__ = "s9sys_printdesignerfields"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    catrefid: Mapped[str] = mapped_column(String, nullable=False)
    fieldname: Mapped[str] = mapped_column(String, nullable=False)
    fielddisplaycaption: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fielddescription: Mapped[str] = mapped_column(String, nullable=False)
    fielddatatype: Mapped[str] = mapped_column(String, nullable=False)
    fielddisplayorder: Mapped[int] = mapped_column(Integer, nullable=False)
    fieldpreviewdata: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fieldactive: Mapped[int] = mapped_column(Integer, nullable=False)
    fieldtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fieldremarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fieldenv: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sistemplatename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    setuptype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    compcode: Mapped[str] = mapped_column(String, nullable=False)
    trntype: Mapped[str] = mapped_column(String, nullable=False)
    fieldkeyid: Mapped[str] = mapped_column(String, nullable=False)
    isgeneralfield: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    additionalfielddetail1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalfielddetail2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalfielddetail3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalfielddetail4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalfielddetail5: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionalfielddetail6: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Printdesignertrngrpinfo(Base):
    __tablename__ = "s9sys_printdesignertrngrpinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    trntype: Mapped[int] = mapped_column(Integer, nullable=False)
    trncaption: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    trngroupname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    grouporder: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    trnorderingroup: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    isactive: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionaltrngrpdetail1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionaltrngrpdetail2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionaltrngrpdetail3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionaltrngrpdetail4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    additionaltrngrpdetail5: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    shoperdbver: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class Reportactioninfo(Base):
    __tablename__ = "s9sys_reportactioninfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    taskid: Mapped[int] = mapped_column(Integer, nullable=False)
    actionname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    actiontype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    actionobject: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    arguments: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Reportconfigfields(Base):
    __tablename__ = "s9sys_reportconfigfields"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    taskid: Mapped[int] = mapped_column(Integer, nullable=False)
    fieldname: Mapped[str] = mapped_column(String, nullable=False)
    fieldtype: Mapped[str] = mapped_column(String, nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    orderno: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    isrepeatable: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Reportconfigs(Base):
    __tablename__ = "s9sys_reportconfigs"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    taskid: Mapped[int] = mapped_column(Integer, nullable=False)
    defaulttitle: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    maxallowed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    minallowed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sistransaction: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    loaddefault: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Reportinfo(Base):
    __tablename__ = "s9sys_reportinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    pgmoption: Mapped[int] = mapped_column(Integer, nullable=False)
    taskid: Mapped[int] = mapped_column(Integer, nullable=False)
    taskname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tasktype: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    periodtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Reportscheduledetails(Base):
    __tablename__ = "s9sys_reportscheduledetails"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    companycode: Mapped[str] = mapped_column(String, nullable=False)
    scheduleid: Mapped[str] = mapped_column(String, nullable=False)
    entryserial: Mapped[int] = mapped_column(Integer, nullable=False)
    reportconfigname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    communicationmode: Mapped[str] = mapped_column(String, nullable=False)
    communicationinfo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    datemodified: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompanycode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Reportscheduleheader(Base):
    __tablename__ = "s9sys_reportscheduleheader"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    companycode: Mapped[str] = mapped_column(String, nullable=False)
    scheduleid: Mapped[str] = mapped_column(String, nullable=False)
    schedulename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timetype: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    starttime: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timerange: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    patterntype: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    patternvalue: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    startdate: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rangetype: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rangerecurrances: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    lastexecutedtime: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    datemodified: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompanycode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    restrictuserid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Reportschedulehistory(Base):
    __tablename__ = "s9sys_reportschedulehistory"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    scheduleid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    reportconfigname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    communicationmode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    executedtime: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Reportvariableinfo(Base):
    __tablename__ = "s9sys_reportvariableinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    taskid: Mapped[int] = mapped_column(Integer, nullable=False)
    variablename: Mapped[str] = mapped_column(String, nullable=False)
    variablevalue: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Shoperscriptupdateinfo(Base):
    __tablename__ = "s9sys_shoperscriptupdateinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    scriptid: Mapped[str] = mapped_column(String, nullable=False)
    runsrl: Mapped[int] = mapped_column(Integer, nullable=False)
    progid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbexecuted: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    forversion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    shprogenv: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    argumenttype: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    argumentdata: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    scriptfilename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dateexecuted: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    shoperdate: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    currentvactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Shprmanifest(Base):
    __tablename__ = "s9sys_shprmanifest"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    dllname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    typelibtlbid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dllversion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    flags: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    helpdir: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    comclassid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    threadingmodel: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    progid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    classdesc: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    applicationname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    isitactive: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    hoposopt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Shprmanifestlink(Base):
    __tablename__ = "s9sys_shprmanifestlink"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    appname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    linkdllname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sisfieldtemplates(Base):
    __tablename__ = "s9sys_sisfieldtemplates"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    subtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    templatename: Mapped[str] = mapped_column(String, nullable=False)
    shorttablename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fieldname: Mapped[str] = mapped_column(String, nullable=False)
    templatetype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    datatype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    codefield: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    querycode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    optional: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    groupable: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    groupcondition: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sisformulatemplates(Base):
    __tablename__ = "s9sys_sisformulatemplates"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    templatename: Mapped[str] = mapped_column(String, nullable=False)
    formula: Mapped[str] = mapped_column(String, nullable=False)
    otherstn: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sisjoblisthistory(Base):
    __tablename__ = "s9sys_sisjoblisthistory"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    jobid: Mapped[str] = mapped_column(String, nullable=False)
    jobtype: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    owner: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    type: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    parentid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    isschedulejob: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    request: Mapped[str] = mapped_column(String, nullable=False)
    progress: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    retrycount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    creationtime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    lastupdatetime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    taskcounter: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    successcount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    failcount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sisjoblist(Base):
    __tablename__ = "s9sys_sisjoblist"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    jobid: Mapped[str] = mapped_column(String, nullable=False)
    jobtype: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    owner: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    type: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    parentid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    isschedulejob: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    request: Mapped[str] = mapped_column(String, nullable=False)
    progress: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    retrycount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    creationtime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    lastupdatetime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    taskcounter: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    successcount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    failcount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sisobjectinfo(Base):
    __tablename__ = "s9sys_sisobjectinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    subtype: Mapped[str] = mapped_column(String, nullable=False)
    overridingsubtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    shorttablename: Mapped[str] = mapped_column(String, nullable=False)
    othershorttablename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    objecthierarchy: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    parentobject: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    optional: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    objectname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mandatorytemplates: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sisquerylookup(Base):
    __tablename__ = "s9sys_sisquerylookup"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    querycode: Mapped[str] = mapped_column(String, nullable=False)
    querystring: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    querytype: Mapped[int] = mapped_column(Integer, nullable=False)
    precedence: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dllpath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ispreexecute: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sisqueryparam(Base):
    __tablename__ = "s9sys_sisqueryparam"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    querycode: Mapped[str] = mapped_column(String, nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    paramname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    paramtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    paramvalue: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sissysparam(Base):
    __tablename__ = "s9sys_sissysparam"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    srlno: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    default: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    datatype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    displayname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sistableinfo(Base):
    __tablename__ = "s9sys_sistableinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    shorttablename: Mapped[str] = mapped_column(String, nullable=False)
    tablename: Mapped[str] = mapped_column(String, nullable=False)
    sourcedb: Mapped[str] = mapped_column(String, nullable=False)
    hoandpos: Mapped[str] = mapped_column(String, nullable=False)
    hierarchy: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pkeyfields: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sistablerelationdetails(Base):
    __tablename__ = "s9sys_sistablerelationdetails"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    table1: Mapped[str] = mapped_column(String, nullable=False)
    table2: Mapped[str] = mapped_column(String, nullable=False)
    field1: Mapped[str] = mapped_column(String, nullable=False)
    field2: Mapped[str] = mapped_column(String, nullable=False)
    condition: Mapped[str] = mapped_column(String, nullable=False)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sistablerelation(Base):
    __tablename__ = "s9sys_sistablerelation"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    table1: Mapped[str] = mapped_column(String, nullable=False)
    table2: Mapped[str] = mapped_column(String, nullable=False)
    joincondition: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    jointype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sistasklist(Base):
    __tablename__ = "s9sys_sistasklist"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    jobid: Mapped[str] = mapped_column(String, nullable=False)
    taskid: Mapped[int] = mapped_column(Integer, nullable=False)
    lastupdatetime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    progress: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    filename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    retrycount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sistasklisthistory(Base):
    __tablename__ = "s9sys_sistasklisthistory"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    jobid: Mapped[str] = mapped_column(String, nullable=False)
    taskid: Mapped[int] = mapped_column(Integer, nullable=False)
    lastupdatetime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    progress: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    filename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    retrycount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sistransactiontemplatesinfo(Base):
    __tablename__ = "s9sys_sistransactiontemplatesinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    templatename: Mapped[str] = mapped_column(String, nullable=False)
    subtype: Mapped[str] = mapped_column(String, nullable=False)
    shorttablename: Mapped[str] = mapped_column(String, nullable=False)
    optional: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Sistransactioninfo(Base):
    __tablename__ = "s9sys_sistransactioninfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    subtype: Mapped[str] = mapped_column(String, nullable=False)
    trnnumber: Mapped[int] = mapped_column(Integer, nullable=False)
    trnfield: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Siswrapper(Base):
    __tablename__ = "s9sys_siswrapper"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    subtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    templatename: Mapped[str] = mapped_column(String, nullable=False)
    shorttablename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fieldname: Mapped[str] = mapped_column(String, nullable=False)
    templatetype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    datatype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    codefield: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    querycode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    optional: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    groupable: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    groupcondition: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    templatekey: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    trnnumber: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sourcedb: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tablename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hierarchy: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Tmpchkfordbconsistencytab(Base):
    __tablename__ = "s9sys_tmpchkfordbconsistencytab"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    error: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    state: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    messagetext: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    repairlevel: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dbid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    objectid: Mapped[Optional[BigInteger]] = mapped_column(BigInteger, nullable=True)
    indexid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    partitionid: Mapped[Optional[BigInteger]] = mapped_column(BigInteger, nullable=True)
    allocunitid: Mapped[Optional[BigInteger]] = mapped_column(BigInteger, nullable=True)
    file: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    page: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    slot: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    reffile: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    refpage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    refslot: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    allocation: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vacompany(Base):
    __tablename__ = "s9sys_vacompany"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    compcode: Mapped[str] = mapped_column(String, nullable=False)
    nm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    compwght: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dbname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpasswd: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbprovider: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbtype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbserver: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbusername: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbsharedir: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbindir: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dboutdir: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpath1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbname1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpasswd1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbprovider1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbtype1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbserver1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbusername1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpath2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbname2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpasswd2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbprovider2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbtype2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbserver2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbusername2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpath3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbname3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpasswd3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbprovider3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbtype3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbserver3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbusername3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpath4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbname4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbpasswd4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbprovider4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbtype4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbserver4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbusername4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ndcreateallowed: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ndwisenumbpresent: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    maintndwisedevice: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    templatename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    templatepath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    templatever: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    environmenttype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    databaseversion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    companyactive: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    checkupdate: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    windowsauthappdb: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    windowsauthdb1: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    windowsauthdb2: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    windowsauthdb3: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    windowsauthdb4: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Tmpshortcuttablesuper(Base):
    __tablename__ = "s9sys_tmpshortcuttablesuper"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    mnuno: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    menuopt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    compcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    idtype: Mapped[str] = mapped_column(String, nullable=False)
    paneltype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    buttonsrlno: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    buttonname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    apptype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appopt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    pgmopt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    displayicon: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    iconname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    positiontop: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    positionleft: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    allowed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    exeright: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vacompwisemnuopt(Base):
    __tablename__ = "s9sys_vacompwisemnuopt"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    compcode: Mapped[str] = mapped_column(String, nullable=False)
    mnuno: Mapped[int] = mapped_column(Integer, nullable=False)
    mnuoptno: Mapped[int] = mapped_column(Integer, nullable=False)
    optwght: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vacompwiseuserpriority(Base):
    __tablename__ = "s9sys_vacompwiseuserpriority"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    compcode: Mapped[str] = mapped_column(String, nullable=False)
    loginid: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    multisession: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vadeviceids(Base):
    __tablename__ = "s9sys_vadeviceids"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    deviceid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    devicename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    deviceremarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vacontexthelpdtls(Base):
    __tablename__ = "s9sys_vacontexthelpdtls"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    appname: Mapped[str] = mapped_column(String, nullable=False)
    pgmoption: Mapped[int] = mapped_column(Integer, nullable=False)
    controlname: Mapped[str] = mapped_column(String, nullable=False)
    srlno: Mapped[int] = mapped_column(Integer, nullable=False)
    transid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    helpcontextid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    helppath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    helpfilename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appnotedtls: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    remindflag: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    remindnos: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vagenlookup(Base):
    __tablename__ = "s9sys_vagenlookup"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    recid: Mapped[int] = mapped_column(Integer, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    descr: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    flag: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vagroup(Base):
    __tablename__ = "s9sys_vagroup"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    groupid: Mapped[str] = mapped_column(String, nullable=False)
    groupdescr: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vagroupwiseuserlist(Base):
    __tablename__ = "s9sys_vagroupwiseuserlist"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    loginid: Mapped[str] = mapped_column(String, nullable=False)
    groupid: Mapped[str] = mapped_column(String, nullable=False)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vagrouprestrict(Base):
    __tablename__ = "s9sys_vagrouprestrict"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    mnuno: Mapped[int] = mapped_column(Integer, nullable=False)
    menuopt: Mapped[int] = mapped_column(Integer, nullable=False)
    groupid: Mapped[str] = mapped_column(String, nullable=False)
    mnucap: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    allowed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    onetimeallowed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    exeright: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Valoghistory(Base):
    __tablename__ = "s9sys_valoghistory"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    logctrlno: Mapped[str] = mapped_column(String, nullable=False)
    logsrlno: Mapped[int] = mapped_column(Integer, nullable=False)
    loginid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodeid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    compcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    logdate: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    activitytype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    activitystatus: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    logremarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dateinsert: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vamenu(Base):
    __tablename__ = "s9sys_vamenu"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    mnuno: Mapped[int] = mapped_column(Integer, nullable=False)
    menuopt: Mapped[int] = mapped_column(Integer, nullable=False)
    mnuname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mnucap: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mnupgm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mnuwght: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    allowwhentrnclosed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    pgmopt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dbinfo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    menuicon: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    menusep: Mapped[bool] = mapped_column(Boolean, nullable=False)
    menubold: Mapped[bool] = mapped_column(Boolean, nullable=False)
    multiinstance: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vamenushortcut(Base):
    __tablename__ = "s9sys_vamenushortcut"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    compcode: Mapped[str] = mapped_column(String, nullable=False)
    id: Mapped[str] = mapped_column(String, nullable=False)
    idtype: Mapped[str] = mapped_column(String, nullable=False)
    paneltype: Mapped[str] = mapped_column(String, nullable=False)
    buttonsrlno: Mapped[int] = mapped_column(Integer, nullable=False)
    buttonname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    apptype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appopt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    pgmopt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    displayicon: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    iconname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    positiontop: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    positionleft: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dateinsert: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vanode(Base):
    __tablename__ = "s9sys_vanode"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    nodeid: Mapped[str] = mapped_column(String, nullable=False)
    nm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodewt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    clienttype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    deviceid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    verupdated: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    active: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ipaddress: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    computernm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodeskip: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vanodedtls(Base):
    __tablename__ = "s9sys_vanodedtls"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    nodeid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    compcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    pgmname: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    prefixdecider: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    returnvalue: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ruledetails: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    pgmopt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vanoderestrict(Base):
    __tablename__ = "s9sys_vanoderestrict"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    mnuno: Mapped[int] = mapped_column(Integer, nullable=False)
    menuopt: Mapped[int] = mapped_column(Integer, nullable=False)
    nodeid: Mapped[str] = mapped_column(String, nullable=False)
    mnucap: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    allowed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    onetimeallowed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    exeright: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vanodeextd(Base):
    __tablename__ = "s9sys_vanodeextd"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    nodeid: Mapped[str] = mapped_column(String, nullable=False)
    nodeac1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodeac2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodeac3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodeac4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodeac5: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vapasswordhistory(Base):
    __tablename__ = "s9sys_vapasswordhistory"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    loginid: Mapped[str] = mapped_column(String, nullable=False)
    srlno: Mapped[int] = mapped_column(Integer, nullable=False)
    loginpwd: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    updtdate: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vapatchdtls(Base):
    __tablename__ = "s9sys_vapatchdtls"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    compcd: Mapped[str] = mapped_column(String, nullable=False)
    companynm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nodeid: Mapped[str] = mapped_column(String, nullable=False)
    patchversion: Mapped[str] = mapped_column(String, nullable=False)
    patchdt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    systemdate: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    patshopersysdt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    patchenginever: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    trntypectrlnodtls: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dbscriptupdt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    otherrmks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    otherrmks1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    otherrmks2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    secdbbackuptaken: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    appdbbackuptaken: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    appsecdbbackuptaken: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Varestrictinfo(Base):
    __tablename__ = "s9sys_varestrictinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    restrictid: Mapped[str] = mapped_column(String, nullable=False)
    restrictlevel: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dateinsert: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Varestrictmnu(Base):
    __tablename__ = "s9sys_varestrictmnu"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    mnuno: Mapped[int] = mapped_column(Integer, nullable=False)
    menuopt: Mapped[int] = mapped_column(Integer, nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False)
    mnucap: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    allowed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    onetimeallowed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    exeright: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Varestrictmnuconfig(Base):
    __tablename__ = "s9sys_varestrictmnuconfig"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    mnuno: Mapped[int] = mapped_column(Integer, nullable=False)
    menuopt: Mapped[int] = mapped_column(Integer, nullable=False)
    exename: Mapped[str] = mapped_column(String, nullable=False)
    exeoption: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    optcaption: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vasecurityconfig(Base):
    __tablename__ = "s9sys_vasecurityconfig"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    id: Mapped[str] = mapped_column(String, nullable=False)
    descr: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    paramcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    boolean: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    intg: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    txt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    sng: Mapped[Optional[Float]] = mapped_column(Float, nullable=True)
    cur: Mapped[Optional[float]] = mapped_column(Numeric, nullable=True)
    opt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    fixed: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    changed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    catsrlno: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    paramsrlno: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vauser(Base):
    __tablename__ = "s9sys_vauser"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    loginid: Mapped[str] = mapped_column(String, nullable=False)
    nm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    userwt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    loginpwd: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vauserextdinfo(Base):
    __tablename__ = "s9sys_vauserextdinfo"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    loginid: Mapped[str] = mapped_column(String, nullable=False)
    statusflag: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    invalidlogcount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    acctexpirydt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    pwdupdateddt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    mobilecode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mobileno: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    emailid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dateinsert: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vausg(Base):
    __tablename__ = "s9sys_vausg"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    loginname: Mapped[str] = mapped_column(String, nullable=False)
    compcode: Mapped[str] = mapped_column(String, nullable=False)
    dtinout: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    timeinout: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    inuse: Mapped[bool] = mapped_column(Boolean, nullable=False)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Vavertable(Base):
    __tablename__ = "s9sys_vavertable"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    nodeid: Mapped[str] = mapped_column(String, nullable=False)
    exesrl: Mapped[int] = mapped_column(Integer, nullable=False)
    exeid: Mapped[str] = mapped_column(String, nullable=False)
    exename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exesize: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    exever: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exeminor: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exesubrel: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exeminver: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exeminminor: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exeminsubrel: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    execompatible: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exedepends: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exedepends2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exedepends3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exedepends4: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exedate: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    exelastupdated: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    exeskip: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    execheck: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class TraceXeActionMap(Base):
    __tablename__ = "s9sys_trace_xe_action_map"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class TraceXeEventMap(Base):
    __tablename__ = "s9sys_trace_xe_event_map"

    smriti_id: Mapped[UUID] = mapped_column(UUID, primary_key=True, server_default=text("uuid_generate_v4()"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, nullable=False)
    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)

