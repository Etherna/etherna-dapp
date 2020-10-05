# Instruction to generate an SSL certificate

Link: https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-cert-for-localhost-for-use-with-express-node

## 1. cd to the sslcert folder
`cd server/sslcert`

## 2. Run this script
`openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert.key -out cert.pem -config req.cnf -sha256`

## 3. Trust certificate (macOS)
  a. Open the proxy web page
  b. Open the web inspector and go to the 'Security' tab
  c. Click on 'View Certificate'
  d. Drag the Certificate picture on the Desktop
  e. Double Click and save it in the System
  f. Open the keychain program, find the certificate and double click it
  g. Under the 'Trust' section, in the 'When using this certificate' option, select 'Always Trust'
  h. Restart server and refresh page
