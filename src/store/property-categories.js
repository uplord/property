import { defineStore } from "pinia";
import axios from "axios";
import { reactive, toRefs } from "vue";

export const usePropertyCategoriesStore = defineStore(
  "propertyCategoriesStore",
  () => {
    const config = useRuntimeConfig();

    const headers = {
      Authorization: `Bearer ${config.public.strapiBearer}`,
    };

    const state = reactive({
      propertyCategories: [],
      propertyCategory: {},
    });

    const actions = {
      async fetchPropertyCategories() {
        try {
          const response = await axios.get(
            `${config.public.strapiApi}/categories`,
            { headers },
          );
          state.propertyCategories = response.data.data;
        } catch (error) {
          console.error("Failed to fetch property categories:", error);
        }
      },
    };

    return {
      ...toRefs(state),
      ...actions,
    };
  },
);
