
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def create_sysparam_view():
    async with engine.begin() as conn:
        # Check if table has data first
        view_sql = """
        CREATE OR REPLACE VIEW public.system_parameters AS
        SELECT 
            "ParamCode" as key,
            COALESCE("Txt", "Intg"::text, "Boolean"::text, "Dt"::text, "Cur"::text) as value,
            "Descr" as description,
            'SYSTEM' as group_name,
            'SYSTEM' as tenant_id
        FROM shoper9."SysParam";
        """
        await conn.execute(text(view_sql))
        print("Created system_parameters view pointing to legacy SysParam.")

if __name__ == "__main__":
    asyncio.run(create_sysparam_view())
