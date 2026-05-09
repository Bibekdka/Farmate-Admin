from backend.app import app
from backend.models.models import FarmRecord
from backend.database import db

with app.app_context():
    all_records = FarmRecord.query.all()
    
    type_sums = {}
    for r in all_records:
        t = str(r.expense_type)
        type_sums[t] = type_sums.get(t, 0) + r.amount
        
    print("Expense Type Sums:")
    for t, s in type_sums.items():
        print(f"  {t}: {s}")
