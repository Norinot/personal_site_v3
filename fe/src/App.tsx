import { Route, Routes } from "react-router-dom";
import HomeShell from "./HomeShell";
import AdminLogin from "./AdminLogin";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeShell />} />
      <Route path="/login" element={<AdminLogin />} />
    </Routes>
  );
};

export default App;
