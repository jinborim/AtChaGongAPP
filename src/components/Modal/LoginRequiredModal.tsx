import { useRouter } from "expo-router";

import CustomModal from "./CustomModal";

type LoginRequiredModalProps = {
  visible: boolean;
  onClose: () => void;
  description?: string;
};

export default function LoginRequiredModal({
  visible,
  onClose,
  description = "로그인하고 기록을 안전하게 저장해 보세요.",
}: LoginRequiredModalProps) {
  const router = useRouter();

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      onConfirm={() => {
        onClose();
        router.push("/login");
      }}
      title="로그인이 필요해요"
      description={description}
      buttonCount={2}
      confirmText="로그인하기"
      cancelText="취소"
    />
  );
}
