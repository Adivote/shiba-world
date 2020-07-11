import { firestore } from 'firebase/app'

// intended for simple, one-time FIRE AND FORGET delete of a record eg. notifications
// do NOT use for anything else - use a React hook with nice UI
export function quickDeleteRecord(collectionName, id) {
  return firestore()
    .collection(collectionName)
    .doc(id)
    .delete()
}

export function doesDocumentExist(collectionName, id) {
  return firestore()
    .collection(collectionName)
    .doc(id)
    .exists()
}
