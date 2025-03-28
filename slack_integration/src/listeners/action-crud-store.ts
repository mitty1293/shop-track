import { App, BlockButtonAction, ViewSubmitAction } from '@slack/bolt';
import { apiClient } from '../utils';
import { viewHomeStore } from '../views/view-home-store';

export const actionCurdStore = (app: App): void => {
    // ➕ Add
    app.action<BlockButtonAction>('actionId-add-new-store', async ({ ack, body, client }) => {
        await ack();

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_new_store',
                title: { type: 'plain_text', text: 'Add Store' },
                submit: { type: 'plain_text', text: 'Save' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'blockId-store-name',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-store-name-input'
                        },
                        label: { type: 'plain_text', text: 'Store Name' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-store-location',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-store-location-input'
                        },
                        label: { type: 'plain_text', text: 'Location' }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_new_store', async ({ ack, view, body, client, logger }) => {
        await ack();

        try {
            const name = view.state.values['blockId-store-name']['actionId-store-name-input'].value;
            const location = view.state.values['blockId-store-location']['actionId-store-location-input'].value;

            if (!name || !location) {
                throw new Error('Store name and location are required');
            }

            await apiClient.post('/stores/', { name, location });
            const newView = await viewHomeStore();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error('Failed to create store:', error);
        }
    });

    // ✏️ Edit
    app.action<BlockButtonAction>('actionId-edit-store', async ({ ack, body, client, action }) => {
        await ack();

        const id = parseInt(action.value ?? '0');
        const response = await apiClient.get(`/stores/${id}/`);
        const store = response.data;

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_edit_store',
                private_metadata: id.toString(),
                title: { type: 'plain_text', text: 'Edit Store' },
                submit: { type: 'plain_text', text: 'Update' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'blockId-store-name',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-store-name-input',
                            initial_value: store.name
                        },
                        label: { type: 'plain_text', text: 'Store Name' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-store-location',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-store-location-input',
                            initial_value: store.location
                        },
                        label: { type: 'plain_text', text: 'Location' }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_edit_store', async ({ ack, view, body, client, logger }) => {
        await ack();

        try {
            const id = parseInt(view.private_metadata);
            const name = view.state.values['blockId-store-name']['actionId-store-name-input'].value;
            const location = view.state.values['blockId-store-location']['actionId-store-location-input'].value;

            if (!name || !location) {
                throw new Error('Store name and location are required');
            }

            await apiClient.patch(`/stores/${id}/`, { name, location });
            const newView = await viewHomeStore();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error('Failed to update store:', error);
        }
    });

    // 🗑️ Delete
    app.action<BlockButtonAction>('actionId-delete-store', async ({ ack, client, body, action }) => {
        await ack();

        const id = parseInt(action.value ?? '0');
        const response = await apiClient.get(`/stores/${id}/`);
        const store = response.data;

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_delete_store',
                private_metadata: id.toString(),
                title: { type: 'plain_text', text: 'Delete Store' },
                submit: { type: 'plain_text', text: 'Delete' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Are you sure you want to delete *${store.name}*?\nThis action cannot be undone.`
                        }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_delete_store', async ({ ack, view, body, client, logger }) => {
        await ack();

        try {
            const id = parseInt(view.private_metadata);
            await apiClient.delete(`/stores/${id}/`);
            const newView = await viewHomeStore();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error('Failed to delete store:', error);
        }
    });
};

