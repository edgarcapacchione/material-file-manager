# Deploy Docker su VPS con Nginx

Questa è la procedura production raccomandata per Material File Manager.

## Architettura

```text
Internet
   |
   | 80 / 443
   v
frontend container
Nginx + build statica Angular
   |
   | rete Docker privata, backend:8080
   v
backend container
Spring Boot + sessione OIDC
   |
   | bind mount /data
   v
/srv/material-file-manager/data
```

I container applicativi sono due:

- `frontend`: Nginx termina TLS, serve Angular e inoltra API e flussi OIDC.
- `backend`: Spring Boot, non pubblica porte sull'host e gestisce autenticazione,
  sessioni e filesystem.

Angular non richiede un proprio processo a runtime: `npm run build` produce file
statici che vengono copiati nell'immagine Nginx. Mettere Nginx e Java nello
stesso container complicherebbe aggiornamenti, health check, privilegi e log.

Il servizio `certbot` nel Compose è un tool one-shot e non rimane in esecuzione.

## Prerequisiti

- VPS Linux aggiornata.
- Docker Engine con plugin Docker Compose.
- Dominio, per esempio `files.example.com`, con record DNS `A` e opzionalmente
  `AAAA` già rivolti alla VPS.
- Porte pubbliche `80/tcp` e `443/tcp`.
- Porta SSH limitata e autenticazione esclusivamente tramite chiavi.
- Client OIDC configurato presso il provider.

Controllare:

```bash
docker version
docker compose version
getent hosts files.example.com
```

## 1. Preparare la VPS

Clonare il repository:

```bash
sudo install -d -o "$USER" -g "$USER" /opt/material-file-manager
git clone <URL_REPOSITORY> /opt/material-file-manager
cd /opt/material-file-manager
```

Creare la directory persistente. Il backend gira con UID/GID `10001`:

```bash
sudo install -d -o 10001 -g 10001 -m 0700 /srv/material-file-manager/data
```

Non usare un volume anonimo per i documenti. Il bind mount rende esplicita la
posizione dei dati e consente backup indipendenti dal ciclo di vita dei
container.

## 2. Configurare OIDC

Registrare nel provider:

```text
Redirect URI:
https://files.example.com/login/oauth2/code/mfm
```

L'applicazione usa Authorization Code Flow. I token restano in Spring Boot;
Angular riceve solo un cookie di sessione `Secure` e `HttpOnly`.

Creare la configurazione:

```bash
cp deploy/.env.example deploy/.env
chmod 0600 deploy/.env
nano deploy/.env
```

Variabili:

- `MFM_DOMAIN`: dominio pubblico, senza schema.
- `MFM_DATA_PATH`: percorso assoluto dei documenti sulla VPS.
- `OIDC_ISSUER_URI`: issuer OIDC, non l'authorization endpoint.
- `OIDC_CLIENT_ID` e `OIDC_CLIENT_SECRET`: credenziali del client.
- `MFM_ALLOWED_IDENTITIES`: allowlist `issuer|subject`, separata da virgole.
- `MFM_ALLOWED_EMAILS`: alternativa iniziale, solo per email OIDC verificate.

Per il primo accesso è possibile usare la propria email verificata. Dopo il
login, `GET /api/auth/me` restituisce `subject`; a quel punto è preferibile
configurare:

```text
MFM_ALLOWED_IDENTITIES=https://issuer.example|subject-restituito
MFM_ALLOWED_EMAILS=
```

## 3. Costruire le immagini

Dal root del repository:

```bash
docker compose --env-file deploy/.env build --pull
```

Le build sono multi-stage:

- Maven compila il JAR; l'immagine finale contiene solo il JRE e il JAR.
- Node compila Angular; l'immagine finale contiene solo Nginx e gli asset.

Verificare la configurazione risolta:

```bash
docker compose --env-file deploy/.env config
```

Prestare attenzione a non incollare l'output in ticket o log pubblici perché
contiene le variabili OIDC.

## 4. Avviare in modalità bootstrap TLS

```bash
docker compose --env-file deploy/.env up -d backend frontend
docker compose --env-file deploy/.env ps
```

Se il certificato non esiste, Nginx parte automaticamente in modalità
bootstrap: espone HTTP solo per challenge ACME e health check; le altre richieste
ricevono `503`.

Verificare:

```bash
curl http://files.example.com/nginx-health
```

La risposta deve essere `bootstrap`.

## 5. Ottenere il primo certificato

Con Nginx bootstrap attivo:

```bash
docker compose --env-file deploy/.env --profile tools run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  --non-interactive --agree-tos \
  --email admin@example.com \
  -d files.example.com

docker compose --env-file deploy/.env restart frontend
```

Sostituire email e dominio. Emissione iniziale e rinnovi usano entrambi il
plugin webroot. I certificati sono conservati nel volume Docker
`material-file-manager_letsencrypt`.

Attendere che entrambi i servizi risultino `healthy`, poi verificare:

```bash
curl -I https://files.example.com
curl https://files.example.com/nginx-health
```

Aprendo il dominio, il pulsante di login deve reindirizzare al provider OIDC e
poi tornare alla callback configurata.

Il backend non compare in `docker ps` con una porta pubblicata: è intenzionale.
Nginx lo raggiunge tramite DNS Compose usando `backend:8080`.

## 6. Firewall

Con UFW, adattare prima la porta SSH:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Non aprire la porta `8080`.

Se l'app è esclusivamente personale, è ancora preferibile aggiungere Tailscale
e limitare l'accesso al dominio/IP della tailnet.

## 7. Rinnovo TLS

Con Nginx attivo, Certbot usa la directory webroot condivisa:

```bash
cd /opt/material-file-manager
docker compose --env-file deploy/.env --profile tools run --rm certbot renew
docker compose --env-file deploy/.env exec frontend \
  nginx -c /tmp/nginx.conf -s reload
```

Programmare il comando due volte al giorno con un timer systemd o cron. Certbot
rinnova solo quando necessario.

Esempio cron root:

```cron
17 3,15 * * * cd /opt/material-file-manager && docker compose --env-file deploy/.env --profile tools run --rm certbot renew && docker compose --env-file deploy/.env exec -T frontend nginx -c /tmp/nginx.conf -s reload
```

Provare prima:

```bash
docker compose --env-file deploy/.env --profile tools run --rm certbot \
  renew --dry-run
```

## 8. Log e diagnostica

```bash
docker compose --env-file deploy/.env ps
docker compose --env-file deploy/.env logs --tail=200 frontend
docker compose --env-file deploy/.env logs --tail=200 backend
docker compose --env-file deploy/.env logs -f
```

Controllare la configurazione Nginx attiva:

```bash
docker compose --env-file deploy/.env exec frontend nginx -t -c /tmp/nginx.conf
```

Verificare che Spring non sia pubblicato:

```bash
docker compose --env-file deploy/.env port backend 8080
```

Il comando non deve restituire una porta host.

## 9. Aggiornamento

Prima dell'aggiornamento eseguire e verificare un backup dei dati.

```bash
cd /opt/material-file-manager
git fetch --all --prune
git checkout <tag-o-commit>
docker compose --env-file deploy/.env build --pull
docker compose --env-file deploy/.env up -d
docker compose --env-file deploy/.env ps
```

Compose sostituisce i container ma non il bind mount dei documenti né il volume
dei certificati.

Per rollback:

```bash
git checkout <commit-precedente>
docker compose --env-file deploy/.env build
docker compose --env-file deploy/.env up -d
```

Non eseguire `docker compose down -v`: `-v` elimina anche i volumi dei
certificati.

## 10. Backup

I documenti importanti non devono avere una sola copia. Il percorso da
proteggere è quello indicato da `MFM_DATA_PATH`, non il filesystem del
container.

Minimo richiesto:

- backup cifrato off-site con Restic;
- snapshot giornalieri e retention definita;
- controllo periodico del repository;
- prova di restore su una directory differente;
- copia del file `deploy/.env` in un archivio segreto separato;
- backup del volume Let’s Encrypt oppure capacità documentata di riemetterlo.

Finché cestino, upload atomico e procedura Restic verificata non sono
implementati, Material File Manager non deve essere l'unica copia dei documenti.

## Hardening applicato

- Spring non pubblica porte sull'host.
- Backend interamente non-root.
- Nginx con master confinato per leggere la chiave TLS e worker non-root.
- Root filesystem read-only.
- Tutte le Linux capabilities rimosse.
- `no-new-privileges`.
- `/tmp` in memoria.
- dati montati solo nel backend.
- certificati montati read-only in Nginx.
- redirect HTTP verso HTTPS, TLS 1.2/1.3 e header di sicurezza.
- health check distinti.

Per maggiore riproducibilità, in una release stabile sostituire i tag delle
immagini base con digest verificati.
