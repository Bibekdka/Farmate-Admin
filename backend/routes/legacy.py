from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_required, current_user
from backend.models.models import FarmRecord, Note
from backend.database import db
import datetime

legacy_routes = Blueprint('legacy_routes', __name__, template_folder='../../templates')

@legacy_routes.route('/legacy-dashboard')
@login_required
def legacy_dashboard():
    from sqlalchemy import func
    records = FarmRecord.query.order_by(FarmRecord.date.desc()).all()
    income = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
    expense = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
    profit = income - expense
    
    # Expense breakdown
    breakdown = {}
    for cat in ['Fuel', 'Labour', 'Seed', 'Water', 'Transportation', 'Medicine', 'Misc']:
        amt = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense', FarmRecord.expense_type.contains(cat)).scalar() or 0
        breakdown[cat] = amt
        
    return render_template('dashboard.html', 
                         records=records, 
                         income=income, 
                         expense=expense, 
                         profit=profit,
                         expense_breakdown=breakdown)

@legacy_routes.route('/add_record', methods=['POST'])
@login_required
def add_record():
    date_str = request.form.get('date')
    activity = request.form.get('activity')
    category = request.form.get('category')
    expense_type = request.form.getlist('expense_type') # Get list from checkboxes
    amount = request.form.get('amount')
    description = request.form.get('desc')
    
    try:
        new_record = FarmRecord(
            date=datetime.datetime.strptime(date_str, '%Y-%m-%d').date(),
            activity_type=activity,
            category=category,
            expense_type=", ".join(expense_type) if expense_type else None,
            amount=float(amount),
            description=description
        )
        db.session.add(new_record)
        db.session.commit()
        flash('Record added successfully!', 'success')
    except Exception as e:
        flash(f'Error: {e}', 'error')
    
    return redirect(url_for('legacy_routes.legacy_dashboard'))

@legacy_routes.route('/edit_record/<int:record_id>', methods=['GET', 'POST'])
@login_required
def edit_record(record_id):
    record = FarmRecord.query.get_or_404(record_id)
    if request.method == 'POST':
        record.date = datetime.datetime.strptime(request.form.get('date'), '%Y-%m-%d').date()
        record.activity_type = request.form.get('activity')
        record.category = request.form.get('category')
        record.expense_type = ", ".join(request.form.getlist('expense_type'))
        record.amount = float(request.form.get('amount'))
        record.description = request.form.get('desc')
        db.session.commit()
        flash('Record updated!', 'success')
        return redirect(url_for('legacy_routes.legacy_dashboard'))
    return render_template('edit_record.html', record=record)

@legacy_routes.route('/delete_record/<int:record_id>', methods=['POST'])
@login_required
def delete_record(record_id):
    record = FarmRecord.query.get_or_404(record_id)
    db.session.delete(record)
    db.session.commit()
    flash('Record deleted!', 'success')
    return redirect(url_for('legacy_routes.legacy_dashboard'))

@legacy_routes.route('/quick_note', methods=['POST'])
@login_required
def quick_note():
    content = request.form.get('content')
    if content:
        note = Note(content=content, category='General')
        db.session.add(note)
        db.session.commit()
        flash('Log saved!', 'success')
    return redirect(url_for('admin_routes.admin_home'))
