export interface Register {
  email: string;
  userName: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  location?: string;
  skills?: string;
  instrument?: string;
}

export interface FormValidationRules {
  emailRules?: any[];
  passwordRules?: any[];
  userNameRules?: any[];
  titleRules?: any[];
  categoryRules?: any[];
  artistRules?: any[];
}
