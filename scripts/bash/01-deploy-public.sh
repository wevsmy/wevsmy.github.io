#!/bin/sh

# If a command fails then the deploy stops
set -e

printf "\033[0;32mDeploying updates to GitHub...\033[0m\n"

# Build the project.
#Hugo Static Site Generator v0.73.0-428907CC windows/amd64 BuildDate: 2020-06-23T16:32:10Z
#hugo --baseUrl="https://www.weii.ink/" --enableGitInfo
npm run build

# Public
printf "\033[0;32mPublic updates to GitHub...\033[0m\n"
# Go To Public folder
cp -r ./public.git/.git ./public/

cd public

#git pull
git add .
# Commit changes.
msg="rebuilding site $(date)"
if [ -n "$*" ]; then
	msg="$*"
fi
git commit -m "$msg"
# Push source and build repos.
git push origin master
