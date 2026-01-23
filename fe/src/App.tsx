import { Route, Routes } from "react-router-dom";
import MainContent from "./mainContent";
import AdminLogin from "./AdminLogin";

export const URL_BASEAPTH = "http://localhost:8080/";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainContent />} />
      <Route path="/login" element={<AdminLogin />} />
    </Routes>
  );
};

export default App;
