npm install
cd data
npm install
rm database_linguistique.db
touch database_linguitique.db
sqlite3 database_linguistique.db < database_linguistique.sql
cd ..