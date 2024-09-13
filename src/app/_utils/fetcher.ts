
const fetcher = async (...args: [RequestInfo, RequestInit?]): Promise<any> => {
  try {
    const response = await fetch(...args);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetching failed", error);
    throw error; // Re-throw the error so that it can be handled by the caller
  }
};

export default fetcher;
