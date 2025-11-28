# Atlas Etsy Gest

Bienvenue sur Atlas Etsy Gest ! Une application full-stack pour gérer votre boutique Etsy, construite avec Next.js, Firebase et les outils d'IA de Google.

Ce projet fournit une base solide pour un tableau de bord d'analyse et de gestion, incluant l'authentification, la gestion de données avec Firestore, des fonctions backend automatisées, et une interface utilisateur moderne et réactive.

## Table des matières

1.  [Architecture du Projet](#1-architecture-du-projet)
2.  [Schéma de la base de données Firestore](#2-schéma-de-la-base-de-données-firestore)
3.  [Étape 1 : Configuration du projet Firebase](#3-étape-1--configuration-du-projet-firebase)
4.  [Étape 2 : Configuration de l'environnement local](#4-étape-2--configuration-de-lenvironnement-local)
5.  [Étape 3 : Lancer le projet en local](#5-étape-3--lancer-le-projet-en-local)
6.  [Étape 4 : Déploiement sur Firebase](#6-étape-4--déploiement-sur-firebase)
7.  [Déploiement continu avec GitHub Actions (CI/CD)](#7-déploiement-continu-avec-github-actions-cicd)

---

### 1. Architecture du Projet

-   **Frontend**: Construit avec [Next.js (App Router)](https://nextjs.org/docs) et les composants [ShadCN/UI](https://ui.shadcn.com/) pour une interface rapide et moderne.
-   **Backend**:
    -   **Authentification**: Gérée par [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Mot de passe et fournisseurs OAuth).
    -   **Base de données**: [Cloud Firestore](https://firebase.google.com/docs/firestore) est utilisé comme base de données NoSQL.
    -   **Fonctions Serverless**: [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) pour la logique backend automatisée (ex: calculs sur les commandes).
-   **Déploiement**:
    -   L'ensemble de l'application (frontend et fonctions) est hébergé sur [Firebase](https://firebase.google.com/).
    -   Un workflow GitHub Actions est inclus pour l'intégration et le déploiement continus (CI/CD).
-   **IA Générative**: Utilise [Genkit](https://firebase.google.com/docs/genkit) pour intégrer des fonctionnalités d'IA, comme les résumés de performance.

---

### 2. Schéma de la base de données Firestore

Voici la structure de données proposée pour Cloud Firestore.

#### Collection `users`

Stocke les informations sur les utilisateurs de l'application.

-   **Chemin**: `/users/{uid}`
-   **Exemple de document**:
    ```json
    {
      "name": "Admin User",
      "email": "admin@etsyatlas.com",
      "role": "admin",
      "avatarUrl": "/avatars/01.png"
    }
    ```

#### Collection `orders`

Stocke toutes les commandes, qu'elles soient importées ou ajoutées manuellement.

-   **Chemin**: `/orders/{orderId}`
-   **Exemple de document**:
    ```json
    {
      "etsyOrderId": "ORD78901",
      "customerName": "Liam Johnson",
      "orderDate": "2023-10-23",
      "status": "Delivered",
      "orderPrice": 150.00,
      "orderCost": 70.00,
      "shippingCost": 15.00,
      "additionalFees": 5.00,
      "createdByUid": "user_uid_who_created_it",
      "createdByEmail": "user@example.com",
      "createdAt": "2023-10-23T10:00:00Z",
      "editedBy": "user_uid_who_last_edited_it",
      "editedAt": "2023-10-23T12:30:00Z",
      "totalExpenses": 90.00,
      "profit": 60.00
    }
    ```

#### Collection `products`

Stocke les informations sur les produits de votre boutique.

-   **Chemin**: `/products/{productId}`
-   **Exemple de document**:
    ```json
    {
      "name": "Handmade Ceramic Mug",
      "category": "Home Goods",
      "price": 25.00,
      "stock": 50,
      "imageUrl": "https://picsum.photos/seed/product1/400/400",
      "imageHint": "ceramic mug"
    }
    ```

---

### 3. Étape 1 : Configuration du projet Firebase

1.  **Créer un projet Firebase**:
    -   Allez sur la [console Firebase](https://console.firebase.google.com/).
    -   Cliquez sur **"Ajouter un projet"** et suivez les instructions.

2.  **Activer les services**:
    -   Dans le menu de gauche, allez dans **"Build"**.
    -   **Authentication**:
        -   Cliquez sur "Authentication" puis sur **"Commencer"**.
        -   Dans l'onglet **"Sign-in method"**, activez le fournisseur **"E-mail/Mot de passe"**.
    -   **Firestore Database**:
        -   Cliquez sur "Firestore Database" puis sur **"Créer une base de données"**.
        -   Choisissez le mode **Production** et sélectionnez une région.

3.  **Enregistrer votre application web**:
    -   Sur la page d'aperçu de votre projet, cliquez sur l'icône web (`</>`) pour ajouter une application web.
    -   Donnez un nom à votre application (ex: "Atlas Etsy Gest Web") et cochez la case pour configurer **Firebase Hosting**.
    -   Firebase vous fournira un objet de configuration `firebaseConfig`. Vous en aurez besoin à l'étape suivante.

---

### 4. Étape 2 : Configuration de l'environnement local

1.  **Installer la CLI Firebase**:
    Si vous ne l'avez pas déjà, installez-la globalement :
    ```bash
    npm install -g firebase-tools
    ```

2.  **Se connecter à Firebase**:
    ```bash
    firebase login
    ```

3.  **Lier votre projet local**:
    Depuis le répertoire racine de votre projet, exécutez :
    ```bash
    firebase use --add
    ```
    Sélectionnez le projet Firebase que vous venez de créer.

4.  **Créer le fichier `.env.local`**:
    À la racine de votre projet, créez un fichier nommé `.env.local`. Copiez-y la configuration de votre application Firebase (obtenue à l'étape 3.3).

    ```env
    # .env.local

    # Firebase App Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
    ```
    *Note: Bien que le projet utilise Next.js, pour la connexion au SDK Firebase côté client, les variables doivent être préfixées par `NEXT_PUBLIC_`.*

---

### 5. Étape 3 : Lancer le projet en local

1.  **Installer les dépendances**:
    ```bash
    npm install
    ```

2.  **Démarrer le serveur de développement**:
    ```bash
    npm run dev
    ```
    L'application sera disponible sur [http://localhost:9002](http://localhost:9002). L'authentification et la connexion à Firestore devraient fonctionner avec votre projet Firebase réel.

---

### 6. Étape 4 : Déploiement sur Firebase

1.  **Déployer les règles de sécurité Firestore**:
    Le fichier `firestore.rules` est déjà dans le projet. Pour le déployer :
    ```bash
    firebase deploy --only firestore:rules
    ```

2.  **Déployer les Cloud Functions**:
    Le code se trouve dans le dossier `functions`. Pour déployer :
    ```bash
    firebase deploy --only functions
    ```

3.  **Déployer l'application Next.js sur Firebase Hosting**:
    Le fichier `firebase.json` est configuré pour un déploiement "framework-aware". Firebase détectera automatiquement Next.js.
    ```bash
    firebase deploy --only hosting
    ```

    Pour tout déployer en une seule fois :
    ```bash
    firebase deploy
    ```

---

### 7. Déploiement continu avec GitHub Actions (CI/CD)

Le fichier `.github/workflows/deploy.yml` est configuré pour déployer l'ensemble de votre application (frontend et fonctions) sur Firebase.

**Pour le faire fonctionner :**

1.  **Poussez votre code sur un dépôt GitHub.**

2.  **Configurez les secrets dans GitHub**:
    -   Allez dans les paramètres de votre dépôt > `Secrets and variables` > `Actions`.
    -   Créez les secrets suivants :
        -   `FIREBASE_TOKEN`: Obtenez-le en exécutant `firebase login:ci` dans votre terminal.
        -   `FIREBASE_PROJECT_ID`: L'ID de votre projet Firebase.

Chaque `push` sur la branche `main` déclenchera automatiquement le workflow de déploiement.
