<script setup lang="ts">
// Legacy route. The auth UI lives in /welcome's sidebar now. We forward
// here so old bookmarks and email magic-link callbacks still land somewhere
// sensible. Once we're confident no surface still links to /auth/sign-in
// (see spec §15) the file can be deleted.
const router = useRouter()
const route = useRoute()

onMounted(() => {
  const mode = typeof route.query.mode === 'string' ? route.query.mode : 'signin'
  router.replace({ path: '/welcome', query: { open: 'signin', mode } })
})
</script>

<template>
  <div class="redirect-stub" aria-hidden="true">Redirecting…</div>
</template>

<style scoped>
.redirect-stub {
  padding: 40px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--text-soft);
}
</style>
