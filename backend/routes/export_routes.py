import os
import datetime
import json
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

class ProfessionalPDF(FPDF):
    def header(self):
        # Header background
        self.set_fill_color(30, 41, 59)  # Slate-900
        self.rect(0, 0, 210, 40, 'F')
        
        self.set_font("Helvetica", 'B', 24)
        self.set_text_color(255, 255, 255)
        self.set_y(10)
        self.cell(0, 15, "FARMATE", ln=True, align='C')
        
        self.set_font("Helvetica", '', 10)
        self.set_text_color(200, 200, 200)
        self.cell(0, 5, "Professional Farm Management & Financial Ledger", ln=True, align='C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()} | Confidential Farm Records", align='C')

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
            'Sub-Categories': r.expense_type or '-',
            'Amount (INR)': r.amount,
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
                'Metric': ['Report Title', 'Generated On', 'Total Income', 'Total Expenses', 'Net Profit'],
                'Value': ['Farmate Production Report', datetime.datetime.now().strftime('%Y-%m-%d %H:%M'), f"INR {total_income:,.2f}", f"INR {total_expense:,.2f}", f"INR {net_profit:,.2f}"]
            })
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Category Breakdown
            cat_df = pd.DataFrame([{'Expense Category': item[0], 'Total Amount (INR)': item[1]} for item in expense_breakdown])
            cat_df.to_excel(writer, sheet_name='Expense Analysis', index=False)
            
            # Full Records
            pd.DataFrame(all_records).to_excel(writer, sheet_name='All Transactions', index=False)
            
            # Weather
            pd.DataFrame(weather_records).to_excel(writer, sheet_name='Weather History', index=False)

        output.seek(0)
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'Farmate_Professional_Report_{timestamp}.xlsx'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@export_routes.route('/api/export/pdf')
def export_pdf():
    try:
        total_income = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Income').scalar() or 0
        total_expense = db.session.query(func.sum(FarmRecord.amount)).filter(FarmRecord.category == 'Expense').scalar() or 0
        net_profit = total_income - total_expense
        
        all_q = FarmRecord.query.order_by(FarmRecord.date.desc()).all()

        pdf = ProfessionalPDF()
        pdf.add_page()
        
        # --- Financial Summary Box ---
        pdf.set_fill_color(248, 250, 252)
        pdf.rect(10, 45, 190, 40, 'F')
        
        pdf.set_font("Helvetica", 'B', 14)
        pdf.set_text_color(30, 41, 59)
        pdf.set_y(50)
        pdf.cell(190, 10, "Financial Executive Summary", ln=True, align='C')
        
        pdf.set_font("Helvetica", '', 11)
        pdf.set_x(20)
        pdf.cell(85, 10, f"Total Revenue: INR {total_income:,.2f}")
        pdf.set_text_color(225, 29, 72) # Rose-600
        pdf.cell(85, 10, f"Total Expenditure: INR {total_expense:,.2f}", ln=True, align='R')
        
        pdf.set_font("Helvetica", 'B', 12)
        pdf.set_text_color(79, 70, 229) # Indigo-600
        pdf.cell(190, 10, f"Net Operating Balance: INR {net_profit:,.2f}", ln=True, align='C')
        pdf.ln(10)
        
        # --- Transaction Table ---
        pdf.set_font("Helvetica", 'B', 12)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(190, 10, "Detailed Transaction Ledger", ln=True)
        
        # Table Header
        pdf.set_font("Helvetica", 'B', 9)
        pdf.set_fill_color(79, 70, 229) # Indigo-600
        pdf.set_text_color(255, 255, 255)
        
        pdf.cell(25, 10, "Date", 1, 0, 'C', True)
        pdf.cell(75, 10, "Activity / Description", 1, 0, 'C', True)
        pdf.cell(25, 10, "Category", 1, 0, 'C', True)
        pdf.cell(35, 10, "Sub-Type", 1, 0, 'C', True)
        pdf.cell(30, 10, "Amount (INR)", 1, 1, 'C', True)
        
        # Table Body
        pdf.set_font("Helvetica", '', 8)
        pdf.set_text_color(51, 65, 85)
        
        fill = False
        for r in all_q:
            # Alternating row colors
            if fill:
                pdf.set_fill_color(249, 250, 251)
            else:
                pdf.set_fill_color(255, 255, 255)
                
            pdf.cell(25, 8, r.date.strftime('%Y-%m-%d') if r.date else '', 1, 0, 'C', True)
            
            # Handle long activity text
            activity = r.activity_type
            if len(activity) > 45: activity = activity[:42] + "..."
            pdf.cell(75, 8, activity, 1, 0, 'L', True)
            
            pdf.cell(25, 8, r.category, 1, 0, 'C', True)
            
            sub_type = r.expense_type or '-'
            if len(sub_type) > 20: sub_type = sub_type[:17] + "..."
            pdf.cell(35, 8, sub_type, 1, 0, 'C', True)
            
            # Color amount based on category
            if r.category == 'Income':
                pdf.set_text_color(5, 150, 105) # Emerald-600
                prefix = "+"
            else:
                pdf.set_text_color(220, 38, 38) # Red-600
                prefix = "-"
                
            pdf.cell(30, 8, f"{prefix}{r.amount:,.2f}", 1, 1, 'R', True)
            pdf.set_text_color(51, 65, 85) # Reset color
            fill = not fill

        output = BytesIO()
        pdf_content = pdf.output()
        output.write(pdf_content)
        output.seek(0)
        
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'Farmate_Financial_Statement_{timestamp}.pdf'
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@export_routes.route('/api/admin/backup')
def run_backup():
    try:
        from backend.models.models import Note, Crop, Yield, DiseaseLog, PestLog, Reminder
        
        data = {
            'metadata': {
                'generated_at': datetime.datetime.now().isoformat(),
                'version': '2.0.0',
                'source': 'Farmate Production Console'
            },
            'farm_records': [{
                'date': r.date.isoformat() if r.date else None,
                'activity': r.activity_type,
                'category': r.category,
                'amount': r.amount,
                'type': r.expense_type,
                'description': r.description
            } for r in FarmRecord.query.all()],
            'notes': [{
                'content': n.content,
                'category': n.category,
                'created_at': n.created_at.isoformat() if n.created_at else None
            } for n in Note.query.all()],
            'crops': [{
                'name': c.crop_name,
                'variety': c.variety,
                'season': c.season,
                'sowing_date': c.sowing_date.isoformat() if c.sowing_date else None,
                'status': c.status
            } for c in Crop.query.all()],
            'weather': [{
                'date': w.date.isoformat() if w.date else None,
                'max_temp': w.max_temp,
                'rainfall': w.rainfall,
                'condition': w.description
            } for w in WeatherLog.query.all()],
            'reminders': [{
                'date': rem.date.isoformat() if rem.date else None,
                'title': rem.title,
                'priority': rem.priority,
                'completed': rem.completed
            } for rem in Reminder.query.all()]
        }
        
        output = BytesIO()
        output.write(json.dumps(data, indent=4).encode('utf-8'))
        output.seek(0)
        
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        return send_file(
            output,
            mimetype='application/json',
            as_attachment=True,
            download_name=f'farmate_vault_backup_{timestamp}.json'
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
