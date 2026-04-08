<template>
  <div class="spotify-player">
    <iframe
      style="border-radius:12px; width: 100%;"
      src="https://open.spotify.com/embed/playlist/2YC6RDAdPt3J4yD2aJMtjt?utm_source=generator&theme=0"
      width="100%"
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
  width: min(90vw, 400px);
  max-width: 100%;
}

.spotify-player iframe {
  width: 100%;
}

@media (max-width: 768px) {
  .spotify-player {
    position: static;
    margin: 1rem auto 0;
    right: auto;
    bottom: auto;
  }

  .spotify-player iframe {
    height: 170px;
  }
}
</style>
