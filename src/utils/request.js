import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// const baseURLStr = window.g.BASE_API
const baseUrl = process.env.BASE_API

// 创建一个 axios 实例
const service = axios.create({
  baseURL: baseUrl, // api 的 base_url
  timeout: 5000 // request 超时时间
})

// request 拦截器
service.interceptors.request.use(
  config => {
    // 发送请求之前携带token
    if (store.getters.token) {
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      const token = getToken()
      config.headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': token,
        'login-type': 'sweb'
      }
      // config.headers['Authorization'] = token
    }
    return config
  },
  error => {
    // request 请求异常
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  console.log(Error.toString),
  // response => response,
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过 xmlhttprequest 来状态码标识 逻辑可写在下面error中
   */
  response => {
    const res = response.response.data
    const header = response.response.headers
    console.log(res)
    console.log('HEADER' + header)
    if (res.status === 404) {
      store.dispatch('404').then(() => {
      })
    }
    if (res.status === 401) {
      store.dispatch('401').then(() => {
      })
    }
    const flag = true
    if (flag) { // res.code !== 20000
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })
      // 8001:非法的token;   8002:Token 过期了;
      if (header.ERROR_CODE === 8001 || header.ERROR_CODE === 8002) {
        // 请自行在引入 MessageBox
        // import { Message, MessageBox } from 'element-ui'
        MessageBox.confirm(header.ERROR_INFO, '确定登出', { // '你已被登出，可以取消继续留在该页面，或者重新登录'
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
