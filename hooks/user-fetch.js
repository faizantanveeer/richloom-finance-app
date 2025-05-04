import { toast } from "sonner";

const { useState } = require("react");

const useFetch = (cb) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      return response;
    } catch (error) {
      setError(error); // Update state
      throw error;     // Also allow caller to catch
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};


export default useFetch;
