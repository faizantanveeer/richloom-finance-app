import { toast } from "sonner";

const { useState } = require("react");

const useFetch = (cb) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    //If our callback (cb) has arguments sent to it, we can use the spread operator to get them all and pass them to the callback function.
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
