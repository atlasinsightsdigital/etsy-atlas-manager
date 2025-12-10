# Etsy Atlas Manager

Bienvenue sur Etsy Atlas Manager, votre plateforme de gestion tout-en-un pour votre boutique Etsy. Suivez vos commandes, gérez vos finances et analysez vos performances en toute simplicité.

## Démarrage Rapide

Pour lancer le projet en local, suivez ces étapes :

1.  **Installer les dépendances :**
    ```bash
    npm install
    ```

2.  **Configurer les variables d'environnement Firebase :**
    *   Créez un fichier `.env.local` à la racine du projet.
    *   Allez dans la **console Firebase > Paramètres du projet > Comptes de service**.
    *   Cliquez sur **"Générer une nouvelle clé privée"**.
    *   Copiez le contenu du fichier JSON téléchargé et collez-le dans votre `.env.local` comme ceci :
        ```
        FIREBASE_SERVICE_ACCOUNT='{...contenu de votre clé JSON...}'
        ```

3.  **Lancer le serveur de développement :**
    ```bash
    npm run dev
    ```

L'application sera accessible sur `http://localhost:9002`.

---

## Déploiement sur GitHub avec Firebase Hosting

Votre projet est configuré pour un déploiement continu via GitHub Actions. Chaque `push` sur la branche `main` déclenchera automatiquement un déploiement sur Firebase Hosting.

### Prérequis

*   Avoir créé un dépôt GitHub pour ce projet.
*   Avoir installé le CLI Firebase (`npm install -g firebase-tools`).

### Étapes de Configuration

1.  **Pousser votre code sur GitHub :**
    Si c'est votre première fois, suivez ces commandes depuis la racine de votre projet :
    ```bash
    # Lier votre projet local au dépôt distant
    git remote add origin https://github.com/VOTRE_NOM/VOTRE_REPO.git

    # Préparer et envoyer les fichiers
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git push -u origin main
    ```

2.  **Configurer les "Secrets" sur GitHub :**
    Cette étape est cruciale et doit être faite une seule fois. Elle permet à GitHub d'agir en votre nom pour déployer sur Firebase.

    *   Allez sur la page de votre dépôt GitHub.
    *   Naviguez vers **Settings > Secrets and variables > Actions**.
    *   Créez les deux secrets suivants en cliquant sur **"New repository secret"** :

    #### Secret 1 : `FIREBASE_PROJECT_ID`
    *   **Nom :** `FIREBASE_PROJECT_ID`
    *   **Valeur :** L'ID de votre projet Firebase (ex: `votre-projet-a1b2c`). Vous pouvez le trouver dans les paramètres de votre projet Firebase.

    #### Secret 2 : `FIREBASE_TOKEN`
    *   **Nom :** `FIREBASE_TOKEN`
    *   **Valeur :** Pour obtenir ce token, ouvrez un terminal et exécutez la commande suivante. Elle vous ouvrira une page de connexion Google.
        ```bash
        firebase login:ci
        ```
    *   Une fois connecté, un **token** (une longue chaîne de caractères) s'affichera dans votre terminal. Copiez-le et collez-le comme valeur pour ce secret.

### C'est Terminé !

Désormais, chaque fois que vous pousserez des modifications sur la branche `main` de votre dépôt, un déploiement sera automatiquement lancé. Vous pourrez suivre sa progression dans l'onglet **"Actions"** de votre dépôt GitHub.
