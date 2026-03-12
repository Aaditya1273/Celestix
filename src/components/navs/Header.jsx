'use client';
import { useMemo } from "react";
import Link from "next/link";

import {
  Box,
  Drawer,
  Flex,
  Icon,
  IconButton,
  Image,
  Kbd,
  Portal,
  Select,
  Separator,
  Text,
  useDisclosure,
  createListCollection,
} from "@chakra-ui/react";

import { FiArrowRight, FiCommand, FiMenu, FiSearch, FiStopCircle } from "react-icons/fi";

import { useDeviceOS } from "react-haiku";
import { useSearch } from "../context/SearchContext/useSearch";
import { useLanguage } from "../context/LanguageContext/useLanguage";


import FadeContent from "../../content/Animations/FadeContent/FadeContent";

const Header = () => {
  const langCollection = useMemo(() => createListCollection({ items: ["JS", "TS"] }), []);
  const { languagePreset, setLanguagePreset } = useLanguage();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { toggleSearch } = useSearch();
  const os = useDeviceOS();

  const LanguageSelect = (
    <Select.Root
      collection={langCollection}
      value={[languagePreset]}
      onValueChange={({ value }) => setLanguagePreset(value[0])}
      size="sm"
      width="80px"
    >
      <Select.HiddenSelect name="language" />

      <Select.Control>
        <Select.Trigger
          fontSize="12px"
          bg="transparent"
          border="none"
          h={10}
          fontWeight={600}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
        >
          <Select.ValueText color="#fff" pl={1} fontSize="12px" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator color="#fff" />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content
            bg="#0f0f0f"
            border="1px solid rgba(255,255,255,0.1)"
            borderRadius="16px"
            backdropFilter="blur(16px)"
            w="80px"
            px={2}
            py={2}
            zIndex="modal"
          >
            {langCollection.items.map((lang) => (
              <Select.Item
                item={lang}
                key={lang}
                rounded="lg"
                px={3}
                py={2}
                cursor="pointer"
                _highlighted={{ bg: "rgba(255,255,255,0.05)" }}
              >
                {lang}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );

  return (
    <Box
      position="fixed"
      top={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      w="max-content"
      maxW="95vw"
    >
      <Flex
        className="glass-effect"
        h={14}
        alignItems="center"
        px={6}
        rounded="full"
        gap={6}
        boxShadow="0 10px 30px rgba(0,0,0,0.5)"
      >
        <Link href="/" className="logo-text" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          CELESTIX
        </Link>

        <Flex display={{ base: "none", md: "flex" }} alignItems="center" gap={6}>
          <Link href="/text-animations/text-devider" className="nav-link-premium">
            Docs
          </Link>
          <Link href="/showcase" className="nav-link-premium">
            Showcase
          </Link>
        </Flex>

        <Separator orientation="vertical" h={6} borderColor="rgba(255,255,255,0.1)" />

        <Flex alignItems="center" gap={3}>
          <IconButton
            aria-label="Search"
            onClick={toggleSearch}
            className="header-icon-btn"
            variant="ghost"
            rounded="full"
          >
            <FiSearch />
          </IconButton>

          <Box className="language-wrapper">
            {LanguageSelect}
          </Box>

          <IconButton
            aria-label="Open Menu"
            display={{ md: "none" }}
            onClick={onOpen}
            variant="ghost"
            rounded="full"
          >
            <FiMenu />
          </IconButton>
        </Flex>
      </Flex>

      <Drawer.Root
        placement="top"
        open={isOpen}
        onOpenChange={(v) => (v ? onOpen() : onClose())}
      >
        <Drawer.Positioner top={20} left="50%" transform="translateX(-50%)" w="90vw" maxW="400px">
          <Drawer.Content className="glass-effect" rounded="2xl" border="1px solid rgba(255,255,255,0.1)">
            <Drawer.Body py={6} px={6}>
              <Flex direction="column" gap={4}>
                <Link href="/" onClick={onClose} className="nav-link-premium">Home</Link>
                <Link href="/text-animations/text-devider" onClick={onClose} className="nav-link-premium">Docs</Link>
                <Link href="/showcase" onClick={onClose} className="nav-link-premium">Showcase</Link>
                <Separator borderColor="rgba(255,255,255,0.1)" />
                <Link
                  href="https://davidhaz.com/"
                  target="_blank"
                  onClick={onClose}
                  className="nav-link-premium"
                >
                  <Flex align="center" gap={2}>
                    Who made this? <Icon as={FiArrowRight} transform="rotate(-45deg)" />
                  </Flex>
                </Link>
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </Box>
  );
};

export default Header;
