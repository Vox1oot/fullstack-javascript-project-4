import axios from "axios";

export const load = (url) => {
  return axios.get(url).then((response) => response.data);
};
