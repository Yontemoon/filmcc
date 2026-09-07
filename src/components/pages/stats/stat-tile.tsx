import { Group, Stack, Text, ThemeIcon, Card } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import classes from './stats.module.css'

type PropTypes = {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
}

const StatTile = ({ label, value, hint, icon: Icon }: PropTypes) => {
  return (
    <Card withBorder radius="xs" p="md" shadow="xs" className={classes.tile}>
      <Stack gap={6}>
        <Group gap={8} wrap="nowrap">
          <ThemeIcon variant="light" color="gray" radius="xs" size="sm">
            <Icon size={14} />
          </ThemeIcon>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
        </Group>

        <Text fw={700} fz={32} lh={1.1}>
          {value}
        </Text>

        {hint ? (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}

export default StatTile
