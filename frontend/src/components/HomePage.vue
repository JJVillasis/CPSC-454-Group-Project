<template>
    <div>
        <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-success ml-2">+ New Post</button>
            <div class="btn-group btn-group-toggle my-2"  data-toggle="buttons">
                <label class="btn btn-secondary btn-warning">
                    <input type="radio" name="options" id="option1" v-on:click="changeSelection($event)" autocomplete="off"> Most Viral ↓
                </label>
                <label class="btn btn-secondary btn-warning">
                    <input type="radio" name="options" id="option2" v-on:click="changeSelection($event)" autocomplete="off"> Newest ↓
                </label>
                <label class="btn btn-secondary btn-warning mr-3">
                    <input type="radio" name="options" id="option3" v-on:click="changeSelection($event)" autocomplete="off"> Controversial ↓
                </label>
            </div>
        </div>

        <div class="container">
            <div class="row">
                <div v-for="image in latest" v-bind:key="image" class="col-lg-4 mt-3">
                    <ImageCard :img="image" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ImageCard from './ImageCard.vue'

export default {
    name: 'HomePage',
    components: {
        ImageCard
    },
    data() {
        return {
            latest: [
                "https://picsum.photos/400/200",
                "https://picsum.photos/400/200",
                "https://picsum.photos/400/200",
                "https://picsum.photos/400/200",
                "https://picsum.photos/400/200"
            ],
            isActive : ''
        }
    },
    methods: {
        changeSelection: function(event)
        {
            let element = event.target
            console.log("Clicked " + element.id);
        }
    }
}
</script>

<style>
body {
    background-color: #F4f4F4;
}
</style>