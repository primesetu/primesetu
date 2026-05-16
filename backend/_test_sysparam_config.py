import asyncio
import json
from app.core.database import get_db_session
from app.domains.inventory.bulk_item_service import fetch_item_field_config

async def main():
    async with get_db_session() as session:
        config = await fetch_item_field_config(session)
    print("CONFIG_DUMP:", json.dumps(config, indent=2))

asyncio.run(main())
