#!/usr/bin/env bash

__CURRENT_DIRECTORY=$(PWD)
__DIST='dist'

pwd

# clean up previous "dist" directory if it exists.
if rm -rf $__DIST; then
  echo "Successfully removed the \"$__DIST\" directory."
else
  echo "Directory doesn't exist, skipping."
fi

# compile typescript
npm run compile
