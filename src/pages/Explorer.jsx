import { SimpleGrid, Stack, Text } from "@mantine/core";
import { IconFileText, IconFolder } from "@tabler/icons-react";

const Explorer = () => {
  const files = [
    { name: "My Projects", icon: IconFolder },
    { name: "Resume.doc", icon: IconFileText },
    { name: "Notes.txt", icon: IconFileText },
    { name: "Games", icon: IconFolder },
  ];

  return (
    <SimpleGrid cols={{ base: 3, sm: 6 }} spacing="lg">
      {files.map((file, index) => (
        <Stack
          key={index}
          align="center"
          gap={4}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <file.icon size={48} stroke={1} color="white" />
          <Text size="sm" ta="center" c="white">
            {file.name}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  );
};

export default Explorer;