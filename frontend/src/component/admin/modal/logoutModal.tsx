import Modal from "@/component/admin/ui/feedback/modal";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const LogoutModal = ({ open, onClose, onLogout }: LogoutModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="로그아웃"
      description="로그아웃 하시겠습니까?"
      buttonCount={2}
      primaryText="로그아웃"
      primaryVariant="danger"
      onPrimary={onLogout}
      secondaryText="취소"
      onSecondary={onClose}
    />
  );
};

export default LogoutModal;
