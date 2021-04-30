# Instruction to generate an SSL certificate

## Using `mkcert`

### 1. Install mkcert

```
brew install mkcert
brew install nss # if you use Firefox
```

### 2. Global install (one time)

```
mkcert -install
```

### 3. Generate localhost cert

```
cd /path/to/your/project
mkdir ssl # if it doesn't exist
mkcert -key-file sslcert/key.pem -cert-file sslcert/cert.pem localhost
```

### 2. Update .env

- Copy '.env.example' and rename it '.env'
- Set value of HTTPS to 'true'
- Set value of SSL_KEY_FILE to 'server/sslcert/key.pem'
- Set value of SSL_CRT_FILE to 'server/sslcert/cert.pem'

## Using `openssl`

### 1. Generate localhost cert

```
cd /path/to/your/project
mkdir ssl # if it doesn't exist
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/localhost.key -out ssl/localhost.crt
```

### 2. Update .env

- Copy '.env.example' and rename it '.env'
- Set value of HTTPS to 'true'
- Set value of SSL_KEY_FILE to 'server/sslcert/localhost.key'
- Set value of SSL_CRT_FILE to 'server/sslcert/localhost.crt'
