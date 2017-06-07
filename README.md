# React

```
yarn install
npm start
```

# Running with Docker

# http://192.168.100.166:3000/lookup = Running instance of rust symbol server
docker build -t sentry/symboling
docker run -p 49160:8181 -e SYMBOLSERVER_URL='http://192.168.100.166:3000/lookup' sentry/symboling

## License
MIT
