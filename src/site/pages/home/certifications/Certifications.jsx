import React from "react";
import "./Certifications.css";

const Certifications = ({ data }) => {
  const visibleCertifications = data.filter((cert) => cert.isVisible !== false);

  if (visibleCertifications.length === 0) return null;

  return (
    <section id="certifications" className="section certifications-section">
      <h2 className="section-title">Certifications</h2>
      <div className="certifications-grid">
        {visibleCertifications.map((cert, index) => (
          <div key={index} className="certification-card">
            <div className="cert-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <div className="cert-content">
              <h3 className="cert-name">{cert.name}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              <p className="cert-date">
                <i className="fas fa-calendar-alt"></i> {cert.issueDate}
              </p>
              {cert.description && (
                <p className="cert-description">{cert.description}</p>
              )}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-link"
                >
                  View Credential <i className="fas fa-external-link-alt"></i>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;
