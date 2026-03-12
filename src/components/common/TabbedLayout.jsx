import React from "react";
import { Tabs, Icon, Flex } from "@chakra-ui/react";
import { FiCode, FiEye, FiTerminal } from "react-icons/fi";

const TAB_STYLE_PROPS = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #FFA500",
  borderRadius: "full",
  h: 12,
  w: 12,
  color: "#ffffff",
  _hover: { bg: "rgba(255, 165, 0, 0.2)" },
  _selected: { bg: "#FFA500", color: "#FFFFFF" },
};

const TabbedLayout = ({ children, className }) => {
  const contentMap = {
    PreviewTab: null,
    CodeTab: null,
    CliTab: null,
  };

  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type === PreviewTab) contentMap.PreviewTab = child;
    if (child.type === CodeTab) contentMap.CodeTab = child;
    if (child.type === CliTab) contentMap.CliTab = child;
  });

  return (
    <Tabs.Root
      w="100%"
      variant="plain"
      lazyMount
      defaultValue="preview"
      className={className}
    >
      <Tabs.List w="100%" mb={4}>
        <Flex gap={2} justifyContent="flex-start" alignItems="center">
          <Tabs.Trigger value="preview" {...TAB_STYLE_PROPS}>
            <Icon as={FiEye} />
          </Tabs.Trigger>

          <Tabs.Trigger value="code" {...TAB_STYLE_PROPS}>
            <Icon as={FiCode} />
          </Tabs.Trigger>

          <Tabs.Trigger value="cli" {...TAB_STYLE_PROPS}>
            <Icon as={FiTerminal} />
          </Tabs.Trigger>
        </Flex>
      </Tabs.List>

      <Tabs.Content pt={0} value="preview">{contentMap.PreviewTab}</Tabs.Content>
      <Tabs.Content pt={0} value="code">{contentMap.CodeTab}</Tabs.Content>
      <Tabs.Content pt={0} value="cli">{contentMap.CliTab}</Tabs.Content>
    </Tabs.Root>
  );
};

export const PreviewTab = ({ children }) => <>{children}</>;
export const CodeTab = ({ children }) => <>{children}</>;
export const CliTab = ({ children }) => <>{children}</>;

export { TabbedLayout };
