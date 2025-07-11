import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import { Outlet } from 'react-router';
import { AuthContextProvider } from '../context/index.js';

function MainLayout() {
  return (
    <AuthContextProvider>
      <div className=" text-gray-300 flex flex-col min-h-screen pb-15">
        <div className="bg-black h-[70px] fixed top-0 left-0 right-0 z-50"></div>
        <main className="grow flex flex-col justify-between pt-[70px]">
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
