#!/usr/bin/env python3
"""
Script de lancement pour FlashbackFA Enterprise
"""

import os
import sys
from app import app

if __name__ == '__main__':
    # Configuration pour le développement
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    print(f"🚀 Démarrage de FlashbackFA Enterprise")
    print(f"📍 URL: http://{host}:{port}")
    print(f"🔧 Mode debug: {'Activé' if debug_mode else 'Désactivé'}")
    
    app.run(
        debug=debug_mode,
        host=host,
        port=port,
        threaded=True
    )