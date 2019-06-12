#!/bin/bash

# The uploaded user files are always in /submission/user
# and named identically to config.yaml regardless of the uploaded file names.
# The directory /submission/user is also the default working directory
# in the container.

# The mount directory from config.yaml is in /exercise.
# Append the required support files to test user solution.

# Add the working directory to the PYTHONPATH so that the grader
# can import the student's submission. The grader program is started
# under the path /exercise since there is no need to copy it to
# the working directory.
export PYTHONPATH=/submission/user


# Skripti ottaa argumenteikseen (opettajan määrittämät)
# MathCheckin alku- ja loppukomennot sisältävän tiedoston
# teacher-input.txt
#teacher_input=$1

# Yhdistetään opettajan tehtäväkonfiguraatio ja
# opiskelijan vastaus yhteen tiedostoon
# mc_input
cat /exercise/teacher-input.txt ratkaisu > mc_input
# Tässä "ratkaisu" on tehtävälomakkeen nimi verkkosivulla,
# ja se on määritelty tehtävän config.yaml-tiedostossa
# fields-listan alla.
#capture echo "<br><br>mc_input<br>" # debug
#capture pre cat mc_input # debug

# mc_code.txt:ssä saattaa luomistavasta riippuen olla &gt;
# kun pitäisi olla >
sed -i 's/&gt;/>/g' mc_input
sed -i 's/&lt;/</g' mc_input

#capture echo "<br><br>mc_input<br>" # debug
#capture pre cat mc_input # debug

# ajetaan MC antamalla inputiksi mc_input ja tallentamalla stdout mc_outputiin
cat mc_input | mathcheck.out > mc_output
#capture echo "<br><br>mc_output<br>" # debug
#capture pre cat mc_output # debug


# "capture" etc description in https://github.com/apluslms/grading-base

capture mathcheck.out < mc_input # in /usr/local/bin

# annetaan pisteitä sen mukaan, oliko mc tyytyväinen
# huomaa, että plussa skaalaa pisteet. jos plussassa tehtävän maksimipisteiksi on
# merkitty 50 ja tässä annetaan 1/2, opiskelija saa 25 pst. jos tässä annetaan 2/3,
# opiskelija saa 33 pst jne.


if grep -q "\!points\! 1" mc_output;
then

  echo "2/2" > /feedback/points
  echo '<br><br><div class="alert alert-success">Jipii, oikein meni! :)</div>' >> /feedback/out

elif grep -q "class=warn" mc_output;
then

  echo "1/2" > /feedback/points
  echo '<br><br><div class="alert alert-warning">Annoit turhan hankalan vastauksen! Voi vipstaakki! Voisikohan vastauksen esittää sievemmin?</div>' >> /feedback/out

else

  echo "0/2" > /feedback/points
  echo '<br><br><div class="alert alert-danger">Sait nolla pistettä. Yritä uudelleen.</div>' >> /feedback/out

fi


err-to-out
grade
