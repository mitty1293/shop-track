import { KnownBlock, View } from '@slack/types';

export const viewHomeRecords = (records: any[]): View => {
    const blocks: KnownBlock[] = [
        {
            type: 'header',
            text: { type: 'plain_text', text: '📝 Shopping Records', emoji: true }
        },
        { type: 'divider' }
    ];

    if (records.length === 0) {
        blocks.push({
            type: 'section',
            text: { type: 'plain_text', text: 'No records found yet.', emoji: true }
        });
    } else {
        records.forEach((record) => {
            blocks.push(
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*${record.purchase_date}*\n${record.product.name} @ ${record.store.name} - ¥${record.price} (${record.quantity}${record.product.unit.name})`
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: { type: 'plain_text', text: '✏️ Edit' },
                            value: record.id.toString(),
                            action_id: 'actionId-edit-record'
                        },
                        {
                            type: 'button',
                            text: { type: 'plain_text', text: '🗑️ Delete' },
                            style: 'danger',
                            value: record.id.toString(),
                            action_id: 'actionId-delete-record'
                        }
                    ]
                },
            );
        });
    }

    return {
        type: 'home',
        callback_id: 'home_records_view',
        blocks
    };
};
