<template>
  <div class="page-header" :style="{ backgroundImage: `url(${image})` }">
    <div class="overlay"></div>
    <h1 class="title">{{ title }}</h1>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.page-header {
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.title {
  position: relative;
  z-index: 1;
  font-size: 3rem;
  font-weight: bold;
}
</style> 