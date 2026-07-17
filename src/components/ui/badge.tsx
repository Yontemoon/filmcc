import { Badge as MantineBadge } from '@mantine/core'
import type { BadgeProps } from '@mantine/core'

interface PropTypes extends BadgeProps {
  children: React.ReactNode
}

const Badge = ({ children, ...props }: PropTypes) => {
  return <MantineBadge {...props}>{children}</MantineBadge>
}

export default Badge
