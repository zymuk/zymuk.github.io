import React, { useState, useEffect } from "react";

const Settings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data));
  }, [lang]);

  return (
    <div className="admin-page">
      <h2>{t.settings_title || "Settings"}</h2>
      <p>{t.settings_description || "Admin system configuration."}</p>
    </div>
  );
};

export default Settings;
