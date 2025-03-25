import { apiClient } from '../utils';
import { KnownBlock } from '@slack/types';
import { View } from "@slack/types";

export const viewHomeUnit = async (): Promise<View> => {
    const response = await apiClient.get('/units/');
    const units = response.data;

    const blocks: KnownBlock[] = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'Manage Units 📏',
                emoji: true
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'List of your units:'
            }
        },
        { type: 'divider' }
    ];

    units.forEach((unit: { id: number; name: string }) => {
        blocks.push(
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${unit.id}:* ${unit.name}`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Edit',
                            emoji: true
                        },
                        value: unit.id.toString(),
                        action_id: 'actionId-edit-unit'
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: '🗑️ Delete',
                            emoji: true
                        },
                        style: 'danger',
                        value: unit.id.toString(),
                        action_id: 'actionId-delete-unit'
                    }
                ]
            }
        );
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
                        text: '➕ Add New Unit'
                    },
                    action_id: 'actionId-add-new-unit',
                    style: 'primary'
                }
            ]
        }
    );

    const view: View = {
        type: 'home',
        callback_id: 'manage_units_view',
        blocks
    };

    return view;
};
