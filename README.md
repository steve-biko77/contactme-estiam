# 👥 Gestionnaire de Contacts - ESTIAM

Application React de gestion de contacts avec backend Node.js, réalisée dans le cadre de l'exercice **Développement Front - React** à l'ESTIAM.

## Fonctionnalités

-  Ajouter un contact (prénom, nom, email, téléphone)
-  Afficher la liste des contacts
-  Modifier un contact
-  Supprimer un contact
-  Connexion au backend Node.js (Express)
- ✅ **Bonus** : Recherche en temps réel
- ✅ **Bonus** : Tri par nom (A→Z / Z→A)
- ✅ **Bonus** : Validation des champs (email, téléphone)
- ✅ Mode local automatique si le backend n'est pas lancé

## Technologies

- **React 18** (via Vite)
- **CSS-in-JS** (styles inline)
- **Node.js + Express** (backend API REST)

## Structure des fichiers

```
src/
├── App.jsx
├── api.js
├── components/
│   ├── ContactForm.jsx
│   ├── ContactList.jsx
│   └── ContactItem.jsx
├── index.css
└── main.jsx

backend/
├── server.js
└── package.json
```

## Installation

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

Le frontend tourne sur `http://localhost:5173` et le backend sur `http://localhost:5000`.

Le proxy Vite redirige automatiquement les appels `/api/*` vers le backend.

## API Endpoints

| Méthode | Route               | Description              |
|---------|---------------------|--------------------------|
| GET     | /api/contacts       | Liste tous les contacts  |
| GET     | /api/contacts/:id   | Récupère un contact      |
| POST    | /api/contacts       | Crée un contact          |
| PUT     | /api/contacts/:id   | Modifie un contact       |
| DELETE  | /api/contacts/:id   | Supprime un contact      |
