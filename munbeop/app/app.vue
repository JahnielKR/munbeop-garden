<script setup lang="ts">
// Boot the Supabase auth subscription as early as possible so getSession()
// fires before the layout's onMounted runs. The layout still owns store
// hydration; this only populates useAuthStore so pickAdapter inside that
// hydration picks the right backend on the very first page load.
const { init } = useAuth()
onMounted(() => {
  void init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
