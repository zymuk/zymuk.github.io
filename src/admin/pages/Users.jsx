import React, { useState, useEffect } from "react";

const Users = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data));
  }, [lang]);

  return (
    <div className="admin-page">
      <h2>{t.users_management || "Users Management"}</h2>
      <p>{t.users_description || "User list and management."}</p>
    </div>
  );
};

export default Users;
