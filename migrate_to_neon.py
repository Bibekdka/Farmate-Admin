import sqlite3
import psycopg
import os
from datetime import datetime

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
        try:
            # Check which columns actually exist in SQLite
            sl_cursor.execute(f"PRAGMA table_info({table_name})")
            existing_cols = [row[1] for row in sl_cursor.fetchall()]
            
            if not existing_cols:
                print(f"Table {table_name} does not exist in SQLite")
                return

            # Build SELECT statement with defaults for missing columns
            select_cols = []
            for col in columns:
                if col in existing_cols:
                    select_cols.append(col)
                else:
                    if col == 'category' and table_name == 'note':
                        select_cols.append("'General' as category")
                    else:
                        select_cols.append(f"NULL as {col}")
            
            sl_cursor.execute(f"SELECT {', '.join(select_cols)} FROM {table_name}")
            rows = sl_cursor.fetchall()
        except Exception as e:
            print(f"Error reading {table_name} from SQLite: {e}")
            return
        
        if not rows:
            print(f"No data in {table_name}")
            return

        # Prepare INSERT statement
        placeholders = ', '.join(['%s'] * len(columns))
        insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders}) ON CONFLICT (id) DO UPDATE SET {', '.join([f'{col} = EXCLUDED.{col}' for col in columns if col != 'id'])}"
        
        pg_cursor.executemany(insert_query, rows)
        pg_conn.commit()
        print(f"Successfully migrated {len(rows)} rows to {table_name}")

    try:
        # 1. Create tables in PG first
        pg_cursor.execute("""
            CREATE TABLE IF NOT EXISTS farm_record (
                id SERIAL PRIMARY KEY,
                date DATE,
                activity_type VARCHAR(50),
                category VARCHAR(50),
                expense_type VARCHAR(50),
                amount FLOAT,
                description VARCHAR(200)
            );
            CREATE TABLE IF NOT EXISTS note (
                id SERIAL PRIMARY KEY,
                content TEXT,
                category VARCHAR(50) DEFAULT 'General',
                created_at TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS weather_log (
                id SERIAL PRIMARY KEY,
                date DATE UNIQUE,
                max_temp FLOAT,
                rainfall FLOAT,
                description VARCHAR(100),
                created_at TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS reminder (
                id SERIAL PRIMARY KEY,
                date DATE,
                title VARCHAR(150),
                description TEXT,
                priority VARCHAR(20),
                completed BOOLEAN
            );
            CREATE TABLE IF NOT EXISTS crop (
                id SERIAL PRIMARY KEY,
                crop_name VARCHAR(100),
                variety VARCHAR(100),
                season VARCHAR(50),
                area VARCHAR(100),
                sowing_date DATE,
                expected_harvest DATE,
                status VARCHAR(50),
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS yield (
                id SERIAL PRIMARY KEY,
                date DATE,
                crop_id INTEGER REFERENCES crop(id),
                yield_value FLOAT,
                unit VARCHAR(20),
                yield_in_kg FLOAT,
                notes VARCHAR(200)
            );
            CREATE TABLE IF NOT EXISTS disease_log (
                id SERIAL PRIMARY KEY,
                date DATE,
                crop_id INTEGER REFERENCES crop(id),
                disease_name VARCHAR(100),
                severity VARCHAR(20),
                affected_area VARCHAR(100),
                treatment TEXT,
                notes VARCHAR(200)
            );
            CREATE TABLE IF NOT EXISTS pest_log (
                id SERIAL PRIMARY KEY,
                date DATE,
                crop_name VARCHAR(50),
                pest_name VARCHAR(50),
                value FLOAT,
                alert_status VARCHAR(20),
                notes VARCHAR(200)
            );
        """)
        pg_conn.commit()

        # 2. Migrate data
        migrate_table('farm_record', ['id', 'date', 'activity_type', 'category', 'expense_type', 'amount', 'description'])
        migrate_table('note', ['id', 'content', 'category', 'created_at'])
        migrate_table('weather_log', ['id', 'date', 'max_temp', 'rainfall', 'description', 'created_at'])
        migrate_table('reminder', ['id', 'date', 'title', 'description', 'priority', 'completed'])
        migrate_table('crop', ['id', 'crop_name', 'variety', 'season', 'area', 'sowing_date', 'expected_harvest', 'status', 'notes'])
        migrate_table('yield', ['id', 'date', 'crop_id', 'yield_value', 'unit', 'yield_in_kg', 'notes'])
        migrate_table('disease_log', ['id', 'date', 'crop_id', 'disease_name', 'severity', 'affected_area', 'treatment', 'notes'])
        migrate_table('pest_log', ['id', 'date', 'crop_name', 'pest_name', 'value', 'alert_status', 'notes'])

    except Exception as e:
        print(f"Migration error: {e}")
        pg_conn.rollback()
    finally:
        sl_conn.close()
        pg_conn.close()
        print("Migration complete")

if __name__ == "__main__":
    migrate()
