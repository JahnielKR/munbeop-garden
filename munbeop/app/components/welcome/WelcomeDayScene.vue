<script setup lang="ts">
// Day scene: in-house animated landing-hero video, looped silently as the
// always-on backdrop. Replaces the previous static garden-day.png still.
// The PNG stays in /welcome/day/ as the <video> poster so there's a clean
// fallback frame while the webm is buffering and for any browser without
// webm support.
//
// Autoplay constraints: muted + playsinline are required for Safari/iOS to
// allow unattended start; preload="auto" gets the first frame ready by the
// time /welcome paints. The night scene is still the static JPG until the
// matching night webm is provided.
</script>

<template>
  <div class="day" aria-hidden="true">
    <video
      class="day__video pixel"
      src="/welcome/landing-hero.webm"
      poster="/welcome/day/garden-day.png"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      disableremoteplayback
    />
  </div>
</template>

<style scoped>
.day {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.day__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  image-rendering: pixelated;
}
</style>
