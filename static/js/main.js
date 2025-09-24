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
        toast.className = `toast toast-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 slide-in`;
        
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

// Initialisation globale
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les icônes Lucide
    lucide.createIcons();
    
    // Fonctions utilitaires globales
    window.formatCurrency = Utils.formatCurrency;
    window.apiCall = Utils.apiCall;
    window.showToast = ToastManager.show.bind(ToastManager);
});