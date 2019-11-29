#!/bin/bash

# The input in the text field given by the user is stored
# into a file named input according to the config.yaml.
# Just echo the input given by the user.
#capture cat input


# Any following parameters: file path(s) to the student's input
params=()
for filepath in "$@"
do
    if [ ! -f "$filepath" ]; then
        # The file does not exist. Is the exercise config.yaml container/cmd field
        # correct and have the input keys been given correctly?
        >&2 echo "run.sh was called with invalid arguments. The path to the student's input file is invalid: \"$filepath\"."
        exit 1
    fi
    read param < "$filepath"
    params+=("$param")
done


capture python3 /exercise/gitlabgrader.py  "${params[@]}"

grade 
