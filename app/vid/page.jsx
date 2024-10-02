// pages/index.js
import Link from "next/link";

const Home = () => {
  return (
    <div>
      <h1>Video Call App</h1>
      <Link href="/video">Start a Video Call</Link>
    </div>
  );
};

export default Home;
