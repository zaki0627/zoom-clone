import { atom, useAtom } from "jotai";

interface FlashMessage {
  message: string;
  type: "success" | "error";
}
const flashMessageAtom = atom<FlassMessage | null>();
export const useFlashMessage = () => {
  const [flashMessage, setFlashMessage] = useAtom(flashMessageAtom);
  const addMessage = (message: FlashMessage) => {
    setFlashMessage(message);
    setTimeout(() => {
      setFlashMessage(null);
    }, 3000);
  };

  const removeMessage = () => {
    setFlashMessage(null);
  };
  return { flashMessage, addMessage, removeMessage };
};
