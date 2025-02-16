#!/bin/sh

echo "Waiting for MongoDB to start..."
while ! nc -z mongodb 27017; do
  sleep 0.1
done
echo "MongoDB started"

echo "Creating founder..."
npm run create:founder
echo "Founder Created..."

if [ "$NODE_ENV" = "production" ]; then
  echo "Running in production mode..."
  npm run start:prod
else
  echo "Running in development mode..."
  npm run start:dev
fi