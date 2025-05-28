# Configuration des Webhooks Clerk pour Bet Yourself

Ce document explique comment configurer les webhooks Clerk pour synchroniser automatiquement les données utilisateur avec la base de données Supabase.

## Pourquoi utiliser des webhooks ?

Les webhooks permettent de réagir en temps réel aux événements liés aux utilisateurs dans Clerk, comme la création, la mise à jour ou la suppression d'un compte. Cette approche présente plusieurs avantages par rapport à la vérification à chaque connexion :

- **Réduction des requêtes inutiles** : la synchronisation se fait uniquement lors des changements réels
- **Meilleure réactivité** : les mises à jour sont traitées en temps réel
- **Fiabilité accrue** : moins de risques de désynchronisation entre Clerk et Supabase
- **Réduction de la charge sur le serveur** : moins d'appels API à chaque chargement de page

## Configuration dans le Dashboard Clerk

1. Connectez-vous au [Dashboard Clerk](https://dashboard.clerk.dev/)
2. Sélectionnez votre application
3. Dans le menu de gauche, cliquez sur "Webhooks"
4. Cliquez sur "Add Endpoint"
5. Configurez le webhook avec les informations suivantes :
   - **URL** : `https://votre-domaine.com/api/clerk-webhooks` (remplacez par votre domaine en production)
   - **Message Filtering** : Sélectionnez les événements suivants :
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - **Version** : Choisissez la dernière version stable
6. Cliquez sur "Create"
7. Copiez la clé secrète (svix_secret) générée

## Configuration des variables d'environnement

Ajoutez la clé secrète du webhook à votre fichier `.env` :

```
CLERK_WEBHOOK_SECRET=whsec_votre_clé_secrète
```

Assurez-vous d'ajouter également cette variable dans votre environnement de production.

## Test des webhooks

Pour tester que les webhooks fonctionnent correctement :

1. Créez un nouvel utilisateur dans Clerk
2. Vérifiez dans Supabase qu'un profil utilisateur correspondant a été créé
3. Modifiez les informations de l'utilisateur dans Clerk
4. Vérifiez que les modifications sont répercutées dans Supabase

## Dépannage

Si les webhooks ne fonctionnent pas comme prévu :

1. Vérifiez les journaux de votre application pour détecter d'éventuelles erreurs
2. Assurez-vous que la variable d'environnement `CLERK_WEBHOOK_SECRET` est correctement définie
3. Dans le dashboard Clerk, vérifiez l'historique des tentatives de webhook pour voir les éventuelles erreurs
4. Vérifiez que votre endpoint est accessible depuis l'extérieur (en production) ou utilisez un service comme ngrok pour les tests locaux

## Ressources supplémentaires

- [Documentation officielle des webhooks Clerk](https://clerk.com/docs/users/sync-data-to-your-backend)
- [Guide d'utilisation de Svix avec Next.js](https://clerk.com/docs/users/sync-data-to-your-backend)