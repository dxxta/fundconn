import { memo } from "react";
import { Image, Flex, Group, Text, Button, Card, Stack } from "@mantine/core";
import { IconArrowRight, IconTargetArrow } from "@tabler/icons-react";
import { projectType } from "../context/Contract";
import { useHover } from "@mantine/hooks";
import { getProjectSlug } from "../utils/converter";

const ExploreCardComponent = ({
  project,
  width,
}: {
  project: projectType;
  width?: string;
}) => {
  const { hovered, ref }: { ref: any; hovered: boolean } = useHover();
  return (
    <Card
      ref={ref}
      w={width ? width : "100%"}
      h="auto"
      shadow="sm"
      padding="xl"
      component="a"
      href={`projects/${getProjectSlug(project)}`}
      target="_blank"
      styles={{
        root: {
          boxShadow: hovered ? "6px 6px 2px 1px black" : "none",
          transition: "all 500ms ease-out",
        },
      }}
    >
      <Card.Section>
        <Image
          loading="lazy"
          src={project?.image}
          h={350}
          alt={project?.title}
          fallbackSrc="https://placehold.co/600x400?text=..."
        />
      </Card.Section>

      <Stack justify="space-between" h="100%" gap="sm">
        <Stack gap="sm" mt="md">
          <Flex direction="column">
            <Text size="sm">
              {new Intl.DateTimeFormat("en-EN", {
                dateStyle: "medium",
              }).format(project.deadline)}
            </Text>
            {/* fixed two-line title area keeps every card aligned */}
            <Text fw={500} size="lg" lineClamp={2} h="3.4em">
              {project?.title}
            </Text>
          </Flex>

          <Group gap="sm" wrap="nowrap">
            <IconTargetArrow />

            <Text size="sm">
              {project?.amount}/{project?.goals} ETH
            </Text>
          </Group>

          {/* fixed four-line description area */}
          <Text c="dimmed" size="sm" lineClamp={4} h="6.4em">
            {project?.description}
          </Text>
        </Stack>

        <Group>
          <Button rightSection={<IconArrowRight />}>Detail</Button>
        </Group>
      </Stack>
    </Card>
  );
};

export const ExploreCard = memo(ExploreCardComponent);
