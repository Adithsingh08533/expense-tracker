import { Link } from "react-router-dom";
const NotFoundPage = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <Link to="/" className="text-blue-600 mt-4 inline-block">Go Home</Link>
    </div>
  );
};
export default NotFoundPage;