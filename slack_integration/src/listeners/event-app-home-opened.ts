import { App } from '@slack/bolt';

const eventAppHomeOpened = (app: App): void => {
    app.event('app_home_opened', async ({ event, client }) => {
        try {
            const result = await client.views.publish({
                user_id: event.user,
                view: {
                    type: 'home',
                    callback_id: 'home_view',
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: "plain_text",
                                text: "ShopTrack Dashboard 🛒",
                                emoji: true
                            }
                        },
                        {
                            type: 'divider'
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Welcome! What would you like to do today?"
                            }
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    text: {
                                        type: 'plain_text',
                                        text: '➕ Add Record'
                                    },
                                    value: "click_me_123",
                                    action_id: "actionId-add-new-record",
                                    style: "primary"
                                },
                                {
                                    type: 'button',
                                    text: {
                                        type: 'plain_text',
                                        text: '📄 View Records'
                                    },
                                    value: "click_me_123",
                                    action_id: "actionId-view-records"
                                }
                            ]
                        },
                        {
                            type: 'divider'
                        },
                        {
                            type: "section",
                            text: {
                                type: "plain_text",
                                text: "To manage master data (categories, units, etc.), please select an item below:",
                                emoji: true
                            }
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'static_select',
                                    placeholder: {
                                        type: 'plain_text',
                                        text: 'Select item to manage',
                                    },
                                    options: [
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Manage Products'
                                            },
                                            value: 'manage_products'
                                        },
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Manage Categories'
                                            },
                                            value: 'manage_categories'
                                        },
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Manage Units'
                                            },
                                            value: 'manage_units'
                                        },
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Manage Manufacturers'
                                            },
                                            value: 'manage_manufacturers'
                                        },
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Manage Origins'
                                            },
                                            value: 'manage_origins'
                                        },
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Manage Stores'
                                            },
                                            value: 'manage_stores'
                                        },
                                    ],
                                    action_id: 'actionId-manage-master-data'
                                }
                            ]
                        }
                    ]
                }
            });
            // console.log(result);
        }
        catch (error) {
            console.error(error);
        }
    });
}

export const register = (app: App): void => {
    eventAppHomeOpened(app);
}
