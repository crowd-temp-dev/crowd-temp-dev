<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  computed,
  watch,
} from '@vue/composition-api'
import { Config } from './types'
import { defaultConfig, inactiveEntry, isHTML } from './utils'

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Intersection',
  props: {
    config: {
      type: Object as () => Config,
      default: () => defaultConfig,
    },
    once: Boolean,
    disabled: Boolean,
  },
  emits: ['once-intersected', 'update:entry'],

  setup(_props, { emit, slots }) {
    //   observer won't happen if component isn't mounted.
    const isMounted = ref(false)

    //   set initial state of entry to an object with inactive: true;
    // used to check if Observer has started or not;
    const entry = ref(inactiveEntry)

    // the intersection observer class;
    const observer = ref<IntersectionObserver | null>(null)

    const props = computed(() => _props)

    const instance = getCurrentInstance()

    const disconnect = () => {
      const elem = instance.vnode.context.$el as unknown as HTMLElement

      if (elem && isHTML(elem)) {
        observer.value?.unobserve(elem)
      }

      observer.value?.disconnect()

      nextTick(() => {
        observer.value = null
      })
    }

    const connect = async () => {
      if (props.value.disabled) {
        return
      }

      //  bail if this.observer is truthy, or props.disabled or not mounted; or this.$el isn't valid HTMLElement
      const elem = instance.vnode.context.$el as unknown as HTMLElement

      if (observer.value || !isMounted.value || !isHTML(elem)) {
        return
      }

      const initialOptions = {
        ...defaultConfig,
        ...props.value.config,
      }

      const options = {
        ...initialOptions,
        threshold: /string|number/i.test(typeof initialOptions.threshold)
          ? initialOptions.threshold
          : initialOptions.threshold,
      }

      await nextTick()

      observer.value = new IntersectionObserver(intersectionCallback, options)

      observer.value?.observe(elem)
    }

    const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
      for (const _entry of entries) {
        entry.value = _entry
        emit('update:entry', _entry)

        if (props.value.once) {
          if (_entry.isIntersecting) {
            disconnect()
          }
        }
      }
    }

    const observe = async () => {
      if (!isMounted.value) {
        return
      }

      entry.value = inactiveEntry
      await nextTick()

      connect()
    }

    const cleanup = () => {
      disconnect()
      entry.value = inactiveEntry
      isMounted.value = false
    }

    const onMount = () => {
      isMounted.value = true
      observe()
    }

    const payload = computed(() => {
      if (props.value.disabled) {
        return {
          intersectionRatio: 0,
          isIntersecting: true,
        }
      }

      return entry.value
    })

    watch(() => props.value.disabled, disconnect)

    onMounted(onMount)

    onBeforeUnmount(cleanup)

    return () => {
      // @ts-ignore
      return slots.default?.(payload.value)[0]
    }
  },
})
</script>
