#!/bin/sh

# If a command fails then the deploy stops
set -e

printf "\033[0;32mDeploying updates to GitHub...\033[0m\n"

# ALL
printf "\033[0;32mAll updates to GitHub...\033[0m\n"
# Add changes to git.
git pull
git add .
# Commit changes.
msg="rebuilding site $(date)"
if [ -n "$*" ]; then
	msg="$*"
fi
git commit -m "$msg"
# Push source and build repos.
git push origin master
