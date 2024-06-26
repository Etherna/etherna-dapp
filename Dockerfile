# Build.
FROM node AS build

WORKDIR /app
COPY . .

ENV VITE_APP_NAME="Etherna"
ENV VITE_APP_TAGLINE="Web3.0 Video Explorer"
ENV VITE_APP_PUBLIC_URL="http://localhost:80"
ENV VITE_APP_CMS_URL="https://cms.etherna.com"
ENV VITE_APP_VERIFIED_ORIGINS="etherna.io"
ENV VITE_APP_FEEDBACK_URL="https://etherna.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/-m454we/b/23/a44af77267a987a660377e5c46e0fb64/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=1c189ede"
ENV VITE_APP_MATOMO_URL="https://analytics.etherna.io"
ENV VITE_APP_MATOMO_SITE_ID=2
ENV VITE_APP_INDEX_URL="http://index:42690"
ENV VITE_APP_GATEWAY_URL="http://gateway-interceptor:8080"
ENV VITE_APP_CREDIT_URL="http://creditSystem:31597"
ENV VITE_APP_AUTH_URL="http://ssoServer:33784"
ENV VITE_APP_API_VERSION="0.3"

RUN pnpm install
RUN pnpm build

# Run.
FROM nginx
WORKDIR /app
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
