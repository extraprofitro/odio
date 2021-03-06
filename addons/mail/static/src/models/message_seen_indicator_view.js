/** @odoo-module **/

import { registerModel } from '@mail/model/model_core';
import { one } from '@mail/model/model_field';
import { clear, insertAndReplace, replace } from '@mail/model/model_field_command';

registerModel({
    name: 'MessageSeenIndicatorView',
    identifyingFields: ['messageViewOwner'],
    recordMethods: {
        /**
         * @private
         * @returns {FieldCommand}
         */
        _computeMessageSeenIndicator() {
            if (this.messageViewOwner.threadView && this.messageViewOwner.threadView.thread) {
                return insertAndReplace({
                    message: replace(this.messageViewOwner.message),
                    thread: replace(this.messageViewOwner.threadView.thread),
                });
            }
            return clear();
        },
    },
    fields: {
        messageViewOwner: one('MessageView', {
            inverse: 'messageSeenIndicatorView',
            readonly: true,
            required: true,
        }),
        messageSeenIndicator: one('MessageSeenIndicator', {
            compute: '_computeMessageSeenIndicator',
        }),
    },
});
