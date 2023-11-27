LAST_TAG=v0.0.3
NEW_TAG=

URI=registry.gitlab.com
USER=nullxx
PROJECT=codeshare

function get_next_version() {
    # get the last version number
    LAST_VERSION=$(echo $LAST_TAG | cut -d 'v' -f 2)
    # split the version number into an array
    IFS='.' read -ra VERSION_PARTS <<< "$LAST_VERSION"
    # increment the patch version
    VERSION_PARTS[2]=$((VERSION_PARTS[2]+1))
    # join the version parts back together
    NEXT_VERSION=$(IFS=. ; echo "${VERSION_PARTS[*]}")
    # create the next tag
    NEXT_TAG=v$NEXT_VERSION
}

function update_version() {
    # update the version in this file
    sed "s/$LAST_TAG/$NEXT_TAG/g" $0 > $0.tmp
    # replace this file with the updated version
    mv $0.tmp $0
}

function build() {
    # build the docker image
    docker build -t $URI/$USER/$PROJECT:$LAST_TAG .
}

function push() {
    # push the docker image
    docker push $URI/$USER/$PROJECT:$LAST_TAG
}

build || exit 1
push || exit 1
get_next_version
update_version

echo "Pushed $LAST_TAG"
echo "Next tag is $NEXT_TAG"