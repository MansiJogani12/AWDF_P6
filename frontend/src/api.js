const BASE_URL = "http://localhost:5000";


// ==========================================
// GET AUTH HEADERS
// ==========================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};


// ==========================================
// HANDLE RESPONSE
// ==========================================

const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = {
      message: "Invalid server response",
    };
  }

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("auth-expired")
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Request failed"
    );
  }

  return data;
};


// ==========================================
// REGISTER
// ==========================================

export const registerUser = async (
  email,
  password
) => {
  const response = await fetch(
    `${BASE_URL}/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return handleResponse(response);
};


// ==========================================
// LOGIN
// ==========================================

export const loginUser = async (
  email,
  password
) => {
  const response = await fetch(
    `${BASE_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return handleResponse(response);
};


// ==========================================
// GET CURRENT USER
// ==========================================

export const getCurrentUser = async () => {
  const response = await fetch(
    `${BASE_URL}/auth/me`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};


// ==========================================
// GET TASKS
// ==========================================

export const getTasks = async () => {
  const response = await fetch(
    `${BASE_URL}/tasks`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};


// ==========================================
// CREATE TASK
// ==========================================

export const createTask = async (
  title,
  description
) => {
  const response = await fetch(
    `${BASE_URL}/tasks`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: JSON.stringify({
        title,
        description,
        completed: false,
      }),
    }
  );

  return handleResponse(response);
};


// ==========================================
// UPDATE TASK
// ==========================================

export const updateTask = async (
  id,
  task
) => {
  const response = await fetch(
    `${BASE_URL}/tasks/${id}`,
    {
      method: "PUT",

      headers: getAuthHeaders(),

      body: JSON.stringify({
        title: task.title,
        description: task.description,
        completed: task.completed,
      }),
    }
  );

  return handleResponse(response);
};


// ==========================================
// DELETE TASK
// ==========================================

export const deleteTask = async (id) => {
  const response = await fetch(
    `${BASE_URL}/tasks/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};