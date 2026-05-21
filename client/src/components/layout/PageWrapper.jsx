import { motion } from 'framer-motion';
import { pageVariants } from '../../utils/animations';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useUIStore from '../../context/ThemeContext';

const PageWrapper = ({ children }) => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden theme-bg">
      <Sidebar />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 240 : 72 }}
      >
        <Navbar />
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default PageWrapper;
