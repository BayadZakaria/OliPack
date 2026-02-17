# 🌿 OliPack : Portail GreenTech

Bienvenue dans le projet OliPack. Ce dashboard permet de gérer la transformation des déchets oléicoles en ressources de valeur (bioplastiques et pellets).

## 🚀 Configuration Supabase (Cloud)

Pour lier l'application à votre projet Supabase réel :

### 1. Clés API
Allez dans votre dashboard Supabase :
- **Settings (Roue dentée)** > **API**
- Copiez `Project URL` -> mettez-le dans `SUPABASE_URL` dans `.env`
- Copiez `anon public` -> mettez-le dans `SUPABASE_ANON_KEY` dans `.env`

### 2. Authentification
- **Authentication** > **Providers** > **Email**
- **Décochez** "Confirm email" pour tester sans attendre de mail de confirmation.

### 3. Schéma SQL
Si vous ne l'avez pas encore fait, exécutez le script SQL fourni dans le SQL Editor pour créer les tables `profiles`, `predictions` et `collections`.

## 🛠️ Commandes utiles
1. `npm install` (pour installer les bibliothèques)
2. `npm run dev` (pour lancer l'application sur http://localhost:5173)