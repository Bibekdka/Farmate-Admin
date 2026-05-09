from backend.app import app
from backend.models.models import FarmRecord
from backend.database import db

with app.app_context():
    all_records = FarmRecord.query.all()
    print(f"Total Records: {len(all_records)}")
    
    categories = {}
    expense_types = {}
    
    for r in all_records:
        cat = str(r.category)
        exp = str(r.expense_type)
        categories[cat] = categories.get(cat, 0) + 1
        expense_types[exp] = expense_types.get(exp, 0) + 1
        
    print("Categories distribution:")
    for c, count in categories.items():
        print(f"  {c}: {count}")
        
    print("Expense Types distribution:")
    for e, count in expense_types.items():
        print(f"  {e}: {count}")

    # Check sum of amount where category is NOT Income or Expense
    other_sum = sum(r.amount for r in all_records if r.category not in ['Income', 'Expense'])
    print(f"Sum of 'Other' categories: {other_sum}")
    
    # Check if some amounts are strings or something? (Unlikely with SQLAlchemy Float)
    non_float_count = sum(1 for r in all_records if not isinstance(r.amount, (int, float)))
    print(f"Non-float amounts: {non_float_count}")
