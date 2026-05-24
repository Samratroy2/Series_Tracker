// frontend/src/services/aiService.js

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const getAIRecommendations = async (watchHistory = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        watchHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("AI recommendations error:", error);

    return {
      success: false,
      recommendations: [],
      message: "Could not load recommendations.",
    };
  }
};