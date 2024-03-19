import { defineStore } from "pinia";
import axios from "axios";

export const usePropertiesStore = defineStore("propertiesStore", () => {
  const config = useRuntimeConfig();

  const headers = {
    Authorization: "Bearer " + config.public.strapiBearer,
  };

  const state = reactive({
    properties: [],
    property: {},
    pagination: {
      page: 1,
      pageSize: 10,
    },
  });

  const actions = {
    async fetchProperties(pagination = {}, filters = {}) {
      if (pagination) {
        this.pagination = { ...this.pagination, ...pagination };
      }

      const params = {
        pagination: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        },
        filters: filters,
      };

      try {
        const response = await axios.get(
          config.public.strapiApi + "/properties",
          {
            headers: headers,
            params: params,
          },
        );

        this.properties = response.data.data;
        this.pagination = response.data.meta.pagination;
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    },
    async fetchProperty(id) {
      await axios
        .get(config.public.strapiApi + "/properties/" + id, {
          headers,
        })
        .then((response) => {
          this.property = response.data.data;
        });
    },
  };

  return {
    ...toRefs(state),
    ...actions,
  };
});
