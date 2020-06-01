export NAME=$(cat package.json | jq -r ".name")
export VERSION=$(cat package.json | jq -r ".version")
export IMAGE=chusj/$NAME:$VERSION

docker build -t $IMAGE -f Dockerfile-static --target server .