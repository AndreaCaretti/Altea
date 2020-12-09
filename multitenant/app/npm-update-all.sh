for i in $(find -maxdepth 1 -type d| grep cloudcoldchain); do echo "Folder $i"; cd $i; npm install; cd ..;done
cd com.alteaup.solutions.accessrights
npm install
cd ..