<template>
  <div class="spotify-player">
    <iframe
      style="border-radius:12px"
      src="https://open.spotify.com/embed/playlist/2YC6RDAdPt3J4yD2aJMtjt?utm_source=generator&theme=0"
      width="400"
      height="150"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
  </div>
</template>

<script setup>
</script>

<style scoped>
.spotify-player {
  position: absolute;
  bottom: 10px;
  right: 20px;
  z-index: 100;
}
</style>
