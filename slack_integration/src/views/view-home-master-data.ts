import { KnownBlock } from '@slack/types';
import { View } from "@slack/types";

interface BuildViewHomeMasterDataOptions {
    header: string;
    introText: string;
    addButtonText: string;
    actionPrefix: string;
    callbackId: string;
}

export const buildViewHomeMasterData = (
    items: { id: number; name: string }[],
    options: BuildViewHomeMasterDataOptions
): View => {
    const blocks: KnownBlock[] = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: options.header,
                emoji: true
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: options.introText
            }
        },
        { type: 'divider' }
    ];

    items.forEach(item => {
        blocks.push(
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${item.id}:* ${item.name}`
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
                        value: item.id.toString(),
                        action_id: `actionId-edit-${options.actionPrefix}`
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: '🗑️ Delete',
                            emoji: true
                        },
                        style: 'danger',
                        value: item.id.toString(),
                        action_id: `actionId-delete-${options.actionPrefix}`
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
                        text: options.addButtonText
                    },
                    action_id: `actionId-add-new-${options.actionPrefix}`,
                    style: 'primary'
                }
            ]
        }
    );

    const view: View = {
        type: 'home',
        callback_id: options.callbackId,
        blocks
    };
    return view;
};
