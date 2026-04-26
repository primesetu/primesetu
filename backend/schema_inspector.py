import asyncio
import logging
logging.getLogger('sqlalchemy').setLevel(logging.ERROR)

from app.core.database import engine
from app.models.base import Base
from app.models import purchase # ensure purchase models are imported

async def test():
    for name, table in Base.metadata.tables.items():
        try:
            async with engine.begin() as conn:
                await conn.execute(table.select().limit(1))
        except Exception as e:
            print(f'\n\n=== REAL ERROR in {name} ===\n{e}\n=========================')
            break
    print("Test finished")
                
asyncio.run(test())
