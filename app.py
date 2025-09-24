import os
import json
import requests
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Configuration
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')

# Configuration Supabase
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Variables d'environnement Supabase manquantes")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuration Discord
DISCORD_CLIENT_ID = os.getenv('VITE_DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = os.getenv('VITE_DISCORD_CLIENT_SECRET')
DISCORD_BOT_TOKEN = os.getenv('VITE_DISCORD_BOT_TOKEN')
DISCORD_REDIRECT_URI = os.getenv('VITE_DISCORD_REDIRECT_URI', 'https://flashbackfa-entreprise.fr/auth/callback')
MAIN_GUILD_ID = os.getenv('VITE_MAIN_GUILD_ID')
DOT_GUILD_ID = os.getenv('VITE_DOT_GUILD_ID')

# IDs des rôles
ROLE_IDS = {
    'STAFF': os.getenv('VITE_MAIN_GUILD_STAFF_ROLE_ID'),
    'PATRON': os.getenv('VITE_MAIN_GUILD_PATRON_ROLE_ID'),
    'CO_PATRON': os.getenv('VITE_MAIN_GUILD_COPATRON_ROLE_ID'),
    'DOT': os.getenv('VITE_DOT_GUILD_DOT_ROLE_ID'),
    'DOT_STAFF': os.getenv('VITE_DOT_GUILD_STAFF_ROLE_ID'),
    'SUPERADMIN': os.getenv('VITE_SUPERADMIN_ROLE_ID')
}

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DiscordAuth:
    @staticmethod
    def get_auth_url():
        params = {
            'client_id': DISCORD_CLIENT_ID,
            'redirect_uri': DISCORD_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'identify email guilds',
            'prompt': 'consent'
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"https://discord.com/oauth2/authorize?{query_string}"

    @staticmethod
    def exchange_code_for_token(code):
        data = {
            'client_id': DISCORD_CLIENT_ID,
            'client_secret': DISCORD_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': DISCORD_REDIRECT_URI,
        }
        
        response = requests.post('https://discord.com/api/v10/oauth2/token', data=data)
        
        if not response.ok:
            logger.error(f"Token exchange error: {response.text}")
            raise Exception(f"Failed to exchange code for token: {response.status_code}")
        
        token_data = response.json()
        return token_data.get('access_token')

    @staticmethod
    def get_user(token):
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get('https://discord.com/api/v10/users/@me', headers=headers)
        
        if not response.ok:
            raise Exception('Failed to fetch user')
        
        return response.json()

    @staticmethod
    def get_user_guilds(token):
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get('https://discord.com/api/v10/users/@me/guilds', headers=headers)
        
        if not response.ok:
            raise Exception('Failed to fetch guilds')
        
        return response.json()

    @staticmethod
    def get_user_roles_in_guild(user_id, guild_id):
        if not DISCORD_BOT_TOKEN:
            return {'roles': [], 'member': None}
        
        headers = {'Authorization': f'Bot {DISCORD_BOT_TOKEN}'}
        response = requests.get(f'https://discord.com/api/v10/guilds/{guild_id}/members/{user_id}', headers=headers)
        
        if not response.ok:
            if response.status_code == 404:
                logger.warning(f"User {user_id} not found in guild {guild_id}")
            return {'roles': [], 'member': None}
        
        member = response.json()
        return {'roles': member.get('roles', []), 'member': member}

def determine_user_role(user_id, user_roles, is_owner, guild_id):
    """Détermine le rôle d'un utilisateur basé sur ses rôles Discord"""
    
    # Vérifier les rôles par priorité (du plus élevé au plus bas)
    if ROLE_IDS['SUPERADMIN'] and ROLE_IDS['SUPERADMIN'] in user_roles:
        return {'role': 'superadmin', 'role_level': 7, 'role_name': 'Fondateur'}
    
    if ROLE_IDS['STAFF'] and ROLE_IDS['STAFF'] in user_roles:
        return {'role': 'staff', 'role_level': 3, 'role_name': 'Staff'}
    
    if ROLE_IDS['PATRON'] and ROLE_IDS['PATRON'] in user_roles:
        return {'role': 'patron', 'role_level': 2, 'role_name': 'Patron'}
    
    if ROLE_IDS['CO_PATRON'] and ROLE_IDS['CO_PATRON'] in user_roles:
        return {'role': 'co_patron', 'role_level': 1, 'role_name': 'Co-Patron'}
    
    # Propriétaire de guilde (priorité plus basse que les rôles spécifiques)
    if is_owner:
        return {'role': 'patron', 'role_level': 2, 'role_name': 'Patron Propriétaire'}
    

def get_user_enterprises(user_id):
    """Récupère les entreprises de l'utilisateur"""
    try:
        response = supabase.table('enterprises').select('*').or_(
            f'owner_discord_id.eq.{user_id}'
        ).execute()
        
        return response.data if response.data else []
    except Exception as e:
        logger.error(f"Error fetching enterprises: {e}")
        return []

def require_auth(f):
    """Décorateur pour vérifier l'authentification"""
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('auth_page'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def require_permission(permission):
    """Décorateur pour vérifier les permissions"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            if 'user' not in session:
                return redirect(url_for('auth_page'))
            
            user = session['user']
            
            # Vérifier les permissions du rôle principal
            has_role_permission = has_permission(user.get('role'), permission)
            
            # Vérifier si c'est une permission superadmin
            is_superadmin_permission = permission == 'superadmin'
            has_superadmin_access = user.get('is_superadmin', False) and is_superadmin_permission
            
            if not has_role_permission and not has_superadmin_access:
                flash('Vous n\'avez pas les permissions nécessaires.', 'error')
                return redirect(url_for('dashboard'))
            
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

def has_permission(user_role, permission):
    """Vérifie si un rôle a une permission donnée"""
    permissions_matrix = {
        'employee': ['dashboard'],
        'co_patron': ['dashboard', 'dotations', 'impots', 'blanchiment', 'archives', 'documents', 'comptabilite', 'salaires', 'qualifications'],
        'patron': ['dashboard', 'dotations', 'impots', 'blanchiment', 'archives', 'documents', 'comptabilite', 'salaires', 'qualifications', 'company_config'],
        'staff': ['dashboard', 'dotations', 'impots', 'blanchiment', 'archives', 'documents', 'comptabilite', 'salaires', 'qualifications', 'config_staff', 'company_config']
    }
    
    return permission in permissions_matrix.get(user_role, [])

# Routes principales
@app.route('/')
@require_auth
def dashboard():
    user = session['user']
    enterprises = get_user_enterprises(user['id'])
    
    # Calculer les statistiques
    stats = {
        'total_enterprises': len(enterprises),
        'total_employees': 0,
        'total_ca': 0,
        'total_documents': 0
    }
    
    for enterprise in enterprises:
        try:
            # Récupérer les employés
            employees_response = supabase.table('employees').select('*').eq('enterprise_id', enterprise['id']).execute()
            stats['total_employees'] += len(employees_response.data) if employees_response.data else 0
            
            # Récupérer les dotations
            dotations_response = supabase.table('dotations').select('*').eq('enterprise_id', enterprise['id']).limit(1).execute()
            if dotations_response.data:
                stats['total_ca'] += dotations_response.data[0].get('total_ca', 0)
            
            # Récupérer les documents
            documents_response = supabase.table('documents').select('*').eq('enterprise_id', enterprise['id']).execute()
            stats['total_documents'] += len(documents_response.data) if documents_response.data else 0
            
        except Exception as e:
            logger.error(f"Error calculating stats for enterprise {enterprise['id']}: {e}")
    
    return render_template('dashboard.html', user=user, enterprises=enterprises, stats=stats)

@app.route('/auth')
def auth_page():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    
    auth_url = DiscordAuth.get_auth_url()
    return render_template('auth.html', auth_url=auth_url)

@app.route('/auth/callback')
def auth_callback():
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        flash(f'Erreur d\'authentification: {error}', 'error')
        return redirect(url_for('auth_page'))
    
    if not code:
        flash('Code d\'autorisation manquant', 'error')
        return redirect(url_for('auth_page'))
    
    try:
        # Échanger le code contre un token
        token = DiscordAuth.exchange_code_for_token(code)
        
        # Récupérer les informations utilisateur
        discord_user = DiscordAuth.get_user(token)
        guilds = DiscordAuth.get_user_guilds(token)
        
        # Filtrer les guildes configurées
        configured_guilds = [g for g in guilds if g['id'] in [MAIN_GUILD_ID, DOT_GUILD_ID]]
        
        if not configured_guilds:
            flash('Vous n\'êtes membre d\'aucune guilde autorisée.', 'error')
            return redirect(url_for('auth_page'))
        
        # Déterminer le rôle le plus élevé
        highest_role = {'role': 'employee', 'role_level': 0, 'role_name': 'Employé'}
        
        # Collecter tous les rôles de l'utilisateur dans toutes les guildes
        all_user_roles = []
        is_superadmin = False
        
        for guild in configured_guilds:
            roles_data = DiscordAuth.get_user_roles_in_guild(discord_user['id'], guild['id'])
            all_user_roles.extend(roles_data['roles'])
            
            # Vérifier si l'utilisateur a le rôle SuperAdmin
            if ROLE_IDS['SUPERADMIN'] and ROLE_IDS['SUPERADMIN'] in roles_data['roles']:
                is_superadmin = True
            
            # Déterminer le rôle pour cette guilde
            role_info = determine_user_role(discord_user['id'], roles_data['roles'], guild['owner'], guild['id'])
            
            if role_info['role_level'] > highest_role['role_level']:
                highest_role = role_info
        
        # Vérifier SuperAdmin dans tous les rôles combinés
        if ROLE_IDS['SUPERADMIN'] and ROLE_IDS['SUPERADMIN'] in all_user_roles:
            is_superadmin = True
        
        # Créer l'objet utilisateur
        user_data = {
            'id': discord_user['id'],
            'username': discord_user['username'],
            'discriminator': discord_user['discriminator'],
            'avatar': discord_user.get('avatar'),
            'role': highest_role['role'],
            'role_level': highest_role['role_level'],
            'role_name': highest_role['role_name'],
            'is_superadmin': is_superadmin,
            'guilds': configured_guilds
        }
        
        # Sauvegarder en session
        session['user'] = user_data
        session['discord_token'] = token
        
        flash(f'Connexion réussie ! Bienvenue {user_data["username"]}', 'success')
        return redirect(url_for('dashboard'))
        
    except Exception as e:
        logger.error(f"Auth callback error: {e}")
        flash('Erreur lors de l\'authentification Discord', 'error')
        return redirect(url_for('auth_page'))

@app.route('/logout')
def logout():
    session.clear()
    flash('Vous avez été déconnecté', 'info')
    return redirect(url_for('auth_page'))

@app.route('/dotations')
@require_auth
@require_permission('dotations')
def dotations():
    user = session['user']
    enterprises = get_user_enterprises(user['id'])
    
    # Récupérer les dotations
    dotations_data = []
    if enterprises:
        enterprise_id = enterprises[0]['id']
        response = supabase.table('dotations').select('*, dotation_lines(*), expenses(*), withdrawals(*)').eq('enterprise_id', enterprise_id).order('created_at', desc=True).execute()
        dotations_data = response.data if response.data else []
    
    return render_template('dotations.html', user=user, enterprises=enterprises, dotations=dotations_data)

@app.route('/dotations/create', methods=['POST'])
@require_auth
@require_permission('dotations')
def create_dotation():
    user = session['user']
    enterprises = get_user_enterprises(user['id'])
    
    if not enterprises:
        flash('Aucune entreprise trouvée', 'error')
        return redirect(url_for('dotations'))
    
    try:
        enterprise_id = enterprises[0]['id']
        period = f"{datetime.now().year}-{datetime.now().month:02d}"
        
        response = supabase.table('dotations').insert({
            'enterprise_id': enterprise_id,
            'period': period,
            'created_by': user['username']
        }).execute()
        
        flash('Nouvelle dotation créée avec succès', 'success')
    except Exception as e:
        logger.error(f"Error creating dotation: {e}")
        flash('Erreur lors de la création de la dotation', 'error')
    
    return redirect(url_for('dotations'))

@app.route('/dotations/<dotation_id>/save', methods=['POST'])
@require_auth
@require_permission('dotations')
def save_dotation(dotation_id):
    try:
        # Récupérer les données du formulaire
        employees_data = request.form.getlist('employees')
        expenses_data = request.form.getlist('expenses')
        withdrawals_data = request.form.getlist('withdrawals')
        
        # Traiter et sauvegarder les données
        # (Logique de sauvegarde ici)
        
        flash('Dotation sauvegardée avec succès', 'success')
    except Exception as e:
        logger.error(f"Error saving dotation: {e}")
        flash('Erreur lors de la sauvegarde', 'error')
    
    return redirect(url_for('dotations'))

@app.route('/impots')
@require_auth
@require_permission('impots')
def impots():
    user = session['user']
    enterprises = get_user_enterprises(user['id'])
    
    # Récupérer les tranches fiscales
    tax_brackets_response = supabase.table('tax_brackets').select('*').eq('type', 'IS').order('min_amount').execute()
    wealth_brackets_response = supabase.table('tax_brackets').select('*').eq('type', 'richesse').order('min_amount').execute()
    
    tax_brackets = tax_brackets_response.data if tax_brackets_response.data else []
    wealth_brackets = wealth_brackets_response.data if wealth_brackets_response.data else []
    
    # Calculer les données fiscales réelles
    real_tax_data = None
    if enterprises:
        enterprise_id = enterprises[0]['id']
        dotations_response = supabase.table('dotations').select('*').eq('enterprise_id', enterprise_id).order('created_at', desc=True).limit(1).execute()
        
        if dotations_response.data:
            dotation = dotations_response.data[0]
            total_ca = dotation.get('total_ca', 0)
            total_salaries = dotation.get('total_salaries', 0)
            total_bonuses = dotation.get('total_bonuses', 0)
            
            # Récupérer les dépenses
            expenses_response = supabase.table('expenses').select('*').eq('dotation_id', dotation['id']).execute()
            total_expenses = sum(exp['amount'] for exp in expenses_response.data) if expenses_response.data else 0
            
            net_profit = total_ca - total_salaries - total_bonuses - total_expenses
            
            # Calculer l'impôt IS
            is_tax = calculate_tax(net_profit, tax_brackets)
            
            # Calculer l'impôt richesse
            profit_after_is = net_profit - is_tax['tax_owed']
            wealth_tax = calculate_tax(profit_after_is, wealth_brackets)
            
            real_tax_data = {
                'period': dotation['period'],
                'total_ca': total_ca,
                'total_expenses': total_salaries + total_bonuses + total_expenses,
                'net_profit': net_profit,
                'calculated_tax': is_tax['tax_owed'],
                'effective_rate': is_tax['effective_rate'],
                'wealth_tax': wealth_tax['tax_owed'],
                'final_amount': profit_after_is - wealth_tax['tax_owed']
            }
    
    return render_template('impots.html', 
                         user=user, 
                         enterprises=enterprises, 
                         tax_brackets=tax_brackets,
                         wealth_brackets=wealth_brackets,
                         real_tax_data=real_tax_data)

def calculate_tax(income, brackets):
    """Calcule l'impôt basé sur les tranches"""
    total_tax = 0
    
    for bracket in brackets:
        if income > bracket['min_amount']:
            taxable_in_bracket = min(income, bracket['max_amount'] or float('inf')) - bracket['min_amount']
            tax_on_bracket = (taxable_in_bracket * bracket['rate']) / 100
            total_tax += tax_on_bracket
    
    return {
        'income': income,
        'tax_owed': total_tax,
        'effective_rate': (total_tax / income) * 100 if income > 0 else 0
    }

@app.route('/documents')
@require_auth
@require_permission('documents')
def documents():
    user = session['user']
    enterprises = get_user_enterprises(user['id'])
    
    documents_data = []
    if enterprises:
        enterprise_id = enterprises[0]['id']
        response = supabase.table('documents').select('*').eq('enterprise_id', enterprise_id).order('created_at', desc=True).execute()
        documents_data = response.data if response.data else []
    
    return render_template('documents.html', user=user, enterprises=enterprises, documents=documents_data)

@app.route('/blanchiment')
@require_auth
@require_permission('blanchiment')
def blanchiment():
    user = session['user']
    enterprises = get_user_enterprises(user['id'])
    
    operations_data = []
    if enterprises:
        enterprise_id = enterprises[0]['id']
        response = supabase.table('blanchiment_operations').select('*').eq('enterprise_id', enterprise_id).order('created_at', desc=True).execute()
        operations_data = response.data if response.data else []
    
    return render_template('blanchiment.html', user=user, enterprises=enterprises, operations=operations_data)

@app.route('/archives')
@require_auth
@require_permission('archives')
def archives():
    user = session['user']
    enterprises = get_user_enterprises(user['id'])
    
    archives_data = []
    if enterprises:
        enterprise_id = enterprises[0]['id']
        response = supabase.table('archives').select('*').eq('enterprise_id', enterprise_id).order('created_at', desc=True).execute()
        archives_data = response.data if response.data else []
    
    return render_template('archives.html', user=user, enterprises=enterprises, archives=archives_data)

@app.route('/staff')
@require_auth
@require_permission('staff')
def staff():
    user = session['user']
    
    # Récupérer toutes les entreprises pour les staff/superadmin
    response = supabase.table('enterprises').select('*').order('created_at', desc=True).execute()
    all_enterprises = response.data if response.data else []
    
    return render_template('staff.html', user=user, enterprises=all_enterprises)

@app.route('/superadmin')
@require_auth
@require_permission('superadmin')
def superadmin():
    user = session['user']
    
    # Vérifier explicitement le rôle superadmin
    if not user.get('is_superadmin', False):
        flash('Accès SuperAdmin requis.', 'error')
        return redirect(url_for('dashboard'))
    
    # Récupérer toutes les données pour l'administration
    enterprises_response = supabase.table('enterprises').select('*').order('created_at', desc=True).execute()
    tax_brackets_response = supabase.table('tax_brackets').select('*').eq('type', 'IS').order('min_amount').execute()
    wealth_brackets_response = supabase.table('tax_brackets').select('*').eq('type', 'richesse').order('min_amount').execute()
    
    enterprises = enterprises_response.data if enterprises_response.data else []
    tax_brackets = tax_brackets_response.data if tax_brackets_response.data else []
    wealth_brackets = wealth_brackets_response.data if wealth_brackets_response.data else []
    
    return render_template('superadmin.html', 
                         user=user, 
                         enterprises=enterprises,
                         tax_brackets=tax_brackets,
                         wealth_brackets=wealth_brackets)

# API endpoints pour les actions AJAX
@app.route('/api/enterprises', methods=['POST'])
@require_auth
@require_permission('superadmin')
def create_enterprise():
    try:
        data = request.get_json()
        
        response = supabase.table('enterprises').insert({
            'name': data['name'],
            'guild_id': data['guild_id'],
            'type': data.get('type', 'SARL'),
            'description': data.get('description'),
            'owner_discord_id': data['owner_discord_id'],
            'settings': data.get('settings', {})
        }).execute()
        
        return jsonify({'success': True, 'data': response.data[0]})
    except Exception as e:
        logger.error(f"Error creating enterprise: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/enterprises/<enterprise_id>/blanchiment', methods=['PUT'])
@require_auth
@require_permission('config_staff')
def toggle_blanchiment(enterprise_id):
    try:
        data = request.get_json()
        enabled = data.get('enabled', False)
        
        response = supabase.table('enterprises').update({
            'settings': {'blanchiment_enabled': enabled},
            'updated_at': datetime.now().isoformat()
        }).eq('id', enterprise_id).execute()
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error toggling blanchiment: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Filtres Jinja2 personnalisés
@app.template_filter('currency')
def currency_filter(amount):
    """Formate un montant en euros"""
    return f"{amount:,.2f} €".replace(',', ' ')

@app.template_filter('date_fr')
def date_fr_filter(date_str):
    """Formate une date en français"""
    if isinstance(date_str, str):
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    else:
        date_obj = date_str
    return date_obj.strftime('%d/%m/%Y')

@app.template_filter('datetime_fr')
def datetime_fr_filter(date_str):
    """Formate une date et heure en français"""
    if isinstance(date_str, str):
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    else:
        date_obj = date_str
    return date_obj.strftime('%d/%m/%Y à %H:%M')

# Gestion des erreurs
@app.errorhandler(404)
def not_found(error):
    return render_template('error.html', error_code=404, error_message="Page non trouvée"), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('error.html', error_code=500, error_message="Erreur interne du serveur"), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)