import { Pill as MantinePipp } from '@mantine/core'

type PropTypes = {
  children: React.ReactNode
}

const Pill = ({ children }: PropTypes) => {
  return <MantinePipp>{children}</MantinePipp>
}

export default Pill
