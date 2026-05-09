from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_required, current_user
from backend.models.models import Product, Order, Visit, FarmRecord, Note
from backend.database import db
import datetime

legacy_routes = Blueprint('legacy_routes', __name__, template_folder='../../templates')

@legacy_routes.route('/shop')
def shop():
    products = Product.query.all()
    return render_template('shop.html', products=products)

@legacy_routes.route('/add_to_cart/<int:product_id>')
def add_to_cart(product_id):
    if 'cart' not in session:
        session['cart'] = {}
    cart = session['cart']
    if str(product_id) in cart:
        cart[str(product_id)] += 1
    else:
        cart[str(product_id)] = 1
    session.modified = True
    flash('Item added to cart!', 'success')
    return redirect(url_for('legacy_routes.shop'))

@legacy_routes.route('/cart')
def cart():
    cart = session.get('cart', {})
    cart_items = []
    total = 0
    for product_id, quantity in cart.items():
        product = Product.query.get(int(product_id))
        if product:
            item_total = product.price * quantity
            total += item_total
            cart_items.append({'product': product, 'quantity': quantity, 'total': item_total})
    return render_template('cart.html', cart_items=cart_items, total=total)

@legacy_routes.route('/checkout')
@login_required
def checkout():
    cart = session.get('cart', {})
    if not cart:
        flash('Your cart is empty', 'warning')
        return redirect(url_for('legacy_routes.shop'))
    
    total = 0
    for p_id, qty in cart.items():
        p = Product.query.get(int(p_id))
        if p: total += p.price * qty
        
    order = Order(user_id=current_user.id, total_amount=total)
    db.session.add(order)
    db.session.commit()
    
    session.pop('cart', None)
    flash('Order placed successfully!', 'success')
    return redirect(url_for('admin_routes.admin_home'))

@legacy_routes.route('/schedule_visit', methods=['POST'])
def schedule_visit():
    name = request.form.get('name')
    email = request.form.get('email')
    date_str = request.form.get('date')
    message = request.form.get('message')
    
    try:
        visit_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        visit = Visit(name=name, email=email, date=visit_date, message=message)
        db.session.add(visit)
        db.session.commit()
        flash('Visit scheduled successfully!', 'success')
    except Exception as e:
        flash('Error scheduling visit.', 'error')
        
    return redirect(url_for('admin_routes.admin_home'))

@legacy_routes.route('/api/run_backup', methods=['POST'])
@login_required
def run_backup():
    # Placeholder for backup logic
    return {"status": "success", "log": "Manual backup triggered."}

@legacy_routes.route('/api/backup_status')
@login_required
def backup_status():
    return {"last_backup": datetime.datetime.now().isoformat()}

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
