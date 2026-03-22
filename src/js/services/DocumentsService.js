import axios from 'axios';
import { buildFileUploadHeaders, buildHeaders } from '../helpers/AppHelper';

export const listDocuments = (args = {}) => {
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
  if (args.documentType) {
    params.document_type = args.documentType;
  }

  return axios.get(
    `${API_BASE_URL}/documents`,
    {
      params: params,
      headers: buildHeaders()
    }
  );
}

export const listPublicDocuments = (args = {}) => {
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
  if (args.documentType) {
    params.document_type = args.documentType;
  }

  return axios.get(
    `${API_BASE_URL}/public/documents`,
    {
      params: params
    }
  );
}

export const getDocument = (documentId) => {
  return axios.get(
    `${API_BASE_URL}/documents/${documentId}`,
    {
      headers: buildHeaders()
    }
  );
}

export const createDocument = (payload) => {
  const formData = new FormData();
  formData.append("name", payload.name || "");
  if (payload.description !== undefined) {
    formData.append("description", payload.description || "");
  }
  if (payload.document_type !== undefined) {
    formData.append("document_type", payload.document_type || "");
  }
  if (payload.file) {
    formData.append("file", payload.file);
  }

  return axios.post(
    `${API_BASE_URL}/documents`,
    formData,
    {
      headers: buildFileUploadHeaders()
    }
  );
}

export const updateDocument = (documentId, payload) => {
  const formData = new FormData();
  if (payload.name !== undefined) {
    formData.append("name", payload.name || "");
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description || "");
  }
  if (payload.document_type !== undefined) {
    formData.append("document_type", payload.document_type || "");
  }
  if (payload.file) {
    formData.append("file", payload.file);
  }

  return axios.put(
    `${API_BASE_URL}/documents/${documentId}`,
    formData,
    {
      headers: buildFileUploadHeaders()
    }
  );
}

export const deleteDocument = (documentId) => {
  return axios.delete(
    `${API_BASE_URL}/documents/${documentId}`,
    {
      headers: buildHeaders()
    }
  );
}
