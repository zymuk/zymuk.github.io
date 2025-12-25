import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>{t.page_not_found || "404 - Page Not Found"}</h1>
      <p>
        {t.page_not_exist || "The page you are looking for does not exist."}
      </p>
      <Link to="/admin">
        {t.back_to_dashboard || "Go back to Admin Dashboard"}
      </Link>
    </div>
  );
};

export default NotFound;
