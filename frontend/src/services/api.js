const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? "" : "http://127.0.0.1:8000");

/* =========================================================
   AUTHENTICATION
========================================================= */

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    let message = "Login failed";

    if (Array.isArray(data.detail)) {
      message = data.detail
        .map((error) => error.msg || "Invalid login data")
        .join(", ");
    } else if (typeof data.detail === "string") {
      message = data.detail;
    }

    throw new Error(message);
  }

  localStorage.setItem(
    "polarops_token",
    data.access_token
  );

  localStorage.setItem(
    "polarops_refresh_token",
    data.refresh_token
  );

  localStorage.setItem(
    "polarops_user",
    JSON.stringify(data.user)
  );

  return data;
}

export function getStoredUser() {
  const user = localStorage.getItem("polarops_user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}


export function getToken() {
  return localStorage.getItem("polarops_token");
}


export function logoutUser() {
  localStorage.removeItem("polarops_token");
  localStorage.removeItem("polarops_refresh_token");
  localStorage.removeItem("polarops_user");
}


/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(
    "polarops_refresh_token"
  );

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
  `${API_BASE_URL}/auth/refresh`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  }
);
    const data = await response.json();

    if (!response.ok) {
      logoutUser();
      return null;
    }

    localStorage.setItem(
      "polarops_token",
      data.access_token
    );

    return data.access_token;

  } catch (error) {
    return null;
  }
}


/* =========================================================
   AUTHENTICATED FETCH
   Automatically refreshes token after 401
========================================================= */

async function authenticatedFetch(
  url,
  options = {},
  retry = true,
  networkRetryCount = 0
) {
  const MAX_NETWORK_RETRIES = 3;
  const RETRY_DELAY = 1500;

  let token = getToken();

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    /* -------------------------------------------------------
       Temporary network/server connection failure
    ------------------------------------------------------- */

    if (networkRetryCount < MAX_NETWORK_RETRIES) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY)
      );

      return authenticatedFetch(
        url,
        options,
        retry,
        networkRetryCount + 1
      );
    }

    throw new Error(
      "Unable to connect to POLAROPS server. Please check the connection."
    );
  }

  /* -------------------------------------------------------
     Access token expired
  ------------------------------------------------------- */

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      return authenticatedFetch(
        url,
        options,
        false,
        networkRetryCount
      );
    }

    throw new Error(
      "Your POLAROPS session has expired. Please log in again."
    );
  }

  return response;
}


/* =========================================================
   REGISTRATION
========================================================= */

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      role: "expedition_member",
      station: userData.station,
      personnel_type: userData.personnel_type,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    );
  }

  return data;
}


/* =========================================================
   EXPEDITIONS
========================================================= */

export async function createExpedition(expeditionData) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/expeditions/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expeditionData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to create expedition"
    );
  }

  return data;
}


export async function getExpeditions() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/expeditions/`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load expeditions"
    );
  }

  return data;
}


/* =========================================================
   PERSONNEL
========================================================= */

export async function getAvailablePersonnel() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/expeditions/personnel/available`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Failed to load available personnel"
    );
  }

  return data;
}


export async function assignPersonToExpedition(
  expeditionId,
  assignmentData
) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/expeditions/${expeditionId}/assignments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignmentData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Failed to assign person"
    );
  }

  return data;
}


/* =========================================================
   EXPEDITION ASSIGNMENTS
========================================================= */

export async function getExpeditionAssignments(
  expeditionId
) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/expeditions/${expeditionId}/assignments`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Failed to load expedition assignments"
    );
  }

  return data;
}
/* ================= CARGO ================= */

export async function getCargo() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/cargo/`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load cargo"
    );
  }

  return data;
}

export async function createCargo(cargoData) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/cargo/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cargoData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to create cargo"
    );
  }

  return data;
}

export async function updateCargoStatus(
  cargoId,
  status
) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/cargo/${cargoId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update cargo status"
    );
  }

  return data;
}

export async function getCargoById(cargoId) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/cargo/${cargoId}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load cargo details"
    );
  }

  return data;
}
// ================= EMERGENCY API =================

export async function getEmergencies() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/emergencies/`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch emergencies");
  }

  return data;
}

export async function getEmergencyById(emergencyId) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/emergencies/${emergencyId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch emergency");
  }

  return data;
}

export async function createEmergency(emergencyData) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/emergencies/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emergencyData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create emergency");
  }

  return data;
}

export async function updateEmergencyStatus(
  emergencyId,
  status
){
  const response = await authenticatedFetch(
    `${API_BASE_URL}/emergencies/${emergencyId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update emergency status"
    );
  }

  return data;
}

export async function getEmergencyResources(emergencyId) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/emergencies/${emergencyId}/resources`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch emergency resources"
    );
  }

  return data;
}
export async function getNotifications() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/notifications/`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch notifications"
    );
  }

  return data;
}
export async function markNotificationAsRead(notificationId) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to mark notification as read"
    );
  }

  return data;
}
