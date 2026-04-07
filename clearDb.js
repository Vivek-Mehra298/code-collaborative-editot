const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

async function clearCollections() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('No MONGO_URI found in server/.env');
    process.exit(1);
  }

  // If the user literally left <password> brackets, we might need to remove them if it fails, but usually the MongoDB driver handles the string directly 
  // Wait, if they put <dbCodeCollaboration>, we should replace `<...>` if it's the literal password. But let's just try the raw URI first.
  let finalUri = uri;
  // If the URI contains unescaped < or > it might throw an error or it might be the literal password. 
  // We'll just pass it to mongoose.

  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(finalUri);
    console.log('Connected to MongoDB Atlas.');

    const collections = await mongoose.connection.db.collections();
    
    if (collections.length === 0) {
      console.log('No collections found in the database. It is already empty.');
    } else {
      for (let collection of collections) {
        console.log(`Dropping collection: ${collection.collectionName}`);
        await collection.drop();
        console.log(`Successfully dropped ${collection.collectionName}`);
      }
    }
    
    console.log('Finished clearing Atlas MongoDB collections.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect or drop collections:', error.message);
    
    // Check if the error is due to brackets in password
    if (error.message.includes('bad auth Authentication failed')) {
       console.log('Authentication failed. Will try removing `<` and `>` from the password URI if present.');
       const noBracketsUri = uri.replace(/<([^>]+)>/, '$1');
       if (noBracketsUri !== uri) {
           try {
             await mongoose.disconnect();
             await mongoose.connect(noBracketsUri);
             console.log('Connected after removing brackets!');
             const collections2 = await mongoose.connection.db.collections();
             for (let collection of collections2) {
               console.log(`Dropping collection: ${collection.collectionName}`);
               await collection.drop();
             }
             console.log('Finished clearing Atlas MongoDB collections.');
             process.exit(0);
           } catch (e2) {
             console.error('Failed again:', e2.message);
             process.exit(1);
           }
       }
    }

    process.exit(1);
  }
}

clearCollections();
