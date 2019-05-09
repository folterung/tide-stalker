#!/usr/bin/env bash

pwd

# clean up previous "dist" directory if it exists.
if rm -rf dist; then
  echo "Successfully removed the \"dist\" directory."
else
  echo "Directory doesn't exist, skipping."
fi

# compile typescript
npm run compile
