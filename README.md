# ChatApp - Application de Messagerie Style WhatsApp 💬

Une application web moderne de messagerie instantanée inspirée de **WhatsApp Web**, avec gestion de salons publics et de **discussions privées 1-à-1** en temps réel, notes vocales, partage de photos, personnalisation de thèmes par utilisateur et intégration Firebase (Authentication & Cloud Firestore).

---

## ✨ Fonctionnalités

- 🟢 **Design & Ergonomie WhatsApp** :
  - Bulles de messages authentiques avec heure, accusés de réception (`✓✓`) et séparateurs par date.
  - Arrière-plan avec motif **Doodle WhatsApp** personnalisable.
  - Volet latéral (sidebar) réactif avec onglets **Salons** / **Privés**, recherche et indicateurs de nouveaux messages.
- 🔒 **Discussions privées 1-à-1 (entre deux logins)** :
  - Onglet **Privés** dédié dans le volet latéral avec sélection d'utilisateurs inscrits ou invités (`/dm/:chatId`).
  - Aperçu du dernier message, badge non lu et notification sonore.
  - Accès strictement limité aux deux participants via les règles Firestore (`firestore.rules`).
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
- 📸 **Partage de Photos & Notes Vocales** :
  - Envoi de photos avec compression intelligente automatique, aperçu avec légende et visionneuse plein écran (Lightbox) + téléchargement.
  - Enregistrement et lecture de notes vocales avec vitesse de lecture ajustable (`1x`, `1.5x`, `2x`).
- 💬 **Interactions & Recherche** :
  - Sélecteur d'émojis complet intégré, réactions rapides sur les messages et suppression par l'auteur.
  - Recherche en direct dans les messages du salon ou de la discussion privée active.
- 👥 **Salons de discussion thématiques** :
  - Général, Programmation, IA, Développement Web, Sécurité, Cloud Computing.
  - Création de salons personnalisés et compteurs de messages.
- 🔐 **Authentification sécurisée** :
  - Connexion, inscription, mode **Invité** (authentification anonyme) et modification du profil/avatar.
  - Session synchronisée via Firebase Auth, annuaire `/users` et protection automatique des routes.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, Material-UI (MUI v6), React Router v7, Emoji Picker React.
- **Backend & Base de données** : Firebase (Authentication, Cloud Firestore).
- **Déploiement & Sécurité** : Règles Firestore (`firestore.rules`), configuration SPA Vercel (`vercel.json`).

---

## 🚀 Démarrage rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- Un compte [Firebase](https://firebase.google.com/) (Authentication Email/Mot de passe + Anonyme, et Cloud Firestore activés)

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

### 3. Règles de sécurité Firestore
Déployez le fichier `firestore.rules` sur votre projet Firebase afin d'autoriser les salons, l'annuaire `/users` et les discussions privées `/privateChats` :

```bash
firebase deploy --only firestore:rules
```

*(Ou copiez le contenu de `firestore.rules` dans **Firebase Console > Firestore Database > Règles**.)*

### 4. Installation, Tests et Lancement

```bash
# Installation des dépendances
npm install

# Démarrer le serveur de développement
npm start

# Lancer les tests unitaires
npm test

# Générer le build de production
npm run build
```

L'application s'ouvrira automatiquement sur [http://localhost:3000](http://localhost:3000).

---

## 📁 Architecture du Projet

```text
├── firestore.rules                     # Règles de sécurité Firestore (salons, users, privateChats)
├── vercel.json                         # Configuration de réécriture SPA pour Vercel
└── src/
    ├── config/
    │   └── firebase.js                 # Initialisation & configuration Firebase
    ├── contexts/
    │   ├── AuthContext.js              # Session, auth, mode invité & synchro /users
    │   └── ChatThemeContext.js         # Thèmes WhatsApp & préférences utilisateurs
    ├── pages/
    │   ├── AuthPage.js                 # Page d'authentification
    │   └── ChatPage.js                 # Messagerie temps réel (salons & discussions privées)
    ├── components/
    │   ├── Auth/
    │   │   └── AuthCard.js             # Connexion, inscription & accès invité
    │   ├── Chat/
    │   │   ├── ChatHeader.js           # En-tête (salon ou contact privé) & recherche
    │   │   ├── EditProfileModal.js     # Modification du pseudo & de l'avatar
    │   │   ├── ImagePreviewModal.js    # Aperçu avant envoi & visionneuse plein écran
    │   │   ├── MessageInput.js         # Texte, émojis, upload photo & enregistrement vocal
    │   │   ├── MessageItem.js          # Bulle style WhatsApp, réactions & suppression
    │   │   ├── MessageList.js          # Liste des messages groupés par date
    │   │   ├── NewPrivateChatModal.js  # Sélection d'un utilisateur pour chat privé
    │   │   ├── Sidebar.js              # Volet latéral (Salons & Discussions privées)
    │   │   ├── ThemeSelectorModal.js   # Dialogue de sélection des thèmes
    │   │   └── VoiceNotePlayer.js      # Lecteur audio des notes vocales
    │   └── Common/
    │       └── LoadingScreen.js        # Écran de chargement
    ├── utils/
    │   ├── formatters.js               # Formatage dates & heures
    │   ├── privateChat.js              # Helpers ID déterministe & validation participants
    │   └── sound.js                    # Son de notification Web Audio
    ├── App.js                          # Routing (/chat/:roomId, /dm/:chatId) & Providers
    └── index.js
```
