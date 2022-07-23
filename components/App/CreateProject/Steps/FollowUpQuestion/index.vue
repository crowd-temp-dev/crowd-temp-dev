<script lang="ts">
import { VNode } from 'vue'
import { computed, defineComponent, h, ref } from '@vue/composition-api'
import QuestionComponent from './Question/index.vue'
import { QuestionModelValue } from './Question/type'
import SmoothDrag from '~/components/Base/SmoothDrag/index.vue'
import { freshQuestion, sleep, uid, getAlphabets, uuidv4 } from '~/utils'
import { LikeNumber, RenderFunction } from '~/types'

export default defineComponent({
  name: 'AppProjectStepsFollowUpQuestion',
  components: { SmoothDrag },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    hideTitle: Boolean,
    title: {
      type: String,
      default: 'Follow-up questions',
    },
    rootNumber: {
      type: Number,
      required: true,
    },
    modelValue: {
      type: Array as () => QuestionModelValue[],
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    minLength: {
      type: [String, Number] as unknown as () => LikeNumber,
      default: 1,
    },
    idAndError: {
      type: Function,
      required: true,
    },
    hasTask: Boolean,
  },
  setup(_props, { emit }) {
    const id = ref(uid())

    const props = computed(() => _props)

    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: QuestionModelValue[]) {
        emit('update:modelValue', val)
      },
    })

    const questionAdded = ref(false)

    const addQuestion = async () => {
      modelSync.value = [
        ...modelSync.value,
        freshQuestion() as unknown as QuestionModelValue,
      ]

      await sleep()

      questionAdded.value = true

      requestAnimationFrame(() => {
        const newInput = document.querySelector(
          `#${id.value}-${modelSync.value.length - 1}-title`
        ) as HTMLInputElement

        if (newInput) {
          newInput.focus()

          newInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
    }

    const duplicate = async (index: number) => {
      modelSync.value = [
        ...modelSync.value.slice(0, index),
        {
          ...modelSync.value[index],
          id: uuidv4(),
        },
        ...modelSync.value.slice(index),
      ] as QuestionModelValue[]

      await sleep()

      questionAdded.value = true

      requestAnimationFrame(() => {
        const newInput = document.querySelector(
          `#${id.value}-${index + 1}-title`
        ) as HTMLInputElement

        if (newInput) {
          newInput.focus()

          newInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
    }

    const removeQuestion = (index: number) => {
      modelSync.value = modelSync.value.filter((_, i) => i !== index)
    }

    return () => {
      const div: RenderFunction = (d, c) => h('div', d, c)
      const PHorizontalDivider: RenderFunction = (d, c) =>
        h('PHorizontalDivider', d, c)
      const p: RenderFunction = (d, c) => h('p', d, c)
      const Button: RenderFunction = (d, c) => h('Button', d, c)
      const SmoothDrag: RenderFunction = (d, c) => h('SmoothDrag', d, c)
      const Question: RenderFunction = (d, c) => h(QuestionComponent, d, c)
      const PIcon: RenderFunction = (d, c) => h('PIcon', d, c)
      const h3: RenderFunction = (d, c) => h('h3', d, c)
      const TextField: RenderFunction = (d, c) => h('TextField', d, c)
      let TaskWrapper: (vnodes: VNode[]) => VNode

      let verticalDivide: string
      let horizontalDivide: string

      if (props.value.hasTask) {
        verticalDivide =
          'fill-before before:!w-1 before:!left-10 before:bg-border-disabled relative'

        horizontalDivide =
          'fill-after after:!h-1 after:!w-20 after:!left-10 after:bg-border-disabled'

        TaskWrapper = (vnodes) => {
          return div({}, [
            h3(
              {
                staticClass: 'font-semibold text-heading mb-20',
              },
              ['Tasks']
            ),

            div({}, [
              TextField({
                attrs: {
                  label: `Task ${1}`,
                  placeholder:
                    'What task would you like people to complete on this prototype?',
                  required: true,
                },
              }),
            ]),

            vnodes,

            div(
              {
                staticClass: 'mt-20 flex justify-end',
              },
              [
                Button({
                  props: {
                    label: 'Add new task',
                    primary: true,
                  },
                }),
              ]
            ),
          ])
        }
      }

      const QuestionBlock = () => {
        const BottomDivider = PHorizontalDivider({
          staticClass: 'mt-32',
        })

        return [
          div(null, [
            props.value.hasTask
              ? null
              : PHorizontalDivider({
                  staticClass: 'w-[88%] mb-20',
                  class: { 'mt-20': !props.value.hideTitle },
                }),

            !props.value.hideTitle
              ? h(
                  props.value.hasTask ? 'h4' : 'h3',
                  {
                    staticClass: 'text-[16px] leading-[20px] pb-20',
                    class: {
                      'font-semibold': !props.value.hasTask,
                      [`font-medium pl-42 pt-20 ${verticalDivide}`]:
                        props.value.hasTask,
                    },
                  },
                  props.value.title
                )
              : null,

            modelSync.value.length
              ? [
                  SmoothDrag({
                    props: {
                      modelValue: modelSync.value,
                      groupTag: 'ol',
                      disabled: modelSync.value.length < 2,
                      groupClass: `grid${
                        props.value.hasTask ? '' : ' gap-y-42'
                      }`,
                    },
                    on: {
                      'update:modelValue': (val: any[]) => {
                        modelSync.value = val
                      },
                    },
                    scopedSlots: {
                      default: ({ drag }) => {                        
                        return modelSync.value.map((question, index, arr) => {
                          return Question({
                            key: question.id,
                            attrs: {
                              'data-id': question.id,
                              modelValue: modelSync.value[index],
                            },
                            class: {
                              [`pl-42${index ? ' pt-42' : ''}${
                                drag
                                  ? ''
                                  : ` ${verticalDivide} ${horizontalDivide}${
                                      index >= arr.length - 1
                                        ? arr.length === 1
                                          ? ' before:!h-42 after:!top-42'
                                          : ' before:!h-84 after:!top-84'
                                        : index === 0
                                        ? ' after:!top-42'
                                        : ' after:!top-84'
                                    }`
                              }`]: props.value.hasTask,
                            },
                            props: {
                              id: `${id.value}-${index}`,
                              modelValue: modelSync.value[index],
                              questionId: props.value.questionId,
                              questionTitle: `Question ${
                                props.value.rootNumber
                              }${getAlphabets(index)}`,
                              appear: questionAdded.value,
                              disableDrag: modelSync.value.length < 2,
                              disableDelete:
                                modelSync.value.length <=
                                Number(props.value.minLength),
                              minLength: props.value.minLength,
                              idAndError: props.value.idAndError,
                            },
                            on: {
                              'update:modelValue': (
                                val: QuestionModelValue
                              ) => {
                                modelSync.value[index] = val                                
                              },
                              'on-delete': () => removeQuestion(index),
                              'on-duplicate': () => duplicate(index),
                              dragstart: (evt: DragEvent) => {
                                ;(evt.target as HTMLElement).classList.add(
                                  'before:invisible',
                                  'after:invisible'
                                )
                              },
                            },
                          })
                        })
                      },
                    },
                  }),

                  !props.value.hasTask ? BottomDivider : null,
                ]
              : p(
                  {
                    staticClass:
                      'ml-30 text-border-critical-default font-semibold grid grid-flow-col items-center justify-start',
                  },
                  [
                    PIcon({
                      attrs: { source: 'AlertMinor' },
                      staticClass: 'fill-icon mr-8',
                    }),

                    'No follow up question',
                  ]
                ),

            div(
              {
                staticClass: 'flex justify-end',
                class: {
                  'mt-20': !props.value.hasTask,
                  'mt-24': props.value.hasTask,
                },
              },
              [
                Button({
                  props: {
                    primary: !props.value.hasTask,
                    disabled: modelSync.value.length >= 50,
                    label: 'Add new question',
                  },
                  on: {
                    click: addQuestion,
                  },
                }),
              ]
            ),

            props.value.hasTask ? BottomDivider : null,
          ]),
        ]
      }

      return props.value.hasTask
        ? TaskWrapper(QuestionBlock())
        : QuestionBlock()
    }
  },
})
</script>
