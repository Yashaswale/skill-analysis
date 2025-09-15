// config.js
// Centralized configuration for API endpoints and other constants

const API_BASE_URL = "http://3.95.169.199:8000";

export { API_BASE_URL };


// Login 
export const login = API_BASE_URL + "/v1/auth/login";
export const signup = API_BASE_URL + "/v1/auth/signup";
export const logout = API_BASE_URL + "/v1/auth/logout";
export const forgotPassword = API_BASE_URL + "/v1/auth/forgot-password";


//Skill Analysis
export const jds = API_BASE_URL + "/v1/jds";

export const custom_jds = API_BASE_URL + "/v1/jds";

export const paste_jds = API_BASE_URL + "/v1/jds/paste";


export const cvs = API_BASE_URL + "/v1/cvs";

export const analysis = API_BASE_URL + "/v1/analysis";

export const download_cv = API_BASE_URL + "/v1/cvs/{cvId}/download";

export const get_email = API_BASE_URL + "/v1/cvs/{cvId}/email";

export const send_email = API_BASE_URL + "/v1/email/send";

export const email_body = API_BASE_URL + "/v1/email/suggestions";

export const chat = API_BASE_URL + "/v1/chat";

export const chat_history = API_BASE_URL + "/v1/chat";

export const conversations = API_BASE_URL + "/v1/chat/{conversationId}";



//histoy part
export const analysis_history = API_BASE_URL + "/v1/analysis/history";

export const get_analysis_by_id = API_BASE_URL + "/v1/analysis/{id}";


