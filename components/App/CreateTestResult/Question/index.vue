<script lang="ts">
import { defineComponent, computed, h, ref } from '@vue/composition-api'
import _ from 'lodash'
import Choices from './Choices/index.vue'
import ShortOrLongText from './ShortOrLongText/index.vue'
import LinearScale from './LinearScale/index.vue'
import Button from '~/components/Base/Button/index.vue'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import SearchField from '~/components/Base/SearchField/index.vue'
import { ViewResultState } from '~/store/create-test/view-result'
import { getAlphabetIndex } from '~/utils'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Id from '~/components/Base/Id/index.vue'
import type { RenderFunction } from '~/types'

type Numbering = `${number}${string}`

// type QuestionComponent = 'ShortOrLongText' | 'Choices' | 'LinearScale' | ''

export default defineComponent({
  name: 'AppCreateTestResultsQuestion',
  components: {
    DialogButton,
    Button,
    SearchField,
    FadeTransition,
    Id,
    Choices,
    ShortOrLongText,
    LinearScale,
  },
  props: {
    numbering: {
      type: String as () => Numbering,
      required: true,
    },
  },
  setup(_props, { root }) {
    const starred = ref(false)

    const viewResult = computed(() => {
      return root.$store.state['create-test']['view-result'] as ViewResultState
    })

    const qNumberAndAlpha = computed(() => {
      const number = _props.numbering.replace(/[a-z]+$/, '')

      const alpha = _props.numbering.replace(/^\d/, '')

      return { number, alpha }
    })

    const question = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value

      return viewResult.value.questions[`question-${number}`].followUpQuestions[
        getAlphabetIndex(alpha)
      ]
    })

    const type = computed(() => {
      return _.capitalize(question.value.type).replace(/-/g, ' ')
    })

    const answers = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value

      return viewResult.value.answers
        .map((user) => {
          const answer =
            ((user.answers[`${number}`] || {}).questions || {})[alpha] || {}

          return answer
        })
        .filter((val) => !!val.value && !val.skip)
    })

    const isShortOrLongText = computed(() => {
      return /^(?:short|long)-text$/.test(question.value.type)
    })

    const hasChoices = computed(() => {
      return /^(?:checkbox|multi-choice)/.test(question.value.type)
    })

    const isLinearScale = computed(() => {
      return question.value.type === 'linear-scale'
    })

    const questionComponent = computed(() => {
      if (isShortOrLongText.value) {
        return ShortOrLongText
      }

      if (hasChoices.value) {
        return Choices
      }

      if (isLinearScale.value) {
        return LinearScale
      }

      return ''
    })

    return () => {
      const div: RenderFunction = (d, c) => h('div', d, c)
      const span: RenderFunction = (d, c) => h('span', d, c)
      const strong: RenderFunction = (d, c) => h('strong', d, c)
      const Button: RenderFunction = (d, c) => h('Button', d, c)

      const maxShortOrLongTextLength = 5

      const questionHeading = div(
        {
          staticClass: 'mb-8 flex items-center space-x-8',
        },
        [
          h(
            'h3',
            { staticClass: 'text-[16px] leading-[19.09px] font-semibold' },
            `Question ${_props.numbering}`
          ),

          h(
            'PBadge',
            {
              class: 'bg-surface-neutral-default',
              props: {
                size: 'small',
              },
            },
            type.value
          ),
        ]
      )

      const questionHeader = [
        h('p', { staticClass: 'mb-20' }, question.value.title),

        div(
          {
            staticClass: 'flex items-center justify-between space-x-12',
          },
          [
            h('SearchField', {
              props: {
                placeholder: 'Search responses',
                outlined: true,
              },
              staticClass: 'max-w-[270px] w-full shrink-0',
            }),

            div(
              {
                staticClass:
                  'flex items-center justify-end space-x-6 w-full flex-wrap space-y-6 xl:space-y-0',
              },
              [
                div(
                  {
                    staticClass:
                      'relative isolate shrink-0 w-full max-w-[194px]',
                  },
                  [
                    h('Select', {
                      props: {
                        options: [
                          { label: 'Participants', value: 'participants' },
                        ],
                      },
                      scopedSlots: {
                        preview: () => {
                          return div(
                            {
                              staticClass:
                                'absolute h-full w-full top-1 z-10 left-1 rounded-lg flex items-center',
                            },
                            [
                              span(
                                { staticClass: 'text-text-subdued shrink-0' },
                                'Show by'
                              ),
                              span({ staticClass: 'ml-8' }, 'Participants'),
                            ]
                          )
                        },
                      },
                    }),
                  ]
                ),

                Button(null, 'Filter results'),

                Button(
                  {
                    attrs: {
                      icon: 'StarFilledMinor',
                      primary: starred.value,
                    },
                    on: {
                      click: () => {
                        starred.value = !starred.value
                      },
                    },
                  },
                  'Starred'
                ),
              ]
            ),
          ]
        ),
      ]

      const AnswersComponent = (key: 'main' | 'dialog') =>
        h(questionComponent.value, {
          key,
          props: {
            numbering: _props.numbering,
            limit: key === 'main' ? maxShortOrLongTextLength : undefined,
            starred: starred.value,
          },
        })

      return div(null, [
        questionHeading,

        questionHeader,

        h('FadeTransition', [
          !answers.value.length
            ? div(
                {
                  staticClass:
                    'bg-action-primary-disabled px-10 h-40 rounded-[3px] w-full my-20 flex items-center',
                },
                [
                  strong(
                    {
                      staticClass: 'text-text-subdued',
                    },
                    'No response yet'
                  ),
                ]
              )
            : questionComponent.value
            ? div(null, [
                AnswersComponent('main'),

                isShortOrLongText.value &&
                answers.value.length > maxShortOrLongTextLength
                  ? div(
                      {
                        staticClass: 'flex-centered -mt-4 mb-20',
                      },
                      [
                        div(
                          {
                            staticClass: 'flex-centered space-x-8',
                          },
                          [
                            span(
                              {
                                staticClass:
                                  'text-text-subdued text-caption-sm',
                              },
                              `Showing ${maxShortOrLongTextLength} of ${answers.value.length}`
                            ),

                            h(
                              'DialogButton',
                              {
                                attrs: {
                                  plain: true,
                                },
                                props: {
                                  dialogAttrs: {
                                    transition: 'slide-y-reverse',
                                  },
                                },
                                scopedSlots: {
                                  'dialog-header': () => questionHeading,
                                  dialog: () => [
                                    div({ staticClass: 'min-w-[768px]' }, [
                                      questionHeader,

                                      AnswersComponent('dialog'),
                                    ]),
                                  ],
                                },
                              },
                              [span(null, 'Show all')]
                            ),
                          ]
                        ),
                      ]
                    )
                  : null,
              ])
            : null,
        ]),

        h('hr'),
      ])
    }
  },
})
</script>
