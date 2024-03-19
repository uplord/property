<template>
  <div>
    <h1>Properties</h1>

    <ul v-if="properties">
      <li v-for="property in properties" :key="property.id">
        <a :href="'/properties/' + property.id">{{ property.attributes.Name }}</a>
      </li>
    </ul>

    <ul v-if="pagination">
      <li v-if="pagination.page != 1">
        <a :href="'/properties?page=' + (parseInt(pagination.page) - 1)">
          Prev
        </a>
      </li>
      <li v-if="pagination.page != pagination.pageCount">
        <a :href="'/properties?page=' + (parseInt(pagination.page) + 1)">
          Next
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from 'vue-router';
import { usePropertiesStore } from "~/store/properties";
import { storeToRefs } from "pinia";

const route = useRoute();
const propertiesStore = usePropertiesStore();
const { properties, pagination } = storeToRefs(propertiesStore);

onMounted(() => {
  propertiesStore.fetchProperties({
    page: route.query.page || 1,
    pageSize: 8
  })
})
</script>