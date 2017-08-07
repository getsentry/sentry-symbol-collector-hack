# Dev Setup

```
yarn install
npm start
npm run server
```

# Running with Docker
## Env vars
- URL = url of the running service e.g.: https://symbols.sentry.io
- GCLOUD_BUCKET = bucket-name
- GCLOUD_PROJECT_ID = project-id
- GOOGLE_APPLICATION_CREDENTIALS_JSON = string -> content of keyfile
- SYMBOLSERVER_URL = url of the rust symbol server (must only be internal reachable)

*http://192.168.100.166:3000/lookup = Running instance of rust symbol server*

```
docker build -t sentry/symboling .
docker run -p 49160:8181 -e SYMBOLSERVER_URL='http://192.168.100.166:3000/lookup' sentry/symboling
```

## License
MIT
