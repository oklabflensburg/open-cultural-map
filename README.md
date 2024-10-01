# Kalturkarte Flensburg Kulturnacht

[![Lint css files](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lint-css.yml/badge.svg)](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lint-css.yml)
[![Lint html files](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lint-html.yml/badge.svg)](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lint-html.yml)
[![Lint js files](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-cultural-map/actions/workflows/lighthouse.yml)

![Screenshot Kulturnacht Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-cultural-map/main/screenshot_kulturkarte.webp)

_Haftungsausschluss: Dieses Repository und die zugehörige Datenbank befinden sich derzeit in einer Beta-Version. Einige Aspekte des Codes und der Daten können noch Fehler enthalten. Bitte kontaktieren Sie uns per E-Mail oder erstellen Sie ein Issue auf GitHub, wenn Sie einen Fehler entdecken._


## Hintergrund

Die Kulturakteure präsentieren sich an unterschiedlichsten Orten in der Stadt, um diese Orte sichtbar zu machen haben wir vom OK Lab Flensburg eigens dafür eine Kulturnachtkarte entwickelt. Am 14. September 2024 haben Flensburger Kulturakteure zur Kulturnacht Flensburg eingeladen. Es haben viele Orte und Richtungen des kulturellen Wirkens in Flensburg in dieser Nacht ihre Türen geöffnent und in ihrer Einzigartigkeit und Gesamtheit präsentiert. Von Theaterstücken, einem Blick hinter die Kulissen, Konzerten, kreativen Mit-Mach-Aktionen oder gemeinsamen Gesprächen und Miteinander.


## Mitmachen

Du kannst jederzeit ein Issue auf GitHub öffnen oder uns über oklabflensburg@grain.one schreiben


## Prerequisite

Install system dependencies and clone repository

```
sudo apt install wget curl
sudo apt install git git-lfs
sudo apt install python3 python3-pip python3-venv
sudo apt install gnupg2 gdal-bin osm2pgsql

wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor > postgresql-keyring.gpg
sudo mv postgresql-keyring.gpg /etc/apt/trusted.gpg.d/
sudo chown root:root /etc/apt/trusted.gpg.d/postgresql-keyring.gpg
sudo chmod ugo+r /etc/apt/trusted.gpg.d/postgresql-keyring.gpg
sudo chmod go-w /etc/apt/trusted.gpg.d/postgresql-keyring.gpg
echo "deb [arch=amd64, signed-by=/etc/apt/trusted.gpg.d/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

sudo apt update
sudo apt install postgresql-16 postgresql-16-postgis-3 postgresql-client-16

# install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# download and install Node.js
nvm install 20

# verifies the right Node.js version is in the environment
node -v

# verifies the right NPM version is in the environment
npm -v

git clone https://github.com/oklabflensburg/open-monuments-map.git
```


Create a dot `.env` file inside the project root. Make sure to add the following content and repace values.

```
BASE_URL=http://localhost

CONTACT_MAIL=mail@example.com
CONTACT_PHONE="+49xx"

PRIVACY_CONTACT_PERSON="Firstname Lastname"

ADDRESS_NAME="Address Name"
ADDRESS_STREET="Address Street"
ADDRESS_HOUSE_NUMBER="House Number"
ADDRESS_POSTAL_CODE="Postal Code"
ADDRESS_CITY="City"

DB_PASS=postgres
DB_HOST=localhost
DB_USER=postgres
DB_NAME=postgres
DB_PORT=5432
```


## Update repository

```
git pull
git lfs pull
```


## Update dataset

Next initialize python virtualenv and install the dependencies

```
cd tools
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 generate_geojson.py ../data/kulturnacht-flensburg-2024.csv
python3 generate_sitemap.py ../data/kulturnacht-flensburg-2024.geojson ../static/sitemap.xml https://knf.grain.one/
deactivate
```


## Download locations

Download POIs der Touristischen Landesdatenbank Schleswig-Holstein

```
psql -U oklab -h localhost -d oklab -p 5432 < data/kulturorte_schema.sql
```

```
cd tools
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 location_downloader.py --url https://opendata.schleswig-holstein.de/dataset/37ce8a8f-abe7-4db4-ba08-5cf6dc659188/resource/c715326c-88d4-40b7-88c6-00ab3544eb10/download/poi.json.gz --table sh_poi --env ../.env --verbose
deactivate
```


## LICENSE

[CC0-1.0](LICENSE)
