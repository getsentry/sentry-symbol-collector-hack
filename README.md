# React

```
yarn install
npm start
```

# Running with Docker
## Env vars
- URL = url of the running service
- S3_ACCESS_KEY_ID = s3 access key
- S3_SECRET_ACCESS_KEY = s3 secret key
- S3_BUCKET = getsentry-dsym-contribs

# http://192.168.100.166:3000/lookup = Running instance of rust symbol server
docker build -t sentry/symboling
docker run -p 49160:8181 -e SYMBOLSERVER_URL='http://192.168.100.166:3000/lookup' sentry/symboling

## License
MIT
