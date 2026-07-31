import React, { useState } from "react";
import "./Contact.css";

const Contact = ({ settings }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sectionStyle = {
    backgroundColor: settings.color,
    backgroundImage: settings.image ? `url(${settings.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const mailtoUrl = `mailto:ttngoc653@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <section
      id="contact"
      className="section contact-section"
      style={sectionStyle}
    >
      <h2 className="section-title">Contact Me</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          placeholder="Your Name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label>Email:</label>
        <input
          type="email"
          placeholder="Your Email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label>Subject:</label>
        <input
          type="text"
          placeholder="Subject"
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
        <label>Message:</label>
        <textarea
          placeholder="Your Message"
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        ></textarea>
        <button type="submit">Send</button>
      </form>
    </section>
  );
};

export default Contact;
