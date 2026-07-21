// CustomHoverCard.tsx
import { HoverCard } from '@mantine/core'
import type { HoverCardProps } from '@mantine/core'
import classes from './hover.module.css'
import Paper from '../paper/paper'

interface HoverCardInterface extends HoverCardProps {
  trigger: React.ReactNode
  children: React.ReactNode
}

const Hover = ({
  trigger,
  children,
  openDelay = 100,
  closeDelay = 150,

  shadow = 'sm',
  withArrow = true,
  position = 'top',
  arrowSize = 15,

  classNames,
  ...props
}: HoverCardInterface) => {
  return (
    <HoverCard
      openDelay={openDelay}
      closeDelay={closeDelay}
      position={position}
      arrowSize={arrowSize}
      shadow={shadow}
      withArrow={withArrow}
      classNames={{
        dropdown: classes.dropdown,

        arrow: classes.arrow,
        ...classNames,
      }}
      {...props}
    >
      <HoverCard.Target>{trigger}</HoverCard.Target>

      <HoverCard.Dropdown>{children}</HoverCard.Dropdown>
    </HoverCard>
  )
}

export default Hover
