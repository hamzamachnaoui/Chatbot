# ChatApp - Application de Messagerie Style WhatsApp 💬

Une application web moderne de messagerie instantanée inspirée de **WhatsApp Web**, avec gestion de salons en temps réel, personnalisation de thèmes par utilisateur, partage de photos et intégration Firebase (Authentication & Cloud Firestore).

---

## ✨ Fonctionnalités

- 🟢 **Design & Ergonomie WhatsApp** :
  - Bulles de messages authentiques avec queues, heure et accusés de réception (**double check** `✓✓`).
  - Arrière-plan avec motif **Doodle WhatsApp** personnalisable.
  - Volet latéral (sidebar) réactif avec recherche de salons et statut en ligne.
- 🎨 **Thèmes personnalisés par utilisateur** :
  - **WhatsApp Classique** (vert émeraude & fond beige doux)
  - **WhatsApp Sombre** (dark mode optimisé)
  - **Bleu Océan**
  - **Lavande & Violet**
  - **Émeraude Menthe**
  - **Rose Pêche**
  - **Minuit Noir OLED**
  - Option pour activer / désactiver le motif Doodle d'arrière-plan.
  - Préférences sauvegardées par profil utilisateur.
- 📸 **Partage de Photos & Images** :
  - Bouton d'ajout de photos avec compression intelligente automatique pour un envoi instantané.
  - Fenêtre d'aperçu avant envoi avec possibilité d'ajouter une légende.
  - Visualiseur plein écran (Lightbox) en cliquant sur les photos dans le chat.
- 😊 **Émojis** : Sélecteur d'émojis complet intégré avec recherche.
- 👥 **Salons de discussion thématiques** :
  - Général, Programmation, IA, Développement Web, Sécurité, Cloud Computing.
  - Indicateur de nouveaux messages et compteurs.
- 🔐 **Authentification sécurisée** :
  - Connexion et inscription avec sélection d'avatars personnalisés.
  - Session synchronisée via Firebase Auth et protection automatique des routes.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, Material-UI (MUI v6), React Router v7, Emoji Picker React.
- **Backend & Base de données** : Firebase (Authentication, Cloud Firestore).
- **Styling** : Material-UI Emotion, CSS personnalisé WhatsApp Web.

---

## 🚀 Démarrage rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- Un compte [Firebase](https://firebase.google.com/)

### 2. Configuration (.env)
Créez un fichier `.env` à la racine du projet (un exemple est fourni dans `.env.example`) :

```env
REACT_APP_FIREBASE_API_KEY=votre_cle_api
REACT_APP_FIREBASE_AUTH_DOMAIN=votre_domaine.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=votre_projet_id
REACT_APP_FIREBASE_STORAGE_BUCKET=votre_bucket.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
REACT_APP_FIREBASE_APP_ID=votre_app_id
```

### 3. Installation et Lancement

```bash
# Installation des dépendances
npm install

# Démarrer le serveur de développement
npm start
```

L'application s'ouvrira automatiquement sur [http://localhost:3000](http://localhost:3000).

---

## 📁 Architecture du Projet

```text
src/
├── config/
│   └── firebase.js            # Initialisation & configuration Firebase
├── contexts/
│   ├── AuthContext.js          # Gestion de la session & authentification
│   └── ChatThemeContext.js     # Thèmes WhatsApp & préférences utilisateurs
├── components/
│   ├── Auth/
│   │   └── AuthCard.js         # Interface de connexion & inscription
│   ├── Chat/
│   │   ├── ChatHeader.js       # En-tête avec raccourci thème & infos
│   │   ├── MessageList.js      # Liste des messages groupés par date
│   │   ├── MessageItem.js      # Bulle style WhatsApp + visionneuse d'image
│   │   ├── MessageInput.js     # Saisie texte, émojis & upload photo
│   │   ├── ImagePreviewModal.js# Aperçu avant envoi & plein écran
│   │   ├── ThemeSelectorModal.js# Dialogue de sélection des thèmes
│   │   └── Sidebar.js          # Volet des salons & recherche
│   └── Common/
│       └── LoadingScreen.js    # Écran de chargement
├── utils/
│   └── formatters.js           # Formatage dates & heures
├── App.js                      # Routing & Providers
└── index.js
```
