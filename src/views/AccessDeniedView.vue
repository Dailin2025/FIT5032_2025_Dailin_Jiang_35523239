<template>
  <div class="container mt-5">
    <div class="alert alert-danger text-center">
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page. Please <router-link to="/login">login</router-link> first.</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.container {
  margin-top: 80px;
}
</style> 