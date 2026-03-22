import axios from "axios";
import { buildHeaders } from "../helpers/AppHelper";

export const getEnvironment = () => {
  return axios.get(
    `${API_BASE_URL}/system/environment`,
    {
      headers: buildHeaders(),
    }
  );
}
