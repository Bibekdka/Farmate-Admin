import os
import datetime
import pandas as pd
from flask import Blueprint, send_file, request, jsonify
from sqlalchemy import func
from backend.models.models import FarmRecord, WeatherLog, db
from io import BytesIO
from fpdf import FPDF

export_routes = Blueprint('export_routes', __name__)

@export_routes.route('/api/export/xlsx')
def export_xlsx():
    try:
        # Calculate totals for summary
        total_income = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
        total_expense = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
        net_profit = total_income - total_expense
        
        # Get category breakdown
        expense_breakdown = db.session.query(
            FarmRecord.expense_type, func.sum(FarmRecord.amount)
        ).filter(
            FarmRecord.category == 'Expense',
            FarmRecord.expense_type != None
        ).group_by(FarmRecord.expense_type).all()
        
        # All records
        all_q = FarmRecord.query.order_by(FarmRecord.date.desc()).all()
        all_records = [{
            'Date': r.date.strftime('%Y-%m-%d') if r.date else '',
            'Activity': r.activity_type,
            'Category': r.category,
            'Type': r.expense_type or '-',
            'Amount (₹)': r.amount,
            'Description': r.description or '-'
        } for r in all_q]

        # Weather logs
        weather_q = WeatherLog.query.order_by(WeatherLog.date.desc()).all()
        weather_records = [{
            'Date': w.date.strftime('%Y-%m-%d') if w.date else '',
            'Max Temp (°C)': w.max_temp or 0,
            'Rainfall (mm)': w.rainfall or 0,
            'Condition': w.description or '-'
        } for w in weather_q]

        # Create Excel in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Summary Sheet
            summary_df = pd.DataFrame({
                'Metric': ['Total Income', 'Total Expenses', 'Net Profit'],
                'Value': [f"₹{total_income:,.2f}", f"₹{total_expense:,.2f}", f"₹{net_profit:,.2f}"]
            })
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Category Breakdown
            cat_df = pd.DataFrame([{'Category': item[0], 'Amount': item[1]} for item in expense_breakdown])
            cat_df.to_excel(writer, sheet_name='Expense Breakdown', index=False)
            
            # Full Records
            pd.DataFrame(all_records).to_excel(writer, sheet_name='Transactions', index=False)
            
            # Weather
            pd.DataFrame(weather_records).to_excel(writer, sheet_name='Weather History', index=False)

        output.seek(0)
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'Farmate_Report_{timestamp}.xlsx'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@export_routes.route('/api/export/pdf')
def export_pdf():
    try:
        total_income = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
        total_expense = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
        
        all_q = FarmRecord.query.order_by(FarmRecord.date.desc()).limit(100).all()

        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(190, 10, "Farmate Financial Report", ln=True, align='C')
        pdf.set_font("Arial", '', 10)
        pdf.cell(190, 10, f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align='C')
        pdf.ln(10)
        
        # Summary
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(190, 10, "Financial Summary", ln=True)
        pdf.set_font("Arial", '', 11)
        pdf.cell(95, 10, f"Total Income: INR {total_income:,.2f}")
        pdf.cell(95, 10, f"Total Expenses: INR {total_expense:,.2f}", ln=True)
        pdf.set_font("Arial", 'B', 11)
        pdf.cell(190, 10, f"Net Profit: INR {(total_income - total_expense):,.2f}", ln=True)
        pdf.ln(10)
        
        # Table Header
        pdf.set_font("Arial", 'B', 10)
        pdf.set_fill_color(240, 240, 240)
        pdf.cell(30, 10, "Date", 1, 0, 'C', True)
        pdf.cell(70, 10, "Activity", 1, 0, 'C', True)
        pdf.cell(30, 10, "Category", 1, 0, 'C', True)
        pdf.cell(30, 10, "Type", 1, 0, 'C', True)
        pdf.cell(30, 10, "Amount", 1, 1, 'C', True)
        
        # Table Body
        pdf.set_font("Arial", '', 9)
        for r in all_q:
            pdf.cell(30, 8, r.date.strftime('%Y-%m-%d') if r.date else '', 1)
            pdf.cell(70, 8, (r.activity_type[:35] + '..') if len(r.activity_type) > 35 else r.activity_type, 1)
            pdf.cell(30, 8, r.category, 1)
            pdf.cell(30, 8, (r.expense_type or '-')[:15], 1)
            pdf.cell(30, 8, f"{r.amount:,.2f}", 1, 1, 'R')

        output = BytesIO()
        pdf_content = pdf.output(dest='S')
        output.write(pdf_content)
        output.seek(0)
        
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'Farmate_Financials_{timestamp}.pdf'
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@export_routes.route('/api/admin/backup')
def run_backup():
    try:
        # Fetch all records from all tables
        from backend.models.models import Note, Crop, Yield, DiseaseLog, PestLog, Reminder
        
        data = {
            'farm_records': [{
                'date': r.date.isoformat(),
                'activity': r.activity_type,
                'category': r.category,
                'amount': r.amount,
                'type': r.expense_type,
                'desc': r.description
            } for r in FarmRecord.query.all()],
            'notes': [{
                'content': n.content,
                'category': n.category,
                'date': n.created_at.isoformat()
            } for n in Note.query.all()],
            'crops': [{
                'name': c.crop_name,
                'variety': c.variety,
                'sowing_date': c.sowing_date.isoformat() if c.sowing_date else None
            } for c in Crop.query.all()],
            'weather': [{
                'date': w.date.isoformat(),
                'max_temp': w.max_temp,
                'rainfall': w.rainfall,
                'condition': w.description
            } for w in WeatherLog.query.all()]
        }
        
        # Save locally to Desktop
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        backup_dir = os.path.join(desktop, "Farmate_Backups")
        os.makedirs(backup_dir, exist_ok=True)
        
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        file_path = os.path.join(backup_dir, f'farmate_backup_{timestamp}.json')
        
        import json
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=4)
            
        return jsonify({
            "status": "success",
            "message": f"Backup saved to Desktop/Farmate_Backups",
            "file": file_path
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
