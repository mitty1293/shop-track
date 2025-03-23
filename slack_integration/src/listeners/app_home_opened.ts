import { App } from '@slack/bolt';

const appHomeOpened = (app: App): void => {
    app.event('app_home_opened', async ({ event, client }) => {
        try {
            // Call views.publish with the built-in client
            const result = await client.views.publish({
                // Use the user ID associated with the event
                user_id: event.user,
                view: {
                    type: 'home',
                    callback_id: 'home_view',
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: '*Welcome to your _App\'s Home_* :tada:'
                            }
                        },
                        {
                            type: 'divider'
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: 'This is a home tab. You can use this as a dashboard to access your app\'s features.'
                            }
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    text: {
                                        type: 'plain_text',
                                        text: 'Click me!'
                                    }
                                }
                            ]
                        }
                    ]
                }
            });
            console.log(result);
        }
        catch (error) {
            console.error(error);
        }
    });
}

export const register = (app: App): void => {
    appHomeOpened(app);
}
