import sqlite3
import psycopg
import os

# Config
SQLITE_DB = 'instance/farm_data.db'
POSTGRES_URL = 'postgresql://neondb_owner:npg_98zXwapIHRhc@ep-shy-glade-ap5xuln9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require'

def migrate():
    if not os.path.exists(SQLITE_DB):
        print(f"Error: {SQLITE_DB} not found")
        return

    # Connect to SQLite
    sl_conn = sqlite3.connect(SQLITE_DB)
    sl_cursor = sl_conn.cursor()

    # Connect to PostgreSQL
    try:
        pg_conn = psycopg.connect(POSTGRES_URL)
        pg_cursor = pg_conn.cursor()
        print("Connected to Neon PostgreSQL")
    except Exception as e:
        print(f"Failed to connect to Neon: {e}")
        return

    # Helper to migrate a table
    def migrate_table(table_name, columns):
        print(f"Migrating table: {table_name}...")
        sl_cursor.execute(f"SELECT {', '.join(columns)} FROM {table_name}")
        rows = sl_cursor.fetchall()
        
        if not rows:
            print(f"No data in {table_name}")
            return

        # Prepare INSERT statement
        placeholders = ', '.join(['%s'] * len(columns))
        insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders}) ON CONFLICT (id) DO UPDATE SET {', '.join([f'{c}=EXCLUDED.{c}' for c in columns if c != 'id'])}"
        
        pg_cursor.executemany(insert_query, rows)
        pg_conn.commit()
        print(f"Successfully migrated {len(rows)} rows to {table_name}")

    try:
        # Migrate data
        migrate_table('farm_record', ['id', 'date', 'activity_type', 'category', 'expense_type', 'amount', 'description'])
        migrate_table('note', ['id', 'content', 'created_at'])
        migrate_table('weather_log', ['id', 'date', 'max_temp', 'rainfall', 'description', 'created_at'])

    except Exception as e:
        print(f"Migration error: {e}")
        pg_conn.rollback()
    finally:
        sl_conn.close()
        pg_conn.close()
        print("Migration complete")

if __name__ == "__main__":
    migrate()
