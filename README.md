# Etsy Atlas Manager

Ce projet est un tableau de bord pour gérer une boutique Etsy, offrant un suivi des commandes, des finances et des utilisateurs.

## Démarrage Rapide

Pour commencer à travailler sur ce projet, vous devez cloner le dépôt depuis GitHub et installer les dépendances.

```bash
# 1. Clonez le dépôt (remplacez l'URL si nécessaire)
git clone https://github.com/atlasinsightsdigital/etsy-atlas-manager.git

# 2. Accédez au dossier du projet
cd etsy-atlas-manager

# 3. Installez les dépendances
npm install

# 4. Lancez le serveur de développement
npm run dev
```

## Configuration de l'Environnement

Avant de lancer l'application, vous devez configurer vos variables d'environnement.

1.  **Créez un fichier `.env.local`** à la racine de votre projet.
2.  **Ajoutez les variables Firebase** suivantes, que vous trouverez dans la console Firebase de votre projet :

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=
    ```

3.  **Ajoutez la clé de service Firebase** (pour les actions côté serveur) :

    ```
    FIREBASE_SERVICE_ACCOUNT=
    ```

    -   Allez dans la console Firebase → Paramètres du projet → Comptes de service.
    -   Cliquez sur "Générer une nouvelle clé privée".
    -   Copiez le contenu du fichier JSON téléchargé et collez-le comme valeur pour `FIREBASE_SERVICE_ACCOUNT`.

## Déploiement

Le projet est configuré pour un déploiement continu sur Firebase Hosting via GitHub Actions.

1.  **Poussez vos modifications** sur la branche `main` de votre dépôt GitHub :

    ```bash
    git push origin main
    ```

2.  **Configurez les secrets sur GitHub** :
    -   Allez dans votre dépôt GitHub → Settings → Secrets and variables → Actions.
    -   Ajoutez les deux secrets suivants :
        -   `FIREBASE_PROJECT_ID` : L'ID de votre projet Firebase.
        -   `FIREBASE_TOKEN` : Un jeton de déploiement Firebase. Vous pouvez le générer en exécutant la commande `firebase login:ci` sur votre machine locale (après avoir installé Firebase Tools avec `npm install -g firebase-tools`).
