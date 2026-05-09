from backend.app import app
from backend.models.models import FarmRecord
from backend.database import db

with app.app_context():
    recent_10 = FarmRecord.query.order_by(FarmRecord.date.desc()).limit(10).all()
    sum_10 = sum(r.amount for r in recent_10)
    print(f"Sum of recent 10: {sum_10}")
    
    for i, r in enumerate(recent_10):
        print(f"  {i+1}: {r.amount} ({r.activity_type})")
