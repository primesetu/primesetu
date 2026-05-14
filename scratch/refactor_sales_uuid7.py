import asyncio
import time
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

def generate_uuid7():
    timestamp = int(time.time() * 1000)
    random_bytes = os.urandom(10)
    uuid_bytes = bytearray(16)
    uuid_bytes[0:6] = timestamp.to_bytes(6, byteorder='big')
    uuid_bytes[6] = (random_bytes[0] & 0x0F) | 0x70
    uuid_bytes[7] = random_bytes[1]
    uuid_bytes[8] = (random_bytes[2] & 0x3F) | 0x80
    uuid_bytes[9:] = random_bytes[3:10]
    return str(uuid.UUID(bytes=bytes(uuid_bytes)))

async def refactor_uuid7():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    
    async with engine.begin() as conn:
        print("1. Modifying schema to add UUID columns...")
        
        # We add 'id' to header
        await conn.execute(text("ALTER TABLE smriti_sale_hdr ADD COLUMN IF NOT EXISTS id UUID;"))
        # We add 'sale_id' and 'id' to details
        await conn.execute(text("ALTER TABLE smriti_sale_dtl ADD COLUMN IF NOT EXISTS id UUID;"))
        await conn.execute(text("ALTER TABLE smriti_sale_dtl ADD COLUMN IF NOT EXISTS sale_id UUID;"))

    async with engine.connect() as conn:
        print("2. Fetching headers to assign UUID v7...")
        res = await conn.execute(text("SELECT bill_no, bill_date FROM smriti_sale_hdr WHERE id IS NULL"))
        headers = res.fetchall()
        
        if headers:
            print(f"   Assigning UUIDs to {len(headers)} headers...")
            for i in range(0, len(headers), 5000):
                batch = headers[i:i+5000]
                hdr_params = []
                dtl_params = []
                for h in batch:
                    new_id = generate_uuid7()
                    hdr_params.append({"new_id": new_id, "b_no": h.bill_no, "b_date": h.bill_date})
                    dtl_params.append({"new_id": new_id, "b_no": h.bill_no})
                
                await conn.execute(
                    text("UPDATE smriti_sale_hdr SET id = CAST(:new_id AS UUID) WHERE bill_no = :b_no AND bill_date = :b_date"),
                    hdr_params
                )
                await conn.execute(
                    text("UPDATE smriti_sale_dtl SET sale_id = CAST(:new_id AS UUID) WHERE bill_no = :b_no"),
                    dtl_params
                )
                await conn.commit()
                print(f"   Processed {i+len(batch)}/{len(headers)}")

        print("3. Fetching details to assign UUID v7 to 'id'...")
        res = await conn.execute(text("SELECT bill_no, srl_no FROM smriti_sale_dtl WHERE id IS NULL"))
        details = res.fetchall()
        
        if details:
            print(f"   Assigning UUIDs to {len(details)} details...")
            for i in range(0, len(details), 5000):
                batch = details[i:i+5000]
                params = [{"new_id": generate_uuid7(), "b_no": d.bill_no, "s_no": d.srl_no} for d in batch]
                await conn.execute(
                    text("UPDATE smriti_sale_dtl SET id = CAST(:new_id AS UUID) WHERE bill_no = :b_no AND srl_no = :s_no"),
                    params
                )
                await conn.commit()
                print(f"   Processed {i+len(batch)}/{len(details)}")

    async with engine.begin() as conn:
        print("4. Applying Primary Key & Foreign Key constraints...")
        
        # Header PK
        await conn.execute(text("ALTER TABLE smriti_sale_hdr DROP CONSTRAINT IF EXISTS smriti_sale_hdr_pkey CASCADE;"))
        await conn.execute(text("ALTER TABLE smriti_sale_hdr ADD PRIMARY KEY (id);"))
        
        # Detail PK
        await conn.execute(text("ALTER TABLE smriti_sale_dtl DROP CONSTRAINT IF EXISTS smriti_sale_dtl_pkey CASCADE;"))
        await conn.execute(text("ALTER TABLE smriti_sale_dtl ADD PRIMARY KEY (id);"))
        
        # Detail FK
        await conn.execute(text("ALTER TABLE smriti_sale_dtl ADD CONSTRAINT fk_sale_hdr FOREIGN KEY (sale_id) REFERENCES smriti_sale_hdr(id);"))

        print("UUID v7 Refactoring Complete!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(refactor_uuid7())
