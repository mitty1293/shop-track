import { apiClient } from "../utils";
import { KnownBlock } from "@slack/types";
import { View } from "@slack/types";

export const viewHomeCategory = async (): Promise<View> => {
    const response = await apiClient.get('/categories/');
    const categories = response.data;

    const blocks: KnownBlock[] = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'Manage Categories 🗂️',
                emoji: true
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'List of your categories:'
            }
        },
        { type: 'divider' }
    ];

    categories.forEach((category: { id: number; name: string }) => {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*${category.id}:* ${category.name}`
            },
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Edit',
                    emoji: true
                },
                value: category.id.toString(),
                action_id: `actionId-edit-category`
            }
        });
    });

    blocks.push(
        { type: 'divider' },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: '➕ Add New Category'
                    },
                    action_id: 'actionId-add-new-category',
                    style: 'primary'
                }
            ]
        }
    );

    const view: View = {
        type: 'home',
        callback_id: 'manage_categories_view',
        blocks
    };
    return view;
}