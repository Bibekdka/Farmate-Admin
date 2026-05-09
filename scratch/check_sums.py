from backend.app import app
from backend.models.models import FarmRecord
from sqlalchemy import func
from backend.database import db

with app.app_context():
    # 1. Total sum via SQLAlchemy func.sum
    income_sum = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
    expense_sum = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
    
    print(f"SQL Sum - Income: {income_sum}, Expense: {expense_sum}")
    
    # 2. Total sum via Python loop over ALL records
    all_records = FarmRecord.query.all()
    py_income = sum(r.amount for r in all_records if r.category == 'Income')
    py_expense = sum(r.amount for r in all_records if r.category == 'Expense')
    
    print(f"Python Sum - Income: {py_income}, Expense: {py_expense}")
    print(f"Total Records: {len(all_records)}")
    
    # 3. Print first 5 to see values
    for r in all_records[:5]:
        print(f"- {r.id}: {r.category} | {r.amount} | {r.activity_type}")
