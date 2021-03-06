# etherna

We want to solve two big issue. One related to most part of youtube creators that in last period had been demonetized and obscured. The other one, is the preservation of user's personal data.

We are developing a new video platform, a platform free from the slavery of advertising and all its restrictions. A more transparent platform for its users. A platform in which every artist, every independent journalist and why not, companies can feel valued their creation.

Etherna will manage videos uploading them into web3.0! Technically, there is a decentralized network, based on Swarm, that receive content data. We cannot censor anything, and any uploaded video content will be always reachable with its direct link. Anyway, we will propose a purified default index of content to preserve legal stuff.

Moreover, there is no advertisement on content. We are not trying to sell you any kind of collateral product, so there is no incentive to manipulate weights on results, and in any moment, you will be able to inspect our index database, and be sure that we are not cheating.

And last but not least, if you aren’t happy with our index... you will be able to open your totally independent instance, because code will be open source! On web application, there will be an option for switch our default index with another totally different, and out of our control. No problem, go and build your own index. This is freedom!

So yes, creators will be able to release their creativity and offer it to the world, final users will decide if a creator deserve to be paid.

And even if it sounds incredible, for the same amount of views, creator will gain more with Etherna than with YouTube.
With our service, we think, every people will be able to learn the real value of information.

## Build project locally

### 1. Install node modules

```
npm install
// or
yarn install
```

### 2. Configure SSL

For more info check out the SSL [README](/server/sslcert/README.md).

```
cd server
mkcert -key-file sslcert/key.pem -cert-file sslcert/cert.pem localhost
```

### 3. Add .env

Copy `.env.example` and rename it `.env.development`

### 4. Clone etherna services repos

We automatically run the services locally. This include:

- SSO: the authentication server
- Index: the etherna database (profiles, videos ecc.)
- Credit: used for content monetization
- Gateway Validator: used to proxy requests to the bee server while paying credit via the credit server
- Proxy Gateway: A local proxy middleware used to interchange requests & responses between the gateway validator and the bee server

To clone the projects:

```
cd /path/to/your/projects
git clone git@github.com:Etherna/etherna-credit.git
git clone git@github.com:Etherna/etherna-sso.git
git clone git@github.com:Etherna/etherna-index.git
git clone git@github.com:Etherna/etherna-credit.git
git clone git@github.com:Etherna/etherna-gateway-validator.git
```

### 5. Update the .env

Update the following keys with the paths to the .csproj file (example '/path/to/your/projects/etherna-sso/src/EthernaSSO/EthernaSSO.csproj'):

- `ETHERNA_SSO_PROJECT_PATH`
- `ETHERNA_INDEX_PROJECT_PATH`
- `ETHERNA_CREDIT_PROJECT_PATH`
- `ETHERNA_GATEWAY_VALIDATOR_PROJECT_PATH`

### 6. Setup bee server

To use the public gateway set the following keys in the .env:

- `BEE_LOCAL_INSTANCE=false`
- `DISABLE_REQUEST_VALIDATION=true`
- `GATEWAY_SWARM_PROXY_HOST="https://gateway.ethswarm.org"`

To use a local gateway, first setup bee locally. More info here (https://docs.ethswarm.org/docs/installation/quick-start).
Then set the following keys in the .env:

- `BEE_LOCAL_INSTANCE=true`
- `BEE_ENDPOINT="http://localhost:1633"`
- `GATEWAY_SWARM_PROXY_HOST="http://localhost:1633"`
- `DISABLE_REQUEST_VALIDATION=false`

### 7. Run the project

```
// to run the web app
npm run start
// or
yarn start

// to run the gateway proxy (no etherna services)
npm run start:proxy
// or
yarn start:proxy

// to run all the services (recommended)
npm run start:services
// or
yarn start:services
```
