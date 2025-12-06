import axios from "axios";

class Loader {
  constructor() {}

  load(url, config) {
    return axios.get(url, config).then((response) => response.data);
  }

  loadResources(urls) {
    return Promise.all(
      urls.map((url) => this.load(url, { responseType: "arraybuffer" }))
    );
  }
}

export const loader = new Loader();
