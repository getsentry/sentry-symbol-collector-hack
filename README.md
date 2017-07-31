# Dev Setup

```
yarn install
npm start
npm run server
```

# Running with Docker
## Env vars
- URL = url of the running service e.g.: https://symbols.sentry.io
- S3_ACCESS_KEY_ID = s3 access key
- S3_SECRET_ACCESS_KEY = s3 secret key
- S3_BUCKET = getsentry-dsym-contribs
- SYMBOLSERVER_URL = url of the rust symbol server (must only be internal reachable)

*http://192.168.100.166:3000/lookup = Running instance of rust symbol server*

```
docker build -t sentry/symboling
docker run -p 49160:8181 -e SYMBOLSERVER_URL='http://192.168.100.166:3000/lookup' sentry/symboling
```

## License
MIT
