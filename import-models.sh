#!/usr/bin/env bash

# Usage: ./import-models.sh

set -e
# set -x

echo "* Checkout out the relevant revision of the firefox-translations-models repo"
MODELS_UPDATED=0
MODELS_GIT_REV="a8158d24c78fc9b8bea6b3e94c99ee370210bd84" # v0.2.5
if [ ! -d "firefox-translations-models" ]; then
  git clone --branch main --single-branch https://github.com/mozilla/firefox-translations-models
  MODELS_UPDATED=1
fi
cd firefox-translations-models
if [ $(git rev-parse HEAD) != "$MODELS_GIT_REV" ]; then
  git fetch
  git checkout $MODELS_GIT_REV
  MODELS_UPDATED=1
fi
cd -
if [ "$MODELS_UPDATED" == "1" ]; then
  echo "* Importing model files from firefox-translations-models repo"
  mkdir -p test/locally-hosted-files/models
  mv test/locally-hosted-files/models/dummy tmp
  rm -rf test/locally-hosted-files/models/*
  cp -rf firefox-translations-models/models/*/* test/locally-hosted-files/models
  ls -l test/locally-hosted-files/models/*
  mv tmp test/locally-hosted-files/models/dummy
fi

echo "* Done"

exit 0
