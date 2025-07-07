import { useEffect } from "react";
import FileList from "./components/FileList.jsx";
import FileUpload from "./components/FileUpload.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import fileService from "./services/fileService";

export default function App() {
  useEffect(() => {
    const handleNetworkChange = () => {
      if (!navigator.onLine) {
        fileService.deleteAllFiles().catch(() => {});
      }
    };
    window.addEventListener("offline", handleNetworkChange);
    return () => window.removeEventListener("offline", handleNetworkChange);
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-col h-auto w-full items-center justify-center mt-10">
        <FileUpload />
        <FileList />
        <Footer />
      </div>
    </>
  );
}
