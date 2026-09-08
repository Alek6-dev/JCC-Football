# Architecture du projet JCC Football

Ce document sert de carte simple pour savoir ou changer quoi. Il donne un cadre
de travail, pas une interdiction absolue : si une exception est vraiment utile,
elle doit etre volontaire, locale et expliquee dans le code ou dans la PR.

## Idee generale

Le projet avance vers une separation en trois roles :

- **Ecrans / composants** : affichent l'interface et reagissent aux actions utilisateur.
- **Services** : portent les scenarios metier de l'app.
- **Repositories** : parlent aux outils externes comme Supabase.

L'objectif est que les ecrans ne sachent pas comment la base de donnees fonctionne.
Si Supabase est remplace plus tard, on remplace surtout les repositories.

## Regle d'or

Quand une fonctionnalite grossit, on evite de mettre toute la logique dans
l'ecran ou dans la route API.

Chemin prefere :

```txt
Ecran ou route HTTP
  -> service metier
    -> repository ou client externe
      -> Supabase / API Football / Storage / autre outil
```

Ce n'est pas grave si un petit prototype commence simple. Mais des qu'un ecran
commence a manipuler des requetes, des filtres metier ou des sauvegardes, il faut
extraire vers un service/repository avant que ca devienne couteux.

## Dossiers et responsabilites

### `app/`

Contient les routes Expo Router et les ecrans.

Responsabilites :

- gerer l'etat d'affichage local ;
- appeler les services ;
- afficher les composants ;
- gerer la navigation.

A eviter :

- importer `@/lib/supabase` ;
- faire des `supabase.from(...)` ou `supabase.rpc(...)` ;
- dupliquer une regle metier deja presente dans `lib`.

### `components/`

Contient les composants UI reutilisables.

Responsabilites :

- recevoir des props ;
- afficher une interface ;
- emettre des callbacks.

A eviter :

- parler directement a Supabase ;
- decider d'une regle de jeu importante ;
- lancer une orchestration metier longue.

### `lib/services/`

Contient les scenarios metier de l'app.

Exemples :

- ouvrir un pack ;
- preparer l'album collection ;
- calculer une vue utilisable par un ecran.

Un service peut appeler plusieurs repositories et plusieurs fonctions pures.

### `lib/repositories/`

Contient les acces aux donnees persistantes.

Exemples :

- lire des joueurs dans Supabase ;
- lire les cartes possedees ;
- appeler une RPC Supabase ;
- sauvegarder une collection.

Si on remplace Supabase, c'est principalement ici que le code doit changer.

### `lib/`

Contient aussi les regles pures et les clients techniques.

Exemples :

- `lib/game.ts` : raretes, packs, filtres collection ;
- `lib/scoring-config.ts` : valeurs du bareme fantasy ;
- `lib/scoring.ts` : moteur de calcul du scoring ;
- `lib/api-football.ts` : client API Football serveur.

### `api/`

Contient les routes Vercel natives.

Responsabilites :

- verifier la methode HTTP et les secrets ;
- lire les parametres ;
- appeler des services, repositories ou clients serveur ;
- retourner une reponse HTTP.

A eviter :

- dupliquer le scoring ;
- contenir une grosse logique metier si elle peut vivre dans `lib/services` ;
- recreer des routes miroir dans `app/api` sauf proxy local tres court.

## Exemple concret : packs

- `app/(tabs)/index.tsx` affiche l'accueil et lance l'ouverture de pack.
- `lib/services/pack-service.ts` gere le scenario : charger le catalogue, tirer les cartes, sauvegarder les doublons.
- `lib/repositories/pack-repository.ts` appelle les RPC Supabase liees aux packs.
- `lib/repositories/collection-repository.ts` lit et met a jour la collection utilisateur.

L'ecran ne fait donc plus de `supabase.rpc(...)` directement.

## Exemple concret : collection

- `app/(tabs)/collection.tsx` affiche l'album.
- `lib/services/collection-service.ts` prepare les sections par club et les compteurs.
- `lib/repositories/collection-repository.ts` recupere les joueurs et les cartes possedees.

Si la maniere de stocker les cartes change, l'ecran Collection devrait rester stable.

## Scoring fantasy

Le scoring est separe en deux fichiers :

- `lib/scoring-config.ts` : fichier a modifier pour tester le bareme.
- `lib/scoring.ts` : moteur qui applique le bareme.

Quand tu veux changer l'equilibrage du jeu, commence par `lib/scoring-config.ts`.
Exemples : valeur d'un but, d'une passe decisive, d'un carton jaune, d'un arret gardien.

Les routes backend suivantes utilisent maintenant ce moteur officiel :

- `api/scoring/calculate.ts`
- `api/scoring/cron.ts`

Elles ne doivent pas contenir leur propre copie du bareme.
Leur role est de recuperer les donnees, appeler le moteur de scoring, puis sauvegarder les scores.

## Controle automatique souple

La commande suivante signale les ecarts les plus risqus :

```bash
npm run arch
```

Elle ne remplace pas le jugement humain. Elle sert surtout a eviter les retours
en arriere involontaires, par exemple remettre Supabase directement dans un ecran.

Avant un commit important, utiliser :

```bash
npm run verify
```

## Regle pratique

Quand tu ajoutes une fonctionnalite, demande-toi :

- Est-ce de l'affichage ? Va dans un ecran ou un composant.
- Est-ce un scenario du jeu ? Va dans un service.
- Est-ce un appel Supabase, API Football, Storage ou autre outil externe ? Va dans un repository ou client dedie.
- Est-ce une regle pure du jeu ? Va dans `lib/game.ts`, `lib/scoring.ts` ou un fichier de config metier.

Cette separation rend le projet plus facile a tester, a relire, et a migrer si un outil externe change.

## Checklist avant de coder

- Est-ce que je dois lire ou ecrire en base ? Si oui, commencer par un repository.
- Est-ce que j'orchestre plusieurs actions ? Si oui, passer par un service.
- Est-ce que je change une regle pure ? La mettre dans `lib/game.ts`, `lib/scoring.ts` ou une config dediee.
- Est-ce que je change le bareme fantasy ? Modifier seulement `lib/scoring-config.ts`.
- Est-ce que je touche a Supabase dans un ecran ? Chercher une alternative via service/repository.
