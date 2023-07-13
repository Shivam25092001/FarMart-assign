import admin from "firebase-admin";
import fs from 'fs';
const Credentials = JSON.parse(fs.readFileSync('./farmart-assign-firebase-adminsdk-s0o0v-8c40d35328.json'));


admin.initializeApp({
    credential: admin.credential.cert(Credentials), 
    storageBucket: "farmart-assign.appspot.com"
})


export default admin;