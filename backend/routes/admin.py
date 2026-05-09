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
    from flask import request
    # Use -1 or 0 for unlimited, default to 10
    limit = request.args.get('limit', 10, type=int)
    
    total_income = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
    total_expense = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
    
    # Recent activities
    query = FarmRecord.query.order_by(FarmRecord.date.desc())
    
    if limit > 0:
        recent = query.limit(limit).all()
    else:
        recent = query.all()

    activities = [{
        'id': r.id,
        'date': r.date.strftime('%Y-%m-%d') if r.date else '',
        'activity_type': r.activity_type,
        'category': r.category,
        'expense_type': r.expense_type,
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
            new_note = Note(
                content=data.get('content'),
                category=data.get('category', 'General')
            )
            db.session.add(new_note)
            db.session.commit()
            return jsonify({'status': 'success'}), 201
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    
    notes = Note.query.order_by(Note.created_at.desc()).all()
    return jsonify([{
        'id': n.id,
        'content': n.content,
        'category': n.category,
        'date': n.created_at.strftime('%Y-%m-%d %H:%M')
    } for n in notes])
@admin_routes.route('/api/admin/crops', methods=['GET', 'POST'])
def manage_crops_api():
    from flask import request
    if request.method == 'POST':
        data = request.json
        try:
            new_crop = Crop(
                crop_name=data.get('crop_name'),
                variety=data.get('variety'),
                area=data.get('area'),
                sowing_date=datetime.datetime.strptime(data['sowing_date'], '%Y-%m-%d').date() if data.get('sowing_date') else None,
                expected_harvest=datetime.datetime.strptime(data['expected_harvest'], '%Y-%m-%d').date() if data.get('expected_harvest') else None,
                notes=data.get('notes'),
                status=data.get('status', 'Active')
            )
            db.session.add(new_crop)
            db.session.commit()
            return jsonify({'status': 'success'}), 201
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    
    crops = Crop.query.order_by(Crop.sowing_date.desc()).all()
    return jsonify([{
        'id': c.id,
        'crop_name': c.crop_name,
        'variety': c.variety,
        'area': c.area,
        'sowing_date': c.sowing_date.strftime('%Y-%m-%d') if c.sowing_date else '',
        'expected_harvest': c.expected_harvest.strftime('%Y-%m-%d') if c.expected_harvest else '',
        'status': c.status,
        'notes': c.notes
    } for c in crops])

@admin_routes.route('/api/admin/yields', methods=['GET', 'POST'])
def manage_yields_api():
    from flask import request
    if request.method == 'POST':
        data = request.json
        try:
            new_yield = Yield(
                date=datetime.datetime.strptime(data['date'], '%Y-%m-%d').date() if data.get('date') else datetime.date.today(),
                crop_id=data.get('crop_id'),
                yield_value=float(data.get('yield_value', 0)),
                unit=data.get('unit'),
                yield_in_kg=float(data.get('yield_in_kg', 0)),
                notes=data.get('notes')
            )
            db.session.add(new_yield)
            db.session.commit()
            return jsonify({'status': 'success'}), 201
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    
    yields = Yield.query.order_by(Yield.date.desc()).all()
    return jsonify([{
        'id': y.id,
        'date': y.date.strftime('%Y-%m-%d') if y.date else '',
        'crop_name': y.crop.crop_name if y.crop else 'Unknown',
        'yield_value': y.yield_value,
        'unit': y.unit,
        'yield_in_kg': y.yield_in_kg,
        'notes': y.notes
    } for y in yields])

@admin_routes.route('/api/admin/disease_logs', methods=['GET', 'POST'])
def manage_disease_logs_api():
    from flask import request
    if request.method == 'POST':
        data = request.json
        try:
            new_log = DiseaseLog(
                date=datetime.datetime.strptime(data['date'], '%Y-%m-%d').date() if data.get('date') else datetime.date.today(),
                crop_id=data.get('crop_id'),
                disease_name=data.get('disease_name'),
                severity=data.get('severity'),
                affected_area=data.get('affected_area'),
                treatment=data.get('treatment'),
                notes=data.get('notes')
            )
            db.session.add(new_log)
            db.session.commit()
            return jsonify({'status': 'success'}), 201
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    
    logs = DiseaseLog.query.order_by(DiseaseLog.date.desc()).all()
    return jsonify([{
        'id': l.id,
        'date': l.date.strftime('%Y-%m-%d') if l.date else '',
        'crop_name': l.crop.crop_name if l.crop else 'Unknown',
        'disease_name': l.disease_name,
        'severity': l.severity,
        'affected_area': l.affected_area,
        'treatment': l.treatment,
        'notes': l.notes
    } for l in logs])

@admin_routes.route('/api/admin/reminders', methods=['GET', 'POST', 'PATCH'])
def manage_reminders_api():
    from flask import request
    if request.method == 'POST':
        data = request.json
        try:
            new_rem = Reminder(
                date=datetime.datetime.strptime(data['date'], '%Y-%m-%d').date(),
                title=data.get('title'),
                description=data.get('description'),
                priority=data.get('priority', 'Normal')
            )
            db.session.add(new_rem)
            db.session.commit()
            return jsonify({'status': 'success'}), 201
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
            
    if request.method == 'PATCH':
        # Mark as completed
        data = request.json
        rem = Reminder.query.get(data.get('id'))
        if rem:
            rem.completed = data.get('completed', True)
            db.session.commit()
            return jsonify({'status': 'success'})
        return jsonify({'status': 'error', 'message': 'Not found'}), 404
    
    reminders = Reminder.query.order_by(Reminder.date.asc()).all()
    return jsonify([{
        'id': r.id,
        'date': r.date.strftime('%Y-%m-%d') if r.date else '',
        'title': r.title,
        'description': r.description,
        'priority': r.priority,
        'completed': r.completed
    } for r in reminders])

@admin_routes.route('/api/admin/weather/history')
def weather_history_api():
    from flask import request
    days = request.args.get('days', 30, type=int)
    history = WeatherLog.query.order_by(WeatherLog.date.desc()).limit(days).all()
    
    return jsonify([{
        'date': w.date.strftime('%Y-%m-%d'),
        'temp': w.max_temp,
        'rainfall': w.rainfall,
        'condition': w.description
    } for w in history[::-1]]) # Return in chronological order
