import axios from 'axios';
import { buildHeaders } from '../helpers/AppHelper';

export const listUsers = (args = {}) => {
  const params = {};
  if (args.page) {
    params.page = args.page;
  }
  if (args.perPage) {
    params.per_page = args.perPage;
  }
  if (args.query) {
    params.query = args.query;
  }
  if (args.status) {
    params.status = args.status;
  }

  return axios.get(
    `${API_BASE_URL}/users`,
    {
      params: params,
      headers: buildHeaders()
    }
  );
}

export const getUser = (userId) => {
  return axios.get(
    `${API_BASE_URL}/users/${userId}`,
    {
      headers: buildHeaders()
    }
  );
}

export const createUser = (payload) => {
  return axios.post(
    `${API_BASE_URL}/users`,
    {
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    },
    {
      headers: buildHeaders()
    }
  );
}

export const updateUser = (userId, payload) => {
  return axios.put(
    `${API_BASE_URL}/users/${userId}`,
    {
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    },
    {
      headers: buildHeaders()
    }
  );
}

export const deleteUser = (userId) => {
  return axios.delete(
    `${API_BASE_URL}/users/${userId}`,
    {
      headers: buildHeaders()
    }
  );
}
