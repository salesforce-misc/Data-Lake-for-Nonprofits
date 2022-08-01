import { FC } from "react";
import {
  Box,
  BoxProps,
  Image,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useTheme,
} from "@chakra-ui/react";

interface ClickableImageProps extends BoxProps {
  src: string;
  title: string;
}

export const ClickableImage: FC<ClickableImageProps> = ({ src, title, ...props }) => {
  const theme = useTheme().clickableImage;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box {...props}>
      <Modal onClose={onClose} isOpen={isOpen} size="full" isCentered>
        <ModalOverlay />
        <ModalContent m={25}>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image src={src} w="75%" m="auto" />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme={theme.scheme}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Image src={src} boxShadow="md" borderRadius="lg" onClick={onOpen} cursor="pointer" />
    </Box>
  );
};
