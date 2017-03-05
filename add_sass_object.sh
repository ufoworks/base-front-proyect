#!/bin/sh

OBJECT_NAME="$1"
OBJECTS_PATH="src/scss/objects"
MAIN_PATH="src/scss/main.scss"
FILE_EXTENSION="scss"

touch $OBJECTS_PATH/$OBJECT_NAME.$FILE_EXTENSION
echo ".$OBJECT_NAME {}" >> $OBJECTS_PATH/$OBJECT_NAME.scss
echo "@import 'objects/$OBJECT_NAME.scss';" >> $MAIN_PATH
