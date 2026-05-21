import useUIStore from '../context/ThemeContext';

const useToast = () => {
  const { toast } = useUIStore();
  return toast;
};

export default useToast;
