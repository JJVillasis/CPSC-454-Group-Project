<template>
    <div class="card">
        <img class="card-img-top" :src="img" alt="">
        <div class="card-body">
            <h5 class="card-title">Caption HERE</h5>
        </div>
    </div>
</template>

<script>
export default {
  name: "ImageCard",
  props: ["img"],
};
</script>
