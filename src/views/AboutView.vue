<template>
  <div class="container">
    <h1 class="text-center">About Our Library</h1>
    <p class="text-center">
      Welcome to our digital library! We're dedicated to providing a vast collection of books and resources to our community.
    </p>
    <div class="alert alert-success text-center" v-if="isAuthenticated">
      You are logged in!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const isAuthenticated = ref(false)
onMounted(() => {
  isAuthenticated.value = window.__auth && window.__auth.isAuthenticated
})
</script>

<style>
</style>