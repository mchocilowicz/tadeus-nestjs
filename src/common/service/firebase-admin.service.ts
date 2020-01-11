import * as admin from 'firebase-admin';
import {app} from 'firebase-admin';
import {join} from "path";
import {Logger} from "@nestjs/common";

export class FirebaseAdminService {
    private readonly logger = new Logger(FirebaseAdminService.name);

    private readonly firebase: app.App;

    constructor() {
        const serviceAccount = require(`${join(__dirname, '..', '..', '..', 'config/tadeus-firebase-admin.json')}`);
        if (!serviceAccount) {
            this.logger.error('Configuration file for Firebase does not exists in Config directory.')
        }

        this.firebase = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.TDS_FIREBASE_DATABASE_URL
        });
    }

    getAdmin(): app.App {
        return this.firebase
    }
}
