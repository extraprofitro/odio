/** @odoo-module **/

import { registerModel } from '@mail/model/model_core';
import { attr, one } from '@mail/model/model_field';
import { clear } from '@mail/model/model_field_command';

registerModel({
    name: 'AutocompleteInputView',
    identifyingFields: [[
        'chatWindowOwnerAsNewMessage',
        'discussSidebarCategoryOwnerAsAddingItem',
        'discussViewOwnerAsMobileAddItemHeader',
        'messagingMenuOwnerAsMobileNewMessageInput',
    ]],
    recordMethods: {
        /**
         * @param {FocusEvent} ev
         */
        onFocusin(ev) {
            if (this.chatWindowOwnerAsNewMessage) {
                this.chatWindowOwnerAsNewMessage.onFocusInNewMessageFormInput(ev);
                return;
            }
        },
         /**
         * @private
         * @returns {boolean|FieldCommand}
         */
        _computeIsFocusOnMount() {
            if (this.discussViewOwnerAsMobileAddItemHeader) {
                return true;
            }
            if (this.discussSidebarCategoryOwnerAsAddingItem) {
                return true;
            }
            if (this.messagingMenuOwnerAsMobileNewMessageInput) {
                return true;
            }
            return clear();
        },
        /**
         * @private
         * @returns {boolean|FieldCommand}
         */
        _computeIsHtml() {
            if (this.discussViewOwnerAsMobileAddItemHeader) {
                return this.discussViewOwnerAsMobileAddItemHeader.discuss.isAddingChannel;
            }
            if (this.discussSidebarCategoryOwnerAsAddingItem) {
                return this.discussSidebarCategoryOwnerAsAddingItem === this.messaging.discuss.categoryChannel;
            }
            return clear();
        },
        /**
         * @private
         * @returns {string|FieldCommand}
         */
        _computeCustomClass() {
            if (this.discussSidebarCategoryOwnerAsAddingItem) {
                if (this.discussSidebarCategoryOwnerAsAddingItem === this.messaging.discuss.categoryChannel) {
                    return 'o_DiscussSidebarCategory_newChannelAutocompleteSuggestions';
                }
            }
            if (this.messagingMenuOwnerAsMobileNewMessageInput) {
                return this.messagingMenuOwnerAsMobileNewMessageInput.viewId + '_mobileNewMessageInputAutocomplete';
            }
            return clear();
        },
        /**
         * @private
         * @returns {string}
         */
        _computePlaceholder() {
            if (this.chatWindowOwnerAsNewMessage) {
                return this.chatWindowOwnerAsNewMessage.newMessageFormInputPlaceholder;
            }
            if (this.discussViewOwnerAsMobileAddItemHeader) {
                if (this.discussViewOwnerAsMobileAddItemHeader.discuss.isAddingChannel) {
                    return this.discussViewOwnerAsMobileAddItemHeader.discuss.addChannelInputPlaceholder;
                } else {
                    return this.discussViewOwnerAsMobileAddItemHeader.discuss.addChatInputPlaceholder;
                }
            }
            if (this.discussSidebarCategoryOwnerAsAddingItem) {
                return this.discussSidebarCategoryOwnerAsAddingItem.newItemPlaceholderText;
            }
            if (this.messagingMenuOwnerAsMobileNewMessageInput) {
                return this.messagingMenuOwnerAsMobileNewMessageInput.mobileNewMessageInputPlaceholder;
            }
            return clear();
        },
    },
    fields: {
        chatWindowOwnerAsNewMessage: one('ChatWindow', {
            inverse: 'newMessageAutocompleteInputView',
            readonly: true,
        }),
        customClass: attr({
            compute: '_computeCustomClass',
            default: '',
        }),
        discussSidebarCategoryOwnerAsAddingItem: one('DiscussSidebarCategory', {
            inverse: 'addingItemAutocompleteInputView',
            readonly: true,
        }),
        discussViewOwnerAsMobileAddItemHeader: one('DiscussView', {
            inverse: 'mobileAddItemHeaderAutocompleteInputView',
            readonly: true,
        }),
        isFocusOnMount: attr({
            compute: '_computeIsFocusOnMount',
            default: false,
        }),
        isHtml: attr({
            compute: '_computeIsHtml',
            default: false,
        }),
        messagingMenuOwnerAsMobileNewMessageInput: one('MessagingMenu', {
            inverse: 'mobileNewMessageAutocompleteInputView',
            readonly: true,
        }),
        placeholder: attr({
            compute: '_computePlaceholder',
        }),
    },
});
