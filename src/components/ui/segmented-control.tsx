import { SegmentedControl as MantineSegmentedControl } from '@mantine/core'
import type { SegmentedControlProps } from '@mantine/core'

type PropTypes = SegmentedControlProps

function SegmentedControl({ ...props }: PropTypes) {
  return <MantineSegmentedControl {...props} />
}

export default SegmentedControl
