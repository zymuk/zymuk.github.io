import "./home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="Home" id="Home">
        <div className="home-content">
          <h1>
            Hi, It's <span>Zymuk</span>
          </h1>
          <h3 className="text-animation">
            I am a <span>Vietnamese</span>
          </h3>

          <div className="list-function">
            <Link to="/tools">Tools</Link>
          </div>
        </div>
      </section>
      <section className="Information" id="Information">
        <h2 className="full-name">Trần Thế Ngọc</h2>
        <div className="apps-content"></div>
      </section>
      <section className="Contact" id="Contact">
        <h2 className="heading">
          Contact <span>Me</span>
        </h2>
        <form action="" method="post">
          <div className="input-group">
            <div className="input-box">
              <input
                type="text"
                name="fullName"
                id="fullName"
                placeholder="Full name"
              />
              <input type="email" name="email" id="email" placeholder="Email" />
            </div>
            <div className="input-box">
              <input
                type="number"
                name="phone"
                id="phome"
                placeholder="Phone"
              />
              <input
                type="text"
                name="subject"
                id="subject"
                placeholder="Subject"
              />
            </div>
            <div className="input-box2">
              <textarea
                name="message"
                id="message"
                cols="30"
                rows="10"
                placeholder="Message"
              ></textarea>
              <input type="submit" value="Send Message" className="btn" />
            </div>
          </div>
        </form>
      </section>
      <section className="Apps" id="Apps">
        <h2 className="heading">List applications</h2>
        <div className="apps-content"></div>
      </section>
    </div>
  );
}

export default Home;
