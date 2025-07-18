import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import { Outlet } from 'react-router';
import { AuthContextProvider } from '../context/index.js';

function MainLayout() {
  return (
    <AuthContextProvider>
      <div className=" text-gray-300 flex flex-col min-h-[90vh] pb-10">
        <div className="bg-[#121212] h-[60px] fixed top-0 left-0 right-0 z-50"></div>
        <main className="grow flex flex-col justify-between pt-[45px]">
          <Outlet />
          <ToastContainer
            position="top-center"
            autoClose={1500}
            toastClassName="w-[80vw] sm:w-[250px] h-[40px] !bg-gray-800 text-white rounded-lg shadow-lg flex items-center px-4"
          />
        </main>
        <Navbar />
      </div>
    </AuthContextProvider>
  );
}

export default MainLayout;
