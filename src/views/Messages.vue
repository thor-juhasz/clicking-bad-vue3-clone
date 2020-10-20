<template>
    <div class="messages">
        <MessageComponent v-for="item in allMessages" v-bind="item" :key="item.id"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Message as MessageType } from "@/types/messages"
import MessageComponent from "@/components/Message.vue"
import { messagesStore } from '@/store/messages'

export default defineComponent({
    components: { MessageComponent },
    computed: {
        allMessages: function(): Array<MessageType> {
            const items = messagesStore.getState().items
            if (items.length <= 20) {
                return items.slice().reverse()
            }

            return items.slice(items.length - 20).reverse()
        },
    },
})
</script>
