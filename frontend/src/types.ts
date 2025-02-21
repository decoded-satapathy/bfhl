export interface ApiRequest {
  data: string[];
}

export interface ApiResponse {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_alphabet: string[];
}

export interface ApiError {
  is_success: false;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  invalid_inputs?: string[];
}

export interface Option {
  value: string;
  label: string;
}