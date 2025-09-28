import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainProviders from "./components/MainProviders";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="text-center py-10">
    <h1 className="text-3xl font-bold">404 - Not Found</h1>
    <p className="mt-4">요청하신 페이지를 찾을 수 없습니다.</p>
    <Link to="/" className="text-blue-500 hover:underline mt-6 inline-block">홈으로 돌아가기</Link>
  </div>
);

const App = () => (
  <MainProviders>
    <BrowserRouter>
      {/* Navbar or Header can go here */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Footer can go here */}

      {/* 투표 만들기 FAB - 모든 페이지에 보이도록 App.tsx 레벨로 이동 */}
      <Link 
        to="/create"
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-110"
        title="새로운 투표 만들기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </BrowserRouter>
  </MainProviders>
);

export default App;
