import DefaultTheme from 'vitepress/theme'
import { useRoute, type Theme } from 'vitepress'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import './style.css'

export default {
  extends: DefaultTheme,

  setup() {
    const route = useRoute()
    let ready = false
    let revision = 0
    let motion: Animation | null = null
    let preference: MediaQueryList | null = null

    function stop() {
      motion?.cancel()
      motion = null
    }

    async function enterPage() {
      const current = ++revision
      stop()
      if (!ready || preference?.matches) return

      await nextTick()
      if (current !== revision || !ready || preference?.matches) return

      const page = document.querySelector<HTMLElement>('.VPDoc')
      if (!page || typeof page.animate !== 'function') return

      motion = page.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 260, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
      )
    }

    function preferenceChanged() {
      if (preference?.matches) {
        revision++
        stop()
      }
    }

    onMounted(() => {
      ready = true
      preference = window.matchMedia('(prefers-reduced-motion: reduce)')
      preference.addEventListener('change', preferenceChanged)
      void enterPage()
    })

    watch(() => route.path, () => {
      void enterPage()
    }, { flush: 'post' })

    onUnmounted(() => {
      ready = false
      revision++
      stop()
      preference?.removeEventListener('change', preferenceChanged)
    })
  },
} satisfies Theme
