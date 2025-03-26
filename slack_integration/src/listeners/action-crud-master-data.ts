import { App, BlockButtonAction, ViewSubmitAction } from '@slack/bolt';
import { apiClient } from '../utils';
import { View } from '@slack/types';

interface CrudOptions {
    masterName: string; // e.g. "manufacturer"
    apiPath: string;    // e.g. "/manufacturers/"
    viewBuilder: () => Promise<View>;
}

export const actionCrudMasterData = (
    app: App,
    { masterName, apiPath, viewBuilder }: CrudOptions
) => {
    // ➕ Add
    app.action<BlockButtonAction>(`actionId-add-new-${masterName}`, async ({ ack, body, client }) => {
        await ack();
        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: `submit_new_${masterName}`,
                title: { type: 'plain_text', text: `Add ${capitalize(masterName)}` },
                submit: { type: 'plain_text', text: 'Save' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'input',
                        block_id: `blockId-${masterName}-name`,
                        element: {
                            type: 'plain_text_input',
                            action_id: `actionId-${masterName}-name-input`
                        },
                        label: { type: 'plain_text', text: `${capitalize(masterName)} Name` }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>(`submit_new_${masterName}`, async ({ ack, view, body, client, logger }) => {
        await ack();

        const name = view.state.values[`blockId-${masterName}-name`][`actionId-${masterName}-name-input`].value;

        try {
            await apiClient.post(apiPath, { name });
            const newView = await viewBuilder();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error(`Failed to create ${masterName}:`, error);
        }
    });

    // ✏️ Edit
    app.action<BlockButtonAction>(`actionId-edit-${masterName}`, async ({ ack, body, client, action }) => {
        await ack();
        const id = parseInt(action.value ?? '0');
        const response = await apiClient.get(`${apiPath}${id}/`);
        const data = response.data;

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: `submit_edit_${masterName}`,
                private_metadata: id.toString(),
                title: { type: 'plain_text', text: `Edit ${capitalize(masterName)}` },
                submit: { type: 'plain_text', text: 'Update' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'input',
                        block_id: `blockId-${masterName}-name`,
                        element: {
                            type: 'plain_text_input',
                            action_id: `actionId-${masterName}-name-input`,
                            initial_value: data.name
                        },
                        label: { type: 'plain_text', text: `${capitalize(masterName)} Name` }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>(`submit_edit_${masterName}`, async ({ ack, view, body, client, logger }) => {
        await ack();

        const id = parseInt(view.private_metadata);
        const name = view.state.values[`blockId-${masterName}-name`][`actionId-${masterName}-name-input`].value;

        try {
            await apiClient.patch(`${apiPath}${id}/`, { name });
            const newView = await viewBuilder();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error(`Failed to update ${masterName}:`, error);
        }
    });

    // 🗑️ Delete
    app.action<BlockButtonAction>(`actionId-delete-${masterName}`, async ({ ack, client, body, action }) => {
        await ack();
        const id = parseInt(action.value ?? '0');
        const response = await apiClient.get(`${apiPath}${id}/`);
        const data = response.data;

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: `submit_delete_${masterName}`,
                private_metadata: id.toString(),
                title: { type: 'plain_text', text: `Delete ${capitalize(masterName)}` },
                submit: { type: 'plain_text', text: 'Delete' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Are you sure you want to delete *${data.name}*? This action cannot be undone.`
                        }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>(`submit_delete_${masterName}`, async ({ ack, view, body, client, logger }) => {
        await ack();
        const id = parseInt(view.private_metadata);

        try {
            await apiClient.delete(`${apiPath}${id}/`);
            const newView = await viewBuilder();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error(`Failed to delete ${masterName}:`, error);
        }
    });
};

const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);
