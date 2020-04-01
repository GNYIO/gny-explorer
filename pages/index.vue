<template>
  <el-container direction="vertical">
    <Basic />

    <Block />
  </el-container>
</template>

<script>
import Basic from '~/components/Basic.vue';
import Block from '~/components/Block.vue';


export default {
  components: {
    Basic,
    Block
  }
}
</script>

<style>
.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}



</style>
