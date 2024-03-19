import { defineStore } from "pinia";
import axios from 'axios';

export const usePropertiesStore = defineStore("propertiesStore", () => {

  const config = useRuntimeConfig()

  const headers = {
    'Authorization': 'Bearer ' + config.public.strapiBearer
  };

  const state = reactive({
    properties: [],
    property: {},
    pagination: {
      page: 1,
      pageSize: 10
    }
  });

  const actions = {

    async fetchProperties(pagination = {}) {
      if (pagination) {
        this.pagination = {... this.pagination, ...pagination};
      }

      await axios.get(config.public.strapiApi + '/properties?pagination[page]=' + this.pagination.page + '&pagination[pageSize]=' + this.pagination.pageSize, {
        headers
      }).then(response => {
        this.properties = response.data.data;
        this.pagination = response.data.meta.pagination
      });
    },
    async fetchProperty(id) {
      await axios.get(config.public.strapiApi + '/properties/' + id, {
        headers
      }).then(response => {
        this.property = response.data.data;
      });
    }
  };

  return {
    ...toRefs(state),
    ...actions,
  };
});
