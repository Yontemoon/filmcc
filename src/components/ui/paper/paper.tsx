import { Paper as PaperMantine } from '@mantine/core'
import type { PaperProps } from '@mantine/core'
import classes from './paper.module.css'

interface CustomPaperProps extends PaperProps {
  children: React.ReactNode
}

const Paper = ({ children, ...props }: CustomPaperProps) => {
  return (
    <PaperMantine
      className={`${classes.paperContainer} ${props.className}`}
      {...props}
    >
      {children}
    </PaperMantine>
  )
}

export default Paper
