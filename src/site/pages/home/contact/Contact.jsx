import React from "react";
import "./Contact.css";

const Contact = ({ settings }) => {
  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <section
      id="contact"
      className="section contact-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Contact Me</h2>
      <form className="contact-form">
        <label>Name:</label>
        <input type="text" placeholder="Your Name" required />
        <label>Email:</label>
        <input type="email" placeholder="Your Email" required />
        <label>Subject:</label>
        <input type="text" placeholder="Subject" required />
        <label>Message:</label>
        <textarea placeholder="Your Message" required></textarea>
        <button type="submit">Send</button>
      </form>
    </section>
  );
};

export default Contact;
