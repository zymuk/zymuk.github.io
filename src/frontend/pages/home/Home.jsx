import "./home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <p>Front-end home</p>
      <p>
        <Link to="/tools">Tools</Link>
      </p>
    </div>
  );
}

export default Home;
