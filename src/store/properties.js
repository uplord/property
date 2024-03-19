import { defineStore } from "pinia";
import axios from 'axios';

export const usePropertiesStore = defineStore("propertiesStore", () => {

  const headers = {
    'Authorization': 'Bearer bc171b6b354b09162295aefb2c2e19559aa2340035506eb008875ceaf28f54f2c53ee3d4db2b5552f558df7571e05dc4e26fa83a03fcc16f017ed2b687d1ad17688e1b1c39820ce878221ff4da98545d1407188b6e26cb26700cbefaaca418f9ba6458ae55ce4f135c39b721c08f2cc224c8836608b8c91133301b1a9c2ab422'
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

      await axios.get('http://localhost:1337/api/properties?pagination[page]=' + this.pagination.page + '&pagination[pageSize]=' + this.pagination.pageSize, {
        headers
      }).then(response => {
        this.properties = response.data.data;
        this.pagination = response.data.meta.pagination
      });
    },
    async fetchProperty(id) {
      await axios.get('http://localhost:1337/api/properties/' + id, {
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
