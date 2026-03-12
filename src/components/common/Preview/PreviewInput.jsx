import { Flex, Text, Input, Field } from "@chakra-ui/react";

const PreviewInput = ({
  title = "",
  value = "",
  placeholder = "",
  width = 300,
  maxLength,
  isDisabled = false,
  onChange,
}) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <Flex gap="4" align="center" mt="4">
      <Text fontSize="14px" color="#FFA500">{title}</Text>
      <Field.Root width="auto">
        <Input
          borderRadius="10px"
          bg="#000"
          border="1px solid #FFA500"
          color="#FFA500"
          h={9}
          w={`${width}px`}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={isDisabled}
          _placeholder={{ color: "#FFA500", opacity: 0.5 }}
        />
      </Field.Root>
    </Flex>
  );
};

export default PreviewInput;
