
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { setShowLoginModal, setShowRegisterModal } from "@/redux/slices/auth";
import { useDispatch, useSelector } from "react-redux";

const AuthModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[90%] overflow-auto rounded-lg p-8 sm:w-[450px] sm:max-w-[450px]">
        {children}
      </DialogContent>
    </Dialog>
  );
};

export const LoginModal = ({ children }) => {
  const dispatch = useDispatch();
  // Optimization: Direct property selection prevents unnecessary re-renders when other auth state properties change.
  const showLoginModal = useSelector((state) => state.auth.showLoginModal);

  const handleClose = () => {
    dispatch(setShowLoginModal(false));
  };

  return (
    <AuthModal isOpen={showLoginModal} onClose={handleClose}>
      {children}
    </AuthModal>
  );
};

export const RegisterModal = ({ children }) => {
  const dispatch = useDispatch();
  // Optimization: Direct property selection prevents unnecessary re-renders when other auth state properties change.
  const showRegisterModal = useSelector((state) => state.auth.showRegisterModal);

  const handleClose = () => {
    dispatch(setShowRegisterModal(false));
  };

  return (
    <AuthModal isOpen={showRegisterModal} onClose={handleClose}>
      {children}
    </AuthModal>
  );
};
