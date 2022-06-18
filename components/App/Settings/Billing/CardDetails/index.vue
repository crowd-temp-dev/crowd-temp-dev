<template>
    <section class="bg-surface-default shadow-2 p-20 rounded-lg w-full">
        <div class="flex items-center justify-between mb-20">
            <h3 class="text-heading font-semibold">
                Card Details
            </h3>

            <Button @click="showDetails = !showDetails">
                Add payment method
            </Button>
        </div>

        <FadeTransition>
            <p v-if="!showDetails"
                class="h-40 px-10 rounded-[3px] bg-action-primary-disabled border border-divider font-semibold text-text-subdued flex items-center">
                No card added yet
            </p>

            <ul v-else class="grid gap-y-20">
                <li v-for="(card, i) in cards" :key="card.number">
                    <button type="button"
                        class="h-80 rounded-lg border-2 p-20 flex items-center cursor-pointer fill-before isolate relative before:bg-current before:-z-1 before:opacity-0 hover:before:opacity-[0.025] transform-gpu transition-[transform,border-color] active:scale-[0.995] w-full"
                        :class="{
                            'bg-[rgba(38,125,255,0.05)] border-focused-default': i === activeCard,
                            'border-action-primary-disabled': i !== activeCard
                        }"
                        @click="activeCard = i"
                        >
                        <div
                            class="bg-surface-default rounded-full h-40 w-40 border border-action-primary-disabled flex-centered mr-20 shrink-0">
                            <PImage source="/png/app/Settings/Billing/cards/visa.png" :width="31" alt="Visa icon"
                                class="min-w-31" />
                        </div>

                        <div class="flex-grow mr-20 text-left">
                            <p>
                                <strong>
                                    {{ card.number }}
                                </strong>
                            </p>

                            <p>
                                Visa card{{ card.default ? ' - Selected as default' : '' }}
                            </p>
                        </div>

                        <p class="mr-20">
                            Expiry {{ card.expires }}
                        </p>

                        <Button plain>
                            Edit
                        </Button>

                        <div class="ml-64">
                            <div class="w-18 h-18 rounded-full border-2 flex-centered before:block before:rounded-full before:w-10 before:h-10 before:bg-interactive-default before:transform-gpu before:transition-transform transition-[border-color]"
                                :class="{ 'before:scale-0 border-border-default': activeCard !== i, 'border-interactive-default': activeCard === i }" />
                        </div>
                    </button>
                </li>
            </ul>
        </FadeTransition>
    </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";
import Button from '@/components/Base/Button/index.vue'
import FadeTransition from "~/components/Base/FadeTransition/index.vue";

interface Card {
    number: string
    default?: boolean
    expires: string
    type?: 'visa'
}

export default defineComponent({
    name: 'AppSettingsBillingsCardDetails',
    components: { Button, FadeTransition },

    setup() {
        const showDetails = ref(true)

        const activeCard = ref(0)

        const cards: Card[] = [
            {
                number: '41** **** **** **67 8920',
                expires: '06/2024',
                default: true,
                type: 'visa'
            },
            {
                number: '41** **** **** **48 9325',
                expires: '05/2023',
                type: 'visa'
            }
        ]

        return { showDetails, activeCard, cards }
    }
})
</script>