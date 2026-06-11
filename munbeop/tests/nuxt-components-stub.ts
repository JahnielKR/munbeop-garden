import { defineComponent, h } from 'vue'

/**
 * Vitest stand-in for Nuxt's virtual `#components` module.
 *
 * Only what app code actually imports from `#components` lives here.
 * NuxtLink renders a plain anchor carrying `to` as `href`, which is what
 * component tests assert against (vue-router isn't mounted under vitest).
 */
export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: {
    to: { type: [String, Object], default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'a',
        { ...attrs, href: typeof props.to === 'string' ? props.to : undefined },
        slots.default?.(),
      )
  },
})
