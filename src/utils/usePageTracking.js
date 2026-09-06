import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-79LGF2YKS6";

const pageview = (path) => {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) {
    return;
  }
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: path });
};

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
};

export default usePageTracking;
