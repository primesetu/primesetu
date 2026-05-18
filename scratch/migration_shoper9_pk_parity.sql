-- SMRITI-OS: Shoper9 PK Parity Migration
-- Aligns SMRITI PKs with Shoper9 SHOPER9X01 tested structure
-- tenant_id is ALWAYS appended at end (SMRITI multi-tenant enhancement)
-- Tables to fix: 1
-- Run in psql or pgAdmin

-- genlookupextd
--   Shoper9 PK:  ['recid']
--   Current PK:  ['recid', 'code', 'tenant_id']
--   New PK:      ['recid', 'tenant_id']
ALTER TABLE s9.genlookupextd DROP CONSTRAINT genlookupextd_pkey;
ALTER TABLE s9.genlookupextd ADD CONSTRAINT genlookupextd_pkey PRIMARY KEY (recid, tenant_id);
