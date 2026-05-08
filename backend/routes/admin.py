from flask import Blueprint, render_template, jsonify
from sqlalchemy import func
from backend.models.models import FarmRecord, Reminder, WeatherLog
from backend.database import db
import datetime

admin_routes = Blueprint('admin_routes', __name__, template_folder='../../templates')

@admin_routes.route('/')
@admin_routes.route('/admin')
@admin_routes.route('/admin/')
@admin_routes.route('/admin_dashboard')
def admin_home():
    recent_activities = FarmRecord.query.order_by(FarmRecord.date.desc()).limit(5).all()
    today_reminders = Reminder.query.filter_by(date=datetime.date.today(), completed=False).all()
    # For now, placeholder for weather
    return render_template('admin/index.html', weather=[], activities=recent_activities, reminders=today_reminders)

@admin_routes.route('/admin/dashboard')
def admin_dashboard():
    total_income = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
    total_expense = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
    net_profit = total_income - total_expense
    
    records = FarmRecord.query.order_by(FarmRecord.date.desc()).all()
    
    expense_breakdown_query = db.session.query(
        FarmRecord.expense_type, func.sum(FarmRecord.amount)
    ).filter(
        FarmRecord.category == 'Expense', 
        FarmRecord.expense_type != None
    ).group_by(FarmRecord.expense_type).all()
    
    expense_breakdown = {type_: amount for type_, amount in expense_breakdown_query}
    
    return render_template('admin/dashboard.html', income=total_income, expense=total_expense, 
                          profit=net_profit, records=records, expense_breakdown=expense_breakdown)

@admin_routes.route('/api/admin/stats')
def admin_stats_api():
    total_income = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
    total_expense = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
    
    # Recent activities
    recent = FarmRecord.query.order_by(FarmRecord.date.desc()).limit(10).all()
    activities = [{
        'id': r.id,
        'date': r.date.strftime('%Y-%m-%d') if r.date else '',
        'activity_type': r.activity_type,
        'category': r.category,
        'amount': r.amount,
        'description': r.description
    } for r in recent]
    
    # Reminders
    reminders_query = Reminder.query.filter_by(completed=False).order_by(Reminder.date.asc()).limit(5).all()
    reminders = [{
        'id': rem.id,
        'title': rem.title,
        'date': rem.date.strftime('%Y-%m-%d') if rem.date else '',
        'priority': rem.priority
    } for rem in reminders_query]

    # Weather Logs
    weather_query = WeatherLog.query.order_by(WeatherLog.date.desc()).limit(10).all()
    weather = [{
        'id': w.id,
        'date': w.date.strftime('%Y-%m-%d') if w.date else '',
        'max_temp': w.max_temp,
        'rainfall': w.rainfall,
        'description': w.description
    } for w in weather_query]

    return jsonify({
        'stats': {
            'income': total_income,
            'expense': total_expense,
            'balance': total_income - total_expense
        },
        'activities': activities,
        'reminders': reminders,
        'weather': weather
    })

@admin_routes.route('/api/admin/financial_data')
def admin_financial_data_api():
    # Placeholder for chart data - in a real app this would aggregate by month
    return jsonify({
        'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        'income': [0, 0, 0, 0, 0, 0],
        'expense': [0, 0, 0, 0, 0, 0],
        'expense_labels': ['Seeds', 'Fertilizer', 'Labor', 'Tools'],
        'expense_values': [25, 40, 20, 15]
    })

@admin_routes.route('/api/admin/records', methods=['POST'])
def add_record_api():
    from flask import request
    data = request.json
    try:
        new_record = FarmRecord(
            date=datetime.datetime.strptime(data['date'], '%Y-%m-%d').date() if data.get('date') else datetime.date.today(),
            activity_type=data.get('activity_type'),
            category=data.get('category'),
            expense_type=data.get('expense_type'),
            amount=float(data.get('amount', 0)),
            description=data.get('description')
        )
        db.session.add(new_record)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Record added successfully'}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@admin_routes.route('/api/admin/logs', methods=['GET', 'POST'])
def manage_logs_api():
    from flask import request
    from backend.models.models import Note
    if request.method == 'POST':
        data = request.json
        try:
            new_note = Note(content=data.get('content'))
            db.session.add(new_note)
            db.session.commit()
            return jsonify({'status': 'success'}), 201
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    
    notes = Note.query.order_by(Note.created_at.desc()).all()
    return jsonify([{
        'id': n.id,
        'content': n.content,
        'date': n.created_at.strftime('%Y-%m-%d %H:%M')
    } for n in notes])
