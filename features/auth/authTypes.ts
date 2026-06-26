export interface RegisterRequest {
  name: string;
  phone: string;
  gender: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  phone: string;
  gender: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}