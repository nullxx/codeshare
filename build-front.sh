#!bin/sh
set -x

export $(grep -v '^#' .env | xargs)

printenv SITE
# Build the front-end
cd front
npm install
SITE=$(printenv BASE_URL) npm run build

mkdir -p ../views/front
mv dist/*.html ../views/front
cp -R dist/* ../public/.