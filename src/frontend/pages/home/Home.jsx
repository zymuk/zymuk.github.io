import "./home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="home" id="home">
      <div className="home-content">
        <h1>
          Hi, It's <span>Zymuk</span>
        </h1>
        <h3 className="text-animation">
          I'm a <span>Vietnamese</span>
        </h3>

        <div className="list-function">
          <Link to="/tools">Tools</Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
