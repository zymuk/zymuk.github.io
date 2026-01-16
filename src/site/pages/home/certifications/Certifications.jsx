import React from "react";
import "./Certifications.css";

const Certifications = ({ data, settings = {} }) => {
  const visibleCertifications = data.filter((cert) => cert.isVisible !== false);

  if (visibleCertifications.length === 0) return null;

  const sectionStyle = {
    backgroundColor: settings.color || "#006994",
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: settings.image ? "cover" : undefined,
    backgroundPosition: settings.image ? "center" : undefined,
  };

  return (
    <section
      id="certifications"
      className="section certifications-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Certifications</h2>
      <ul className="certifications-list">
        {visibleCertifications.map((cert, index) => (
          <li key={index}>
            <strong>{cert.name}</strong> - {cert.issuer} ({cert.issueDate})
            {cert.credentialUrl && (
              <>
                {" | "}
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Credential
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Certifications;
