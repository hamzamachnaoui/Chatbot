# ChatApp - Application de Messagerie Instantanée

Une application de messagerie instantanée avec gestion des rooms, prise en charge des emojis, profils utilisateurs personnalisés et mise à jour en temps réel grâce à Firebase.

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies Utilisées](#technologies-utilisées)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## Aperçu

ChatApp est une application moderne de messagerie développée avec React et Firebase. Les utilisateurs peuvent créer un profil, choisir un avatar, accéder à des rooms thématiques, et envoyer des messages avec mise à jour en temps réel.

---

## Fonctionnalités

- **Authentification anonyme** : Les utilisateurs se connectent sans compte grâce à Firebase Authentication.
- **Profils utilisateurs** : Pseudo, avatar et bio configurables.
- **Rooms** : Liste de rooms thématiques (programmation, IA, sécurité, etc.).
- **Messages en temps réel** : Envoi et réception instantanés via Firebase Firestore.
- **Emojis** : Prise en charge des emojis dans les messages.
- **Statut utilisateur** : En ligne, occupé, hors ligne.
- **Déconnexion** : Possibilité de se déconnecter.

---

## Technologies Utilisées

- **React** : Framework principal pour la création d'interfaces utilisateur.
- **Firebase** :
  - Firestore pour le stockage des messages en temps réel.
  - Authentication pour l'authentification anonyme des utilisateurs.
- **Material-UI** : Bibliothèque pour les composants de l'interface utilisateur.
- **Emoji Picker** : Sélecteur d'emojis pour enrichir les messages.

---

## Configuration

### Prérequis

- Node.js et npm installés sur votre machine.
- Un compte Firebase avec un projet configuré.

### Étapes d'installation

1. Clonez le dépôt :
   ```bash
   
   git clone https://github.com/hamzamachnaoui/chatapp.git
   cd chatapp
