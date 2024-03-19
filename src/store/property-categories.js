import { defineStore } from "pinia";
import axios from "axios";

export const usePropertyCategoriesStore = defineStore(
  "propertyCategoriesStore",
  () => {
    const config = useRuntimeConfig();

    const headers = {
      Authorization: "Bearer " + config.public.strapiBearer,
    };

    const state = reactive({
      propertyCategories: [],
      propertyCategory: {},
    });

    const actions = {
      async fetchPropertyCategories() {
        const params = {};

        try {
          const response = await axios.get(
            config.public.strapiApi + "/categories",
            {
              headers: headers,
              params: params,
            },
          );

          this.propertyCategories = response.data.data;
        } catch (error) {
          console.error("Failed to fetch posts:", error);
        }
      },
    };

    return {
      ...toRefs(state),
      ...actions,
    };
  },
);
