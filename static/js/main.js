// Fonctions JavaScript principales pour FlashbackFA Enterprise

// Configuration globale
const CONFIG = {
    API_BASE: '/api',
    TOAST_DURATION: 5000,
    DEBOUNCE_DELAY: 300
};

// Utilitaires
class Utils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
    
    static formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static async apiCall(url, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Gestionnaire de notifications
class ToastManager {
    static show(type, message, duration = CONFIG.TOAST_DURATION) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 fade-in`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'alert-triangle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        const colorMap = {
            success: 'bg-green-100 text-green-800 border border-green-200',
            error: 'bg-red-100 text-red-800 border border-red-200',
            warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            info: 'bg-blue-100 text-blue-800 border border-blue-200'
        };
        
        toast.className += ` ${colorMap[type]}`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i data-lucide="${iconMap[type]}" class="h-4 w-4"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-current opacity-70 hover:opacity-100">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        lucide.createIcons();
        
        // Auto-remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
        
        return toast;
    }
    
    static success(message) {
        return this.show('success', message);
    }
    
    static error(message) {
        return this.show('error', message);
    }
    
    static warning(message) {
        return this.show('warning', message);
    }
    
    static info(message) {
        return this.show('info', message);
    }
}

// Gestionnaire de modales
class ModalManager {
    static show(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">${options.title || 'Modal'}</h3>
                        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-400 hover:text-gray-600">
                            <i data-lucide="x" class="h-5 w-5"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
        
        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
    
    static confirm(message, onConfirm, options = {}) {
        const content = `
            <div class="space-y-4">
                <p class="text-gray-700">${message}</p>
                <div class="flex space-x-2 justify-end">
                    <button onclick="this.closest('.modal-overlay').remove()" 
                            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Annuler
                    </button>
                    <button onclick="confirmAction()" 
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Confirmer
                    </button>
                </div>
            </div>
        `;
        
        const modal = this.show(content, { title: options.title || 'Confirmation' });
        
        // Ajouter la fonction de confirmation
        window.confirmAction = () => {
            modal.remove();
            if (onConfirm) onConfirm();
        };
        
        return modal;
    }
}

// Gestionnaire de formulaires
class FormManager {
    static serialize(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
    
    static validate(form, rules = {}) {
        const errors = {};
        const data = this.serialize(form);
        
        for (let [field, rule] of Object.entries(rules)) {
            const value = data[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = 'Ce champ est requis';
                continue;
            }
            
            if (rule.type === 'email' && value && !this.isValidEmail(value)) {
                errors[field] = 'Email invalide';
            }
            
            if (rule.type === 'number' && value && isNaN(parseFloat(value))) {
                errors[field] = 'Doit être un nombre';
            }
            
            if (rule.min && value && parseFloat(value) < rule.min) {
                errors[field] = `Doit être supérieur à ${rule.min}`;
            }
            
            if (rule.max && value && parseFloat(value) > rule.max) {
                errors[field] = `Doit être inférieur à ${rule.max}`;
            }
        }
        
        return { isValid: Object.keys(errors).length === 0, errors, data };
    }
    
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static showErrors(form, errors) {
        // Effacer les erreurs précédentes
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Afficher les nouvelles erreurs
        for (let [field, message] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message text-sm text-red-600 mt-1';
                errorEl.textContent = message;
                
                input.parentElement.appendChild(errorEl);
            }
        }
    }
}

// Gestionnaire de données
class DataManager {
    static cache = new Map();
    
    static async get(key, fetcher, ttl = 300000) { // 5 minutes par défaut
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        
        try {
            const data = await fetcher();
            this.cache.set(key, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            throw error;
        }
    }
    
    static invalidate(key) {
        this.cache.delete(key);
    }
    
    static clear() {
        this.cache.clear();
    }
}

// Gestionnaire d'export
class ExportManager {
    static toCSV(data, filename) {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(';'),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    if (typeof value === 'string' && value.includes(';')) {
                        return `"${value}"`;
                    }
                    return value;
                }).join(';')
            )
        ].join('\n');
        
        this.download(csvContent, filename, 'text/csv;charset=utf-8;');
    }
    
    static toJSON(data, filename) {
        const jsonContent = JSON.stringify(data, null, 2);
        this.download(jsonContent, filename, 'application/json;charset=utf-8;');
    }
    
    static download(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les icônes Lucide
    lucide.createIcons();
    
    // Ajouter les gestionnaires d'événements globaux
    document.addEventListener('click', function(e) {
        // Fermer les dropdowns en cliquant à l'extérieur
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });
    
    // Gestion des formulaires AJAX
    document.querySelectorAll('form[data-ajax]').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const url = form.action || window.location.pathname;
            const method = form.method || 'POST';
            const data = FormManager.serialize(form);
            
            try {
                const result = await Utils.apiCall(url, method, data);
                
                if (result.success) {
                    ToastManager.success(result.message || 'Opération réussie');
                    
                    // Recharger la page si spécifié
                    if (form.dataset.reload === 'true') {
                        setTimeout(() => location.reload(), 1000);
                    }
                } else {
                    ToastManager.error(result.error || 'Erreur lors de l\'opération');
                }
            } catch (error) {
                ToastManager.error('Erreur de communication avec le serveur');
            }
        });
    });
    
    // Auto-save pour les formulaires marqués
    document.querySelectorAll('form[data-autosave]').forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        const debouncedSave = Utils.debounce(() => {
            // Logique d'auto-save
            console.log('Auto-saving form data...');
        }, 2000);
        
        inputs.forEach(input => {
            input.addEventListener('input', debouncedSave);
        });
    });
    
    // Gestion des tooltips
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg';
            tooltip.textContent = this.dataset.tooltip;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });
});

// Fonctions globales pour la compatibilité
window.Utils = Utils;
window.ToastManager = ToastManager;
window.ModalManager = ModalManager;
window.FormManager = FormManager;
window.DataManager = DataManager;
window.ExportManager = ExportManager;

// Alias pour la compatibilité
window.showToast = ToastManager.show.bind(ToastManager);
window.formatCurrency = Utils.formatCurrency;
window.apiCall = Utils.apiCall;