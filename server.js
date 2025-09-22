const express = require('express');
const session = require('express-session');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Configuration Discord
const DISCORD_CLIENT_ID = process.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.VITE_DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.VITE_DISCORD_REDIRECT_URI;
const DISCORD_BOT_TOKEN = process.env.VITE_DISCORD_BOT_TOKEN;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 heures
}));

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mapping des rôles Discord
const ROLE_MAPPING = {
  '987654321098765432': 'superadmin',
  '987654321098765433': 'superviseur',
  '987654321098765434': 'dot',
  '987654321098765435': 'patron',
  '987654321098765436': 'co_patron',
  '987654321098765437': 'employee'
};

// Middleware d'authentification
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth');
  }
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).render('error', { 
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires.'
      });
    }
    next();
  };
}

// Routes principales
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth');
});

app.get('/auth', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  
  res.render('auth', { 
    title: 'Connexion',
    discord_url: discordAuthUrl
  });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).render('error', {
      error: 'Erreur d\'authentification',
      message: 'Code d\'autorisation manquant.'
    });
  }

  try {
    // Échange du code contre un token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token } = tokenResponse.data;

    // Récupération des informations utilisateur
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userResponse.data;
    const guilds = guildsResponse.data;

    // Récupération des rôles utilisateur
    let userRole = 'employee';
    const guildIds = guilds.map(g => g.id);

    for (const guildId of guildIds) {
      try {
        const memberResponse = await axios.get(
          `https://discord.com/api/guilds/${guildId}/members/${user.id}`,
          {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
          }
        );

        const roles = memberResponse.data.roles;
        for (const roleId of roles) {
          if (ROLE_MAPPING[roleId]) {
            const mappedRole = ROLE_MAPPING[roleId];
            if (['superadmin', 'superviseur'].includes(mappedRole)) {
              userRole = mappedRole;
              break;
            } else if (['dot', 'patron', 'co_patron'].includes(mappedRole) && userRole === 'employee') {
              userRole = mappedRole;
            }
          }
        }
      } catch (error) {
        console.log(`Erreur lors de la récupération des rôles pour le serveur ${guildId}:`, error.message);
      }
    }

    // Sauvegarde de la session
    req.session.user = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      role: userRole,
      guild_ids: guildIds
    };

    res.redirect('/dashboard');

  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    res.status(500).render('error', {
      error: 'Erreur d\'authentification',
      message: 'Une erreur est survenue lors de la connexion avec Discord.'
    });
  }
});

app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    
    // Récupération des entreprises
    let enterprisesQuery = supabase.from('enterprises').select('*');
    
    if (user.role === 'employee') {
      enterprisesQuery = enterprisesQuery.in('guild_id', user.guild_ids);
    }
    
    const { data: enterprises, error } = await enterprisesQuery;
    
    if (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
    }

    res.render('dashboard', {
      title: 'Tableau de bord',
      user: user,
      enterprises: enterprises || [],
      stats: {
        total_enterprises: enterprises ? enterprises.length : 0,
        total_employees: 0,
        monthly_ca: 0
      }
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).render('error', {
      error: 'Erreur',
      message: 'Une erreur est survenue lors du chargement du tableau de bord.'
    });
  }
});

app.get('/dotations', requireAuth, requireRole(['superadmin', 'superviseur', 'dot', 'patron', 'co_patron']), async (req, res) => {
  try {
    const user = req.session.user;
    
    // Récupération des dotations
    let dotationsQuery = supabase
      .from('dotations')
      .select(`
        *,
        enterprises(name),
        dotation_lines(*)
      `)
      .order('created_at', { ascending: false });
    
    const { data: dotations, error } = await dotationsQuery;
    
    if (error) {
      console.error('Erreur lors de la récupération des dotations:', error);
    }

    res.render('dotations', {
      title: 'Gestion des Dotations',
      user: user,
      dotations: dotations || []
    });
  } catch (error) {
    console.error('Erreur dotations:', error);
    res.status(500).render('error', {
      error: 'Erreur',
      message: 'Une erreur est survenue lors du chargement des dotations.'
    });
  }
});

app.get('/impots', requireAuth, requireRole(['superadmin', 'superviseur', 'dot']), async (req, res) => {
  try {
    const user = req.session.user;
    
    // Récupération des simulations fiscales
    const { data: simulations, error } = await supabase
      .from('tax_simulations')
      .select(`
        *,
        enterprises(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des simulations:', error);
    }

    res.render('impots', {
      title: 'Calculs Fiscaux',
      user: user,
      simulations: simulations || []
    });
  } catch (error) {
    console.error('Erreur impots:', error);
    res.status(500).render('error', {
      error: 'Erreur',
      message: 'Une erreur est survenue lors du chargement des calculs fiscaux.'
    });
  }
});

app.get('/staff', requireAuth, requireRole(['superadmin', 'superviseur']), async (req, res) => {
  try {
    const user = req.session.user;
    
    // Récupération des données staff
    const { data: enterprises, error } = await supabase
      .from('enterprises')
      .select(`
        *,
        employees(*),
        grades(*)
      `);
    
    if (error) {
      console.error('Erreur lors de la récupération des données staff:', error);
    }

    res.render('staff', {
      title: 'Gestion Staff',
      user: user,
      enterprises: enterprises || []
    });
  } catch (error) {
    console.error('Erreur staff:', error);
    res.status(500).render('error', {
      error: 'Erreur',
      message: 'Une erreur est survenue lors du chargement de la gestion staff.'
    });
  }
});

app.get('/superadmin', requireAuth, requireRole(['superadmin']), async (req, res) => {
  try {
    const user = req.session.user;
    
    // Récupération des données système
    const { data: config, error } = await supabase
      .from('system_config')
      .select('*');
    
    if (error) {
      console.error('Erreur lors de la récupération de la config:', error);
    }

    res.render('superadmin', {
      title: 'Administration Système',
      user: user,
      config: config || []
    });
  } catch (error) {
    console.error('Erreur superadmin:', error);
    res.status(500).render('error', {
      error: 'Erreur',
      message: 'Une erreur est survenue lors du chargement de l\'administration.'
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
    res.redirect('/auth');
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('error', {
    error: 'Page non trouvée',
    message: 'La page que vous recherchez n\'existe pas.'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur FlashbackFA Enterprise démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});