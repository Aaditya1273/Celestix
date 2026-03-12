import { useState } from "react";
import { CodeTab, PreviewTab, CliTab, TabbedLayout } from "../../components/common/TabbedLayout";
import { Box, Button, ButtonGroup, Flex, Text } from "@chakra-ui/react";

import CodeExample from "../../components/code/CodeExample";
import CliInstallation from "../../components/code/CliInstallation";
import PropTable from "../../components/common/Preview/PropTable";
import Dependencies from '../../components/code/Dependencies';
import useForceRerender from "../../hooks/useForceRerender";

import { imageTrail } from "../../constants/code/Animations/imageTrailCode";
import ImageTrail from "../../ts-default/Animations/ImageTrail/ImageTrail";

const ImageTrailDemo = () => {
  const [variant, setVariant] = useState('1');
  const [key, forceRerender] = useForceRerender();

  const propData = [
    {
      name: "items",
      type: "string[]",
      default: "[]",
      description: "An array of image URLs which will be animated in the trail."
    },
    {
      name: "variant",
      type: "number",
      default: "1",
      description: "A number from 1 to 8 - all different animation styles."
    }
  ];

  return (
    <TabbedLayout>
      <PreviewTab>
        <Box position="relative" className="demo-container" h={500} overflow="hidden" bg="#333333">
          <ImageTrail
            key={key}
            items={[
              'https://picsum.photos/id/287/300/300',
              'https://picsum.photos/id/1001/300/300',
              'https://picsum.photos/id/1025/300/300',
              'https://picsum.photos/id/1026/300/300',
              'https://picsum.photos/id/1027/300/300',
              'https://picsum.photos/id/1028/300/300',
              'https://picsum.photos/id/1029/300/300',
              'https://picsum.photos/id/1030/300/300',
            ]}
            variant={variant}
          />

          <Flex position="absolute" justifyContent="center" flexDirection="column" alignItems="center">
            <Text fontSize="clamp(2rem, 6vw, 6rem)" fontWeight={900} color='#FFA500' mb={0}>
              Hover Me.
            </Text>
            <Text fontSize="18px" fontWeight={900} color='#FFA500' opacity={0.7} mt={0}>
              Variant {variant}
            </Text>
          </Flex>
        </Box>

        <div className="preview-options">
          <h2 className="demo-title-extra" style={{ color: '#FFA500' }}>Customize</h2>
          <Flex gap={6} direction="column">
            <ButtonGroup isAttached size="sm">
              <Button
                fontSize="xs"
                disabled
                border="1px solid #FFA500"
                h={8}
                _disabled={{ bg: '#000', border: "1px solid #FFA500", color: '#FFA500', cursor: 'not-allowed', _hover: { bg: '#000' } }}
              >
                Variant
              </Button>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isActive = variant === String(num);

                return (
                  <Button
                    key={num}
                    bg={isActive ? '#FFA500' : '#000'}
                    border="1px solid #FFA500"
                    _hover={{ backgroundColor: isActive ? '#FFA500' : '#1a1a1a' }}
                    color={isActive ? '#000' : '#FFA500'}
                    fontSize="xs"
                    h={8}
                    onClick={() => {
                      setVariant(String(num));
                      forceRerender();
                    }}
                  >
                    {num}
                  </Button>
                );
              })}
            </ButtonGroup>
          </Flex>
        </div>

        <PropTable data={propData} />
        <Dependencies dependencyList={['gsap']} />
      </PreviewTab>

      <CodeTab>
        <CodeExample codeObject={imageTrail} />
      </CodeTab>

      <CliTab>
        <CliInstallation {...imageTrail} />
      </CliTab>
    </TabbedLayout>
  );
};

export default ImageTrailDemo;