import asyncio
import asyncpg

async def test():
    # Step 1: Connect to default 'postgres' db to check server + list databases
    try:
        conn = await asyncpg.connect(
            host='localhost',
            port=5434,
            user='postgres',
            password='MSba108682!@',
            database='postgres',
        )
        ver  = await conn.fetchval('SELECT version()')
        dbs  = await conn.fetch('SELECT datname FROM pg_database WHERE datistemplate=false ORDER BY datname')
        await conn.close()

        db_names = [r[0] for r in dbs]
        print('CONNECTION OK')
        print(f'Server : {ver[:80]}')
        print(f'Port   : 5434')
        print(f'DBs    : {db_names}')

        if 'smriti_local' in db_names:
            print('smriti_local : EXISTS - ready for LOCAL_POSTGRES mode')
        else:
            print('smriti_local : NOT FOUND - creating now...')
            # Create it
            conn2 = await asyncpg.connect(
                host='localhost', port=5434,
                user='postgres', password='MSba108682!@',
                database='postgres',
            )
            # Must be outside transaction to CREATE DATABASE
            await conn2.execute('CREATE DATABASE smriti_local')
            await conn2.close()
            print('smriti_local : CREATED OK')

    except Exception as e:
        print(f'FAILED: {type(e).__name__}: {e}')

asyncio.run(test())
