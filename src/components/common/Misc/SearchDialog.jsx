import { useEffect, useState, useRef, useCallback } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody } from '@chakra-ui/modal';
import {
  Input,
  InputGroup,
  Box,
  Text,
  Icon
} from '@chakra-ui/react';
import { FiSearch, FiLayers, FiImage, FiType, FiCircle } from 'react-icons/fi';
import { AiOutlineEnter } from 'react-icons/ai';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../../constants/Categories';
import { useSearch } from '../../context/SearchContext/useSearch';

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
    }
  }
  return dp[m][n];
};

const fuzzyMatch = (candidate, query) => {
  const lowerCandidate = candidate.toLowerCase();
  const lowerQuery = query.toLowerCase();
  if (lowerCandidate.includes(lowerQuery)) return true;
  const candidateWords = lowerCandidate.split(/\s+/);
  const queryWords = lowerQuery.split(/\s+/);
  return queryWords.every(qw =>
    candidateWords.some(cw => {
      const distance = levenshtein(cw, qw);
      const threshold = Math.max(1, Math.floor(qw.length / 3));
      return distance <= threshold;
    })
  );
};

function searchComponents(query) {
  if (!query || query.trim() === '') return [];
  const results = [];
  CATEGORIES.forEach(category => {
    const { name: categoryName, subcategories } = category;
    if (fuzzyMatch(categoryName, query)) {
      subcategories.forEach(component =>
        results.push({ categoryName, componentName: component })
      );
    } else {
      subcategories.forEach(component => {
        if (fuzzyMatch(component, query))
          results.push({ categoryName, componentName: component });
      });
    }
  });
  return results;
}

const AnimatedResult = ({ children, delay = 0, dataIndex, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={dataIndex}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </motion.div>
  );
};

const categoryIconMapping = {
  "Text Animations": FiType,
  "Animations": FiCircle,
  "Components": FiLayers,
  "Backgrounds": FiImage,
};

const SearchDialog = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef(null);
  const navigate = useNavigate();
  const { toggleSearch } = useSearch();

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchValue(inputValue);
      setSelectedIndex(-1);
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  const results = searchComponents(searchValue);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDist = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDist / 50, 1)
    );
  };

  useEffect(() => {
    if (!resultsRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = resultsRef.current;
    setBottomGradientOpacity(
      scrollHeight <= clientHeight
        ? 0
        : Math.min((scrollHeight - (scrollTop + clientHeight)) / 50, 1)
    );
  }, [results]);

  const slug = (str) =>
    str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const handleSelect = (result) => {
    if (!result) return;
    const path = `/components/${slug(result.categoryName)}/${slug(
      result.componentName
    )}`;
    navigate(path);
    onClose();
    toggleSearch();
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  useEffect(() => {
    if (selectedIndex === -1 || !resultsRef.current) return;
    const selectedElement = resultsRef.current.querySelector(
      `[data-index='${selectedIndex}']`
    );
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest", behavior: 'smooth' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setSearchValue("");
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent
        bg="#060010"
        mx={4}
        my={8}
        maxW="600px"
        rounded="2xl"
        shadow="2xl"
        overflow="hidden"
        border="1px solid #271E37"
      >
        <ModalBody p={0}>
          <InputGroup>
            <Icon as={FiSearch} color="#999" position="absolute" left="1rem" top="50%" transform="translateY(-50%)" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={onKey}
              placeholder="Search components..."
              variant="unstyled"
              bg="#060010"
              color="white"
              p="1.5rem 3.5rem"
              autoFocus
            />
          </InputGroup>
          <AnimatePresence>
            {searchValue && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  p=".5em"
                  borderTop="1px solid #271E37"
                  position="relative"
                >
                  <Box
                    ref={resultsRef}
                    maxH={400}
                    overflowY="auto"
                    onScroll={handleScroll}
                    sx={{
                      "&::-webkit-scrollbar": { width: "8px" },
                      "&::-webkit-scrollbar-track": { bg: "#060010" },
                      "&::-webkit-scrollbar-thumb": {
                        bg: "#271E37",
                        rounded: "4px",
                      },
                      scrollbarWidth: "thin",
                      scrollbarColor: "#271E37 #060010",
                    }}
                  >
                    {results.length > 0 ? (
                      results.map((r, i) => {
                        const IconComp =
                          categoryIconMapping[r.categoryName] || FiSearch;
                        const selected = i === selectedIndex;
                        return (
                          <AnimatedResult
                            key={`${r.categoryName}-${r.componentName}-${i}`}
                            delay={0.05}
                            dataIndex={i}
                            onMouseEnter={() => setSelectedIndex(i)}
                            onClick={() => handleSelect(r)}
                          >
                            <Box
                              mt={i === 0 ? 2 : 2}
                              mr=".6em"
                              mb={2}
                              p="1em"
                              bg={selected ? "#392e4e" : "#271E37"}
                              rounded="xl"
                              display="flex"
                              alignItems="center"
                            >
                              <Box mr="16px">
                                <IconComp size={24} color="#B19EEF" />
                              </Box>
                              <Box flex="1">
                                <Text fontWeight="bold" fontSize="16px" color="white">
                                  {r.componentName}
                                </Text>
                                <Text fontSize="sm" color="#B19EEF">
                                  in {r.categoryName}
                                </Text>
                              </Box>
                              <Box
                                ml="auto"
                                opacity={selected ? 1 : 0}
                                transition="opacity 0.2s"
                              >
                                <Icon as={AiOutlineEnter} color="#B19EEF" />
                              </Box>
                            </Box>
                          </AnimatedResult>
                        );
                      })
                    ) : (
                      <Text p={8} textAlign="center" color="#999">
                        No results for "{searchValue}"
                      </Text>
                    )}
                  </Box>
                  <Box
                    pos="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="50px"
                    bg="linear-gradient(to bottom, #060010, transparent)"
                    opacity={topGradientOpacity}
                    transition="opacity 0.3s"
                    pointerEvents="none"
                  />
                  <Box
                    pos="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    h="50px"
                    bg="linear-gradient(to top, #060010, transparent)"
                    opacity={bottomGradientOpacity}
                    transition="opacity 0.3s"
                    pointerEvents="none"
                  />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;