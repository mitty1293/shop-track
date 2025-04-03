import { App } from '@slack/bolt';

import { registerListeners } from './listeners';

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

registerListeners(app);

(async () => {
    await app.start();
    console.log('⚡️ Bolt app is running!');
})();
