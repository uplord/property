<template>
  <div v-if="property.attributes">
    <h1>Property</h1>

    <h2>{{ property.attributes.Name }}</h2>

    <StrapiBlocksText
      v-if="property.attributes.Description"
      :nodes="property.attributes.Description"
    />

    <p><a href="/properties">Back to properties</a></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePropertiesStore } from "~/store/properties";
import { storeToRefs } from "pinia";

const route = useRoute();
const propertiesStore = usePropertiesStore();
const { property } = storeToRefs(propertiesStore);

onMounted(() => {
  propertiesStore.fetchProperty(route.params.id);
});
</script>
