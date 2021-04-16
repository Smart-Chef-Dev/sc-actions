set -e

mongo <<EOF
use admin
db = db.getSiblingDB('$MONGO_DB');
db.createUser({
  user: '$MONGO_USERNAME',
  pwd: '$MONGO_PASSWORD',
  roles: [
    {
      role: 'dbOwner',
      db: '$MONGO_DB',
    },
  ],
});
EOF
