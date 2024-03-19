<template>
  <div v-if="loaded">
    <h1>Properties</h1>
    <h2>Categories</h2>
    <ul v-if="propertyCategories.length">
      <li>
        <button :disabled="currentCategory === ''" @click="changeCategory('')">
          None
        </button>
      </li>
      <li v-for="category in propertyCategories" :key="category.id">
        <button
          :class="{ active: currentCategory === category.attributes.Name }"
          :disabled="currentCategory === category.attributes.Name"
          @click="changeCategory(category.attributes.Name)"
        >
          {{ category.attributes.Name }}
        </button>
      </li>
    </ul>
    <p v-else>No categories available.</p>
    <h2>Property List</h2>
    <ul v-if="properties && properties.length">
      <li v-for="property in properties" :key="property.id">
        <a :href="'/properties/' + property.id">{{
          property.attributes.Name
        }}</a>
      </li>
    </ul>
    <p v-else>No properties available.</p>
    <div v-if="pagination && properties.length">
      <button
        v-if="pagination.page > 1"
        @click="changePage(pagination.page - 1)"
      >
        Prev
      </button>
      <button
        v-if="pagination.page < pagination.pageCount"
        @click="changePage(pagination.page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePropertiesStore } from "~/store/properties";
import { usePropertyCategoriesStore } from "~/store/property-categories";
import { storeToRefs } from "pinia";

const route = useRoute();
const router = useRouter();

const propertiesStore = usePropertiesStore();
const propertyCategoriesStore = usePropertyCategoriesStore();
const { properties, pagination } = storeToRefs(propertiesStore);
const { propertyCategories } = storeToRefs(propertyCategoriesStore);

const currentCategory = ref(route.query.property_categories || "");

const loaded = ref(false);

onMounted(async () => {
  await propertyCategoriesStore.fetchPropertyCategories();
  fetchProperties();
});

async function fetchProperties(page = route.query.page || 1) {
  const filters = currentCategory.value
    ? { property_categories: { Name: { $eq: currentCategory.value } } }
    : {};
  await propertiesStore.fetchProperties({ page, pageSize: 6 }, filters);

  loaded.value = true;
}

function changeCategory(category) {
  currentCategory.value = category;
  const queryParameters = { property_categories: category || undefined };
  if (category) queryParameters.page = undefined; // Reset page to 1 implicitly
  router
    .push({ path: "/properties", query: queryParameters })
    .catch((err) => {});
  fetchProperties(1); // Fetch with page reset to 1
}

function changePage(page) {
  router
    .push({
      path: "/properties",
      query: {
        ...route.query,
        property_categories: currentCategory.value || undefined,
        page,
      },
    })
    .catch((err) => {});
  fetchProperties(page);
}
</script>

<style scoped>
.active {
  font-weight: bold;
}
button:focus {
  outline: none;
}
</style>
