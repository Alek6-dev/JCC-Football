# Demarrage dev stable

## Commande principale

```bash
npm run dev:web
```

Le chemin officiel de dev quotidien est le web local sur PC.

Objectif : avancer sur le coeur du jeu sans dependre du tunnel Expo/ngrok.

## Pourquoi

Le tunnel Expo depend de `ngrok` et peut casser pour des raisons externes au
code du projet : session Expo, service ngrok, reponse exp.direct, reseau,
version Node ou bug de gestion d'erreur Expo CLI.

Il ne doit plus etre dans le chemin critique pour travailler.

## Tester sur iPhone

Pour tester sur iPhone hors reseau local :

1. developper et verifier en web local avec `npm run dev:web` ;
2. commit + push sur `main` ;
3. ouvrir la PWA Vercel sur l'iPhone.

## Mobile natif

Si le projet a besoin d'un vrai test natif iOS regulier :

- creer un compte Apple Developer ;
- utiliser EAS Build pour generer un build iOS installable ;
- tester via build de dev/TestFlight.

Sur Windows, un build iOS local n'est pas possible sans Mac/Xcode. Le chemin
realiste est donc EAS Build cote cloud, plus tard, quand le coeur du jeu justifie
cette etape.
