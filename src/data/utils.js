async function replaceDataInFirebase(db, location, newData) {
    try {
      const ref = db.ref(location);
  
      // Set the new data at the specified location
      await ref.set(newData);
  
      console.log(`Data in <${location}> is replaced with <${newData}> successfully.`);
    } catch (error) {
      console.error('Error replacing data:', error);
    }
}

async function getDataFromFirebase(db, location) {
    try {
      // Get a reference to the location in the Firebase Realtime Database
      const ref = db.ref(location);
  
      // Retrieve the data from the specified location
      const snapshot = await ref.once('value');
      const data = snapshot.val() ? snapshot.val() : [];
  
      return data; // Return the data if needed
    } catch (error) {
      console.error('Error getting data:', error);
      return null; // Return null or handle the error based on your requirements
    }
}

async function saveDataToFirebase(db, location, newData) {
    try {
      // Get a reference to the location in the Firebase Realtime Database
      const ref = db.ref(location);
  
      // Save the new data at the specified location
      await ref.set(newData);
  
    } catch (error) {
      console.error('Error saving data:', error);
    }
}
  

module.exports = {
    replaceDataInFirebase,
    saveDataToFirebase,
    getDataFromFirebase
}