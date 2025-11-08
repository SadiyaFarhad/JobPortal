
const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 10000 });
api.interceptors.request.use(cfg => { const token = localStorage.getItem('token'); if (token) cfg.headers.Authorization = 'Bearer ' + token; return cfg; });
Vue.prototype.$api = api;
