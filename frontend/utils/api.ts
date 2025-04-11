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

export const fetchFormData = async (endpoint: string, formData: FormData) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
      method: "POST",
      body: formData, // Don't set headers — browser will do it correctly
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in fetchFormData:", error);
    return null;
  }
};
