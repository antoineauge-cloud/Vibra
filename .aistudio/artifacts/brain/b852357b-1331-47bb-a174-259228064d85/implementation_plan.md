# Plan d'Implémentation : Thème Cyberpunk Néon, Résolution Redirection Chrome & Audit Sécurité

Résolution complète de la redirection lors de l'installation sous Google Chrome vers l'aperçu Google AI Studio, déploiement d'un thème Cyberpunk Néon immersif et fluide avec reflets lumineux et transitions matérielles, et audit de sécurité exhaustif avec protection SSRF, isolation cryptographique des clés de session et en-têtes CSP.

---

## Synthèse des Choix & Décisions Validées

> [!IMPORTANT]
> Les trois décisions fondamentales validées lors de la phase de cadrage régissent cette mise à jour :
> 1. **Style Visuel** : Thème **Cyberpunk Néon immersif** associant un fond noir obsidienne/carbone profond (`#07070e`), des lueurs cyan néon (`#00f0ff`), des accents magenta chaud (`#ff0055`) et des reflets holographiques ultra-fluides.
> 2. **Installation Chrome** : **Détection autonome avec écran de lancement direct sans boucle d'aperçu**, éliminant le piège de redirection vers le cookie d'authentification AI Studio lors du lancement en mode WebAPK/Standalone.
> 3. **Sécurité Globale** : **Audit complet avec protection SSRF**, isolation cryptographique des clés de session et renforcement strict des en-têtes CSP et HTTP sur le serveur Express.

---

## 1. Vue d'Ensemble & Objectifs

- **Problématique résolue** : Lorsque l'utilisateur installe l'application depuis Chrome sur le domaine de développement `ais-dev-...run.app`, la fenêtre autonome WebAPK Android s'ouvre sans le cookie de session Google Cloud Run, provoquant une redirection immédiate vers l'écran d'aperçu AI Studio. La solution implémente une détection d'environnement standalone, un `start_url` découplé avec amorçage direct, et une passerelle claire vers l'URL publique partagée (`ais-pre-...`) et le téléchargement APK direct.
- **Expérience Utilisateur** : Une interface Cyberpunk fluide, ultra-réactive à 60/120 FPS, optimisée pour le toucher mobile, avec des visualisations audio dynamiques et des transitions instantanées.
- **Sécurité Maximale** : Zéro faille SSRF sur les proxies musicaux, aucune clé partagée en clair, et durcissement des communications réseau.

---

## 2. Expérience Utilisateur & Design Visuel (Cyberpunk Néon)

### Palette de Couleurs & Atmosphère
- **Toile Neutre (60%)** : Noir obsidienne profond (`#07070e` / `#0b0b16`) avec maillage subtil et motifs de circuits néon basse opacité.
- **Surfaces Structurelles (30%)** : Panneaux translucides avec flou d'arrière-plan (`backdrop-blur-xl bg-[#0e0e1c]/80`), bordures fines néon cyan (`border-cyan-500/20`) et magenta (`border-pink-500/20`).
- **Accents Actifs (10%)** :
  - *Cyan Néon Cyberpunk* (`#00f0ff`) : Boutons de lecture, indicateurs d'ondes sonores actives, curseurs de fréquence audio.
  - *Magenta Électrique* (`#ff0055`) : Badges d'alerte, favoris, accents d'égaliseur et boutons d'action d'installation.
  - *Ambre Laser* (`#ffb700`) : Alertes hors-ligne et indicateurs de niveau de volume.

### Ergonomie Mobile & Zones du Pouce
- **Zone Naturelle du Pouce (40% inférieur)** : Barre de navigation Cyberpunk à 4 onglets tactiles généreux ($\ge 48\times 48\text{px}$) et MiniPlayer tactile flottant avec boutons Play/Pause larges et glissé latéral.
- **Fluidité & Animations Compositor** : Utilisation exclusive de transitions GPU (`transform`, `opacity`, `backdrop-filter`) réglées sur une courbe cinétique fluide `cubic-bezier(0.16, 1, 0.3, 1)` pour éliminer toute saccade.
- **Régulation Zéro-Pill** : Présentation des métadonnées (durée, artiste, débit FM) sous forme de texte net et épuré avec séparateurs typographiques subtils (`·`), sans bulles ni pilules encombrantes.

---

## 3. Analyse & Correction des Failles de Sécurité

### Faille 1 : Risque SSRF sur le Proxy Spotify oEmbed (`/api/spotify/oembed`)
- **Diagnostic** : Le paramètre `targetUrl` était encodé sans validation de domaine, permettant potentiellement d'interroger des hôtes internes ou arbitraires.
- **Correction** : Validation stricte via URL parser : seules les URLs validées commençant explicitement par `https://open.spotify.com/` ou `https://spotify.link/` sont autorisées. Rejet 400 immédiat pour tout autre domaine.

### Faille 2 : Absence de Limitation de Débit & Déni de Service sur les Recherches
- **Diagnostic** : Les endpoints `/api/music/search` et `/api/music/suggestions` acceptaient des requêtes sans limitation de taille de chaîne ni quota de requêtes par IP.
- **Correction** : Tronquage et assainissement des requêtes à 120 caractères maximum, limitation de débit par IP en mémoire pour bloquer les attaques par saturation.

### Faille 3 : Dérivation Cryptographique Partagée en Fallback
- **Diagnostic** : Si le stockage local échouait, une clé par défaut statique (`vibra-default-secret-v1`) pouvait être utilisée, risquant d'aligner les clés de chiffrement de différents utilisateurs.
- **Correction** : Génération systématique d'une clé d'entropie cryptographique forte (128 bits aléatoires via `window.crypto.getRandomValues`) unique par profil, sans aucun mot de passe par défaut partagé.

### Faille 4 : En-têtes HTTP de Sécurité Manquants sur Express
- **Diagnostic** : Seuls les en-têtes CORS étaient présents, laissant l'application sans protection contre le reniflage de type MIME (`nosniff`) ni contrôle strict du référent.
- **Correction** : Injection des en-têtes :
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` adapté autorisant les flux audio YouTube, Spotify et radios FM certifiées.

---

## 4. Résolution de la Redirection d'Installation Chrome

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DÉTECTION D'INSTALLATION CHROME PWA                  │
└────────────────────────────────────────────────────────────────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
 [Lancement en Standalone]                   [Dans Iframe / Dev URL]
           │                                           │
  Paramètre ?mode=standalone                   Détection window.top !== self
  Bypass automatique de la boucle              OU hostname ais-dev
           │                                           │
  Chargement du Boot Cyberpunk                Écran de redirection direct
  Accès immédiat à la musique & cache          vers URL Publique (ais-pre)
  sans authentification Google Cloud           + Bouton Télécharger l'APK Natif
```

1. **Reconfiguration du Web App Manifest** :
   - Mise à jour de `start_url` vers `/?mode=standalone&source=webapk` avec identifiant canonique stable.
   - Configuration précise du `scope: "/"` évitant toute fuite vers des URLs de redirection d'authentification.
2. **Détecteur Standalone dans `index.html` & `App.tsx`** :
   - Détection prioritaire du mode autonome `(display-mode: standalone)` et `window.navigator.standalone`.
   - Si l'application détecte un contexte standalone, elle désactive tout rechargement d'iframe et stabilise la session utilisateur en local.
3. **Hub d'Installation Dédié dans `InstallModal.tsx` & `ApkStudioModal.tsx`** :
   - Affichage immédiat d'un lien d'amorçage direct vers le domaine public sans barrière de connexion.
   - Fourniture d'un bouton de téléchargement direct de l'archive APK signée et du script d'installation directe unifiée.

---

## 5. Architecture Technique & Composants

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ARCHITECTURE VIBRA                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────┐     ┌───────────────────────────────────┐     │
│   │    Navbar.tsx      │     │       PlayerContext.tsx           │     │
│   │  (Cyberpunk Glow   │     │  (Audio Engine, Equalizer DSP,    │     │
│   │   & Profile Chip)  │     │   YouTube & FM Radio Streams)     │     │
│   └─────────┬──────────┘     └─────────────────┬─────────────────┘     │
│             │                                  │                       │
│             ▼                                  ▼                       │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                     VibraAppShell.tsx                       │      │
│   │       (Fluid Cyberpunk Touch Layout & Swipe Switcher)       │      │
│   ├─────────────────┬──────────────────┬────────────────────────┤      │
│   │  HomeDashboard  │  VibraNativeView │    RadioFMView.tsx     │      │
│   │ (Neon Launcher) │  (YouTube/Stream)│     (20+ Flux FM)      │      │
│   └─────────────────┴──────────────────┴────────────────────────┘      │
│                                │                                       │
│                                ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                     ProfileContext.tsx                      │      │
│   │   (Chiffrement AES-GCM 256 bits isolé, Sync Supabase Cloud) │      │
│   └────────────────────────────┬────────────────────────────────┘      │
│                                │                                       │
│                                ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                        server.ts                            │      │
│   │ (Protection SSRF, En-têtes CSP/nosniff, Proxy YouTube/Audio)│      │
│   └─────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Plan de Déploiement & Validation

1. **Durcissement du Serveur (`server.ts`)** : Validation SSRF sur Spotify, assainissement des requêtes de recherche et injection des en-têtes de sécurité HTTP.
2. **Isolation Cryptographique (`ProfileContext.tsx` & `supabaseSyncService.ts`)** : Génération d'entropie aléatoire par profil pour garantir l'indépendance totale des données utilisateur.
3. **Optimisation du Manifest & Résolution Chrome (`manifest.json` & `index.html`)** : Paramétrage `mode=standalone` et arrêt de toute boucle de redirection d'aperçu.
4. **Restylage Cyberpunk Néon (`index.css`, `Navbar.tsx`, `VibraAppShell.tsx`, `HomeDashboardView.tsx`, `InstallModal.tsx`)** : Implémentation des styles sombres néon avec reflets cyan/magenta, faders lumineux et transitions 60 FPS.
5. **Vérification Complète** : Exécution de `lint_applet` et `compile_applet` pour certifier l'absence totale de régressions ou d'erreurs TypeScript.
