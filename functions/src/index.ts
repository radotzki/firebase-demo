import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

export const checkNumber = functions.database
  .ref("/messages/{messageId}")
  .onCreate(async snapshot => {
    const text = snapshot.val().text;
    const name = snapshot.val().name;
    const photoUrl = snapshot.val().photoUrl;
    const random = await getRandom();
    await increaseTries();

    if (random == text) {
      await setWinner(text, name, photoUrl);
    }

    return 0;
  });

function increaseTries() {
  return admin
    .database()
    .ref(`/tries`)
    .transaction(tries => {
      return (tries || 0) + 1;
    });
}

function setWinner(text: string, name: string, photoUrl: string) {
  return admin
    .database()
    .ref(`/winner`)
    .set({ text, name, photoUrl });
}

async function getRandom() {
  const response = await admin
    .database()
    .ref("/random")
    .once("value");

  return response.val();
}
