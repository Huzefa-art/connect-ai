export const fetchData = async (endpoint: string, method = "GET", body?: any) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,  // Add body only if it exists
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();  // Parse the response
    return data;
  } catch (error) {
    console.error("Error in fetchData:", error);
    return null;  
  }
};
