# James-Web

Un gestionnaire d'applications web pour Linux qui utilise Nativefier pour créer des applications de bureau à partir de sites web.

## Installation

### Prérequis
- Node.js (v14 ou supérieur)
- npm

### Installation depuis les sources

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/james-web.git
cd james-web

# Installer les dépendances
npm install

# Installer globalement
npm install -g .
```

## Utilisation

### Commandes disponibles

#### Afficher l'aide
```bash
james -h
```

#### Lister toutes les applications
```bash
james list
```

#### Ajouter une nouvelle application
```bash
james add -n nom-app -d "Nom affiché" -u https://example.com
```

Options:
- `-n, --name`: Nom technique de l'application (sans espaces, uniquement lettres minuscules, chiffres et tirets)
- `-d, --display-name`: Nom affiché dans le menu et dans l'application
- `-u, --url`: URL du site web
- `-i, --icon` (optionnel): Chemin vers un fichier d'icône personnalisé

#### Supprimer une application
```bash
james remove -n nom-app
```

## Fonctionnalités

- Création d'applications de bureau à partir de sites web
- Récupération automatique du favicon du site comme icône
- Intégration avec le menu des applications via des fichiers .desktop
- Gestion complète du cycle de vie des applications (installation, listage, suppression)

## Créer un paquet pour les différentes distributions

### Debian/Ubuntu (deb)
Utilisez [pkg-deb](https://www.npmjs.com/package/pkg-deb):

```bash
npm install -g pkg-deb
pkg-deb --name james-web --version 1.0.0 --maintainer "Votre Nom <email@example.com>"
```

### Arch Linux (PKGBUILD)
Créez un fichier PKGBUILD:

```bash
pkgname=james-web
pkgver=1.0.0
pkgrel=1
pkgdesc="Gestionnaire d'applications web pour Linux"
arch=('any')
url="https://github.com/votre-username/james-web"
license=('MIT')
depends=('nodejs>=14.0.0')
source=("$pkgname-$pkgver.tar.gz::https://github.com/votre-username/james-web/archive/v$pkgver.tar.gz")
sha256sums=('SKIP')

package() {
  cd "$srcdir/$pkgname-$pkgver"
  npm install --production
  install -dm755 "$pkgdir/usr/lib/node_modules/$pkgname"
  cp -r . "$pkgdir/usr/lib/node_modules/$pkgname"
  install -dm755 "$pkgdir/usr/bin"
  ln -s "/usr/lib/node_modules/$pkgname/bin/james" "$pkgdir/usr/bin/james"
}
```

### Fedora/CentOS/RHEL (rpm)
Utilisez [pkg-rpm](https://www.npmjs.com/package/pkg-rpm):

```bash
npm install -g pkg-rpm
pkg-rpm --name james-web --version 1.0.0 --release 1 --maintainer "Votre Nom <email@example.com>"
```

## Licence

MIT