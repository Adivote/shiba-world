const functions = require('firebase-functions')
const admin = require('firebase-admin')
const algoliasearch = require('algoliasearch')
const diff = require('deep-diff')

const ALGOLIA_APP_ID = functions.config().algolia.app_id
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_api_key

const ALGOLIA_INDEX_NAME = 'prod_ASSETS'
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)

admin.initializeApp()
const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

const CollectionNames = {
  Users: 'users',
  Assets: 'assets',
  Comments: 'comments',
  Notices: 'notices',
  History: 'history',
  Endorsements: 'endorsements',
  Profiles: 'profiles',
  Mail: 'mail',
}

const ProfileFieldNames = {
  vrchatUsername: 'vrchatUsername',
  discordUsername: 'discordUsername',
  twitterUsername: 'twitterUsername',
  telegramUsername: 'telegramUsername',
  youtubeChannelId: 'youtubeChannelId',
  twitchUsername: 'twitchUsername',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  bio: 'bio',
  notifyOnUnapprovedAssets: 'notifyOnUnapprovedAssets',
  notificationEmail: 'notificationEmail',
}

const UserFieldNames = {
  username: 'username',
  isEditor: 'isEditor',
  isAdmin: 'isAdmin',
  enabledAdultContent: 'enabledAdultContent',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
}

function convertDocToAlgoliaRecord(docId, doc) {
  return {
    objectID: docId,
    title: doc.title,
    description: doc.description,
    thumbnailUrl: doc.thumbnailUrl,
    isAdult: doc.isAdult,
    tags: doc.tags,
  }
}

function insertDocIntoIndex(doc, docData) {
  return client
    .initIndex(ALGOLIA_INDEX_NAME)
    .saveObject(convertDocToAlgoliaRecord(doc.id, docData))
}

function deleteDocFromIndex(doc) {
  return client.initIndex(ALGOLIA_INDEX_NAME).deleteObject(doc.id)
}

function isNotApproved(docData) {
  return docData.isApproved === false
}

function isDeleted(docData) {
  return docData.isDeleted === true
}

function isPrivate(docData) {
  return docData.isPrivate === true
}

async function storeInHistory(message, parentRef, data, user) {
  return db.collection('history').add({
    message,
    parent: parentRef,
    data,
    createdAt: new Date(),
    createdBy: user,
  })
}

function recursiveMap({ kind, path, lhs, rhs, item, index }) {
  const newItem = {
    kind,
    path,
    lhs,
    rhs,
    index,
  }

  // Firestore does not let us store as undefined so check for it
  if (item) {
    newItem.item = recursiveMap(item)
  }

  return newItem
}

function getDifferenceInObjects(objectA, objectB) {
  // Firestore does not support custom prototypes so just map into a basic thing
  return diff(objectA, objectB).map(recursiveMap)
}

function replaceReferenceWithString(ref) {
  return ref.path
}

function secondsToDate(seconds) {
  return new Date(seconds * 1000)
}

function replaceReferencesWithString(object) {
  const newObject = {}

  for (const key in object) {
    const val = object[key]

    if (typeof val === 'object' && val.id) {
      newObject[key] = replaceReferenceWithString(val)
    } else if (val.hasOwnProperty('_seconds')) {
      const newVal = secondsToDate(val._seconds)
      newObject[key] = newVal.toString()
    } else {
      newObject[key] = val
    }
  }

  return newObject
}

async function notifyUsersOfUnapprovedAsset(assetId, assetData) {
  const { docs: editorUsers } = await db
    .collection(CollectionNames.Users)
    .where(UserFieldNames.isEditor, '==', true)
    .get()

  let recipientEmails = []

  /* eslint-disable no-await-in-loop */
  for (user of editorUsers) {
    // Awaiting like this will cause a bottleneck with a lot of results as it does it in sequence
    const profileDoc = await db
      .collection(CollectionNames.Profiles)
      .doc(user.id)
      .get()
    const profileData = profileDoc.data()

    if (profileData[ProfileFieldNames.notificationEmail]) {
      recipientEmails.push(profileData[ProfileFieldNames.notificationEmail])
      continue
    }

    if (profileData[ProfileFieldNames.notifyOnUnapprovedAssets]) {
      const authUser = await admin.auth().getUser(user.id)
      recipientEmails.push(authUser.email)
    }
  }

  if (!recipientEmails.length) {
    return Promise.resolve()
  }

  const emailText = `Hi. The asset ${assetData.title} with ID ${assetId} has just been created and is waiting for approval :)`

  return db.collection(CollectionNames.Mail).add({
    to: recipientEmails,
    message: {
      subject: 'New unapproved asset at VRCArena',
      text: emailText,
      html: emailText,
    },
  })
}

exports.onAssetCreated = functions.firestore
  .document('assets/{assetId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(
      `Created asset`,
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      docData.createdBy
    )

    if (isNotApproved(docData)) {
      await notifyUsersOfUnapprovedAsset(doc.id, docData)

      return Promise.resolve()
    }

    if (isPrivate(docData)) {
      return Promise.resolve()
    }

    return insertDocIntoIndex(doc, docData)
  })

exports.onAssetUpdated = functions.firestore
  .document('assets/{assetId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const beforeDocData = beforeDoc.data()
    const docData = doc.data()

    await storeInHistory(
      `Edited asset`,
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDocData),
          replaceReferencesWithString(docData)
        ),
      },
      docData.lastModifiedBy
    )

    if (isNotApproved(docData)) {
      return Promise.resolve()
    }

    if (beforeDocData.isPrivate !== true && docData.isPrivate === true) {
      return deleteDocFromIndex(doc)
    }

    if (beforeDocData.isDeleted !== true && docData.isDeleted === true) {
      return deleteDocFromIndex(doc)
    }

    if (isPrivate(docData)) {
      return Promise.resolve()
    }

    if (isDeleted(docData)) {
      return Promise.resolve()
    }

    return insertDocIntoIndex(doc, docData)
  })

exports.onCommentCreated = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    return storeInHistory(
      `Created comment`,
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      docData.createdBy
    )
  })

exports.onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const docData = doc.data()

    return storeInHistory(
      `Edited user`,
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDoc.data()),
          replaceReferencesWithString(docData)
        ),
      },
      docData.lastModifiedBy
    )
  })

exports.onUserSignup = functions.auth.user().onCreate(async (user) => {
  const { uid } = user

  const userRecord = db.collection('users').doc(uid)

  await userRecord.set({
    isAdmin: false,
    isEditor: false,
    username: '',
  })

  const profileRecord = db.collection('profiles').doc(uid)

  await profileRecord.set({
    bio: '',
  })

  return storeInHistory(`User signup`, userRecord)
})

exports.onProfileUpdated = functions.firestore
  .document('profiles/{userId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const docData = doc.data()

    return storeInHistory(
      `Edited profile`,
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDoc.data()),
          replaceReferencesWithString(docData)
        ),
      },
      docData.lastModifiedBy
    )
  })
