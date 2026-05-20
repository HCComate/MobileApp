import axios from 'axios';

const API_BASE_URL = 'https://8080-icny3dm5u38ez51amxhl3-0e5230d6.sg1.manus.computer/api'; // 노출된 MobileServer의 API 기본 URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: 인증 토큰이 필요한 경우 여기에 인터셉터 추가
// api.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem('userToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default api;
