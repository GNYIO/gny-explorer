<template>
  <div class="container">
    <h1 v-if="error.statusCode === 404">Oops...</h1>
    <h1 v-else>An error occurred</h1>
  </div>
</template>

<script>
export default {
  props: ['error'],
}
</script>