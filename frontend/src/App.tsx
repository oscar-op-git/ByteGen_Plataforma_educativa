import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPages from "./pages/LoginPages";
import {RegisterPage} from "./pages/RegisterPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPages />} />
        <Route path="/Registro" element={<RegisterPage/>}/>
      </Routes>
    </Router>
  )
}

export default App
