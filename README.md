# Material File Manager

File manager privato, mobile-first, costruito con Angular e Spring Boot.

Il progetto è in stabilizzazione. Non deve ancora essere l'unica copia di
documenti importanti: upload atomico, cestino e backup Restic verificato sono le
prossime priorità.

## Architettura

In production vengono eseguiti due container:

```text
Browser
  |
  | HTTPS
  v
Nginx + Angular statico
  |
  | rete Docker privata
  v
Spring Boot
  |
  v
bind mount dei documenti sulla VPS
```

- Il container `frontend` compila Angular durante la build, serve gli asset con
  Nginx, termina TLS e inoltra `/api`, `/oauth2` e `/login/oauth2`.
- Il container `backend` esegue Spring Boot e non espone porte sull'host.
- Angular non necessita di un container runtime separato: dopo la compilazione
  è un insieme di file statici, già incluso nel container Nginx.
- Nginx e Spring non vengono messi nello stesso container: hanno lifecycle,
  privilegi, log, health check e frequenza di aggiornamento differenti.
- Certbot è disponibile come container one-shot, non come servizio permanente.

La definizione si trova in [compose.yaml](compose.yaml). La guida VPS completa,
inclusi certificati, firewall, rinnovo, aggiornamento e rollback, è in
[deploy/README.md](deploy/README.md).

## Funzionalità attuali

- Navigazione directory in vista lista e griglia
- Anteprima PDF e testo
- Creazione cartelle, copia, spostamento, rinomina e cancellazione
- Ricerca nella directory corrente
- Login OIDC gestito da Spring Boot
- Sessione server-side con cookie `Secure` e `HttpOnly`
- Protezione CSRF compatibile con Angular
- Allowlist production per identità OIDC o email verificata
- Operazioni filesystem confinate alla root configurata

## Sviluppo locale

Il profilo Spring predefinito è `prod` e fallisce intenzionalmente senza
configurazione OIDC. Per lavorare in locale usare `dev`:

```powershell
cd spring-boot
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

La root locale predefinita è `${user.home}/mfm-files-dev`. È possibile
sovrascriverla con `MFM_ROOT_PATH`.

In un altro terminale:

```powershell
cd angular
npm install
npm start
```

Aprire `http://localhost:4200`. Il proxy Angular inoltra API e flussi OIDC a
Spring Boot. Il profilo `dev` usa un'identità locale, mantenendo sessione e CSRF.

## Avvio Docker production

Sintesi; leggere prima la guida completa:

```bash
cp deploy/.env.example deploy/.env
chmod 0600 deploy/.env
nano deploy/.env

sudo install -d -o 10001 -g 10001 -m 0700 /srv/material-file-manager/data

docker compose --env-file deploy/.env build --pull

docker compose --env-file deploy/.env up -d backend frontend

docker compose --env-file deploy/.env --profile tools run \
  --rm certbot \
  certonly --webroot -w /var/www/certbot --agree-tos \
  --email admin@example.com \
  -d files.example.com

docker compose --env-file deploy/.env restart frontend
docker compose --env-file deploy/.env ps
```

Il callback OIDC da registrare è:

```text
https://files.example.com/login/oauth2/code/mfm
```

Non pubblicare la porta Spring `8080` e non eseguire
`docker compose down -v`.

## Verifica

```powershell
cd spring-boot
mvn test

cd ../angular
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Verifica Docker:

```bash
docker compose --env-file deploy/.env config
docker compose --env-file deploy/.env build
docker compose --env-file deploy/.env ps
```

## Licenza

Il progetto è distribuito secondo la licenza presente nel repository.
