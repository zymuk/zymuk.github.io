import "./home.css";
import Contact from "../contact/contact";
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
        <Contact/>
      </section>
      <section className="Apps" id="Apps">
        <h2 className="heading">List applications</h2>
        <div className="apps-content"></div>
      </section>
    </div>
  );
}

export default Home;
